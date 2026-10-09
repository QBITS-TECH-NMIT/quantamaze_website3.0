"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import styles from "@/app/admin/results/results-admin.module.css";
import { SPONSOR_TIER_OPTIONS } from "@/lib/sponsorTiers";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey);
}

async function readResponse(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "The request could not be completed.");
  return body;
}

export default function SponsorsAdminExperience() {
  const [supabase] = useState(getSupabaseClient);
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(() => !supabase);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [tierId, setTierId] = useState(SPONSOR_TIER_OPTIONS[0].id);
  const [url, setUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [sponsors, setSponsors] = useState([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(() => (
    supabase ? "" : "Admin sign-in is not configured. Set the Supabase public URL and anon key, then restart the app."
  ));
  const [noticeIsError, setNoticeIsError] = useState(() => !supabase);

  const showNotice = useCallback((message, isError = false) => {
    setNotice(message);
    setNoticeIsError(isError);
  }, []);

  const loadSponsors = useCallback(async (accessToken) => {
    const response = await fetch("/api/sponsors", {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    const data = await readResponse(response);
    if (!Array.isArray(data.sponsors)) throw new Error("The sponsors response was invalid.");
    setSponsors(data.sponsors);
  }, []);

  useEffect(() => {
    if (!supabase) return undefined;

    let active = true;
    const restoreSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!active) return;
        if (error) showNotice("Could not restore your admin session. Please sign in again.", true);
        const restoredSession = data?.session || null;
        setSession(restoredSession);
        setAuthReady(true);
        if (restoredSession?.access_token) {
          loadSponsors(restoredSession.access_token).catch((loadError) => {
            if (active) showNotice(loadError.message, true);
          });
        }
      } catch (error) {
        if (!active) return;
        console.error("Could not restore sponsors admin session:", error);
        showNotice("Could not restore your admin session. Please sign in again.", true);
        setAuthReady(true);
      }
    };
    restoreSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setAuthReady(true);
      if (nextSession?.access_token) {
        loadSponsors(nextSession.access_token).catch((error) => showNotice(error.message, true));
      } else {
        setSponsors([]);
      }
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadSponsors, showNotice, supabase]);

  const handleSignIn = async (event) => {
    event.preventDefault();
    if (!supabase) {
      showNotice("Supabase sign-in is not configured.", true);
      return;
    }
    setBusy(true);
    setNotice("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      setSession(data.session);
      setPassword("");
    } catch (error) {
      console.error("Could not sign in to sponsors admin:", error);
      showNotice("Sign-in failed. Check your email and password, and confirm your account is authorized.", true);
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      setSponsors([]);
      showNotice("You have signed out.");
    } catch (error) {
      console.error("Could not sign out of sponsors admin:", error);
      showNotice("Could not sign out. Please try again.", true);
    } finally {
      setBusy(false);
    }
  };

  const handleAddSponsor = async (event) => {
    event.preventDefault();
    if (!session?.access_token) return;
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch("/api/sponsors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name,
          tier_id: tierId,
          url,
          logo_url: logoUrl,
        }),
      });
      const { sponsor } = await readResponse(response);
      setSponsors((current) => [...current, sponsor]);
      setName("");
      setTierId(SPONSOR_TIER_OPTIONS[0].id);
      setUrl("");
      setLogoUrl("");
      showNotice("Sponsor added to the public sponsors page.");
    } catch (error) {
      showNotice(error.message, true);
    } finally {
      setBusy(false);
    }
  };

  if (!authReady) {
    return <main className={styles.page}><div className={styles.container} role="status">Loading admin sign-in…</div></main>;
  }

  if (!session) {
    return (
      <main className={styles.page}>
        <section className={styles.loginPanel}>
          <p className={styles.eyebrow}>Q-Bits · Sponsor management</p>
          <h1 className={styles.title}>Admin sign in</h1>
          <p className={styles.subheading}>Use an authorized Supabase account to manage sponsors.</p>
          {notice && <p className={`${styles.notice} ${noticeIsError ? styles.noticeError : ""}`} role={noticeIsError ? "alert" : "status"}>{notice}</p>}
          <form className={styles.loginForm} onSubmit={handleSignIn}>
            <label className={styles.field}>
              Email
              <input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label className={styles.field}>
              Password
              <input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            <button className={styles.submit} type="submit" disabled={busy || !supabase}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Q-Bits · Sponsor management</p>
            <h1 className={styles.title}>Sponsors</h1>
            <p className={styles.subheading}>Add sponsors to an existing tier. Existing sponsor details and styles remain unchanged.</p>
          </div>
          <button className={styles.signOut} type="button" onClick={handleSignOut} disabled={busy}>Sign out</button>
        </header>

        <nav className={styles.toolbar} aria-label="Admin pages">
          <Link className={styles.editButton} href="/admin/results">Manage team results</Link>
          <Link className={styles.editButton} href="/sponsors">View public sponsors page</Link>
        </nav>

        {notice && <p className={`${styles.notice} ${noticeIsError ? styles.noticeError : ""}`} role={noticeIsError ? "alert" : "status"}>{notice}</p>}

        <section className={styles.formPanel} aria-labelledby="add-sponsor-heading">
          <h2 className={styles.formTitle} id="add-sponsor-heading">Add a sponsor</h2>
          <form className={styles.form} onSubmit={handleAddSponsor}>
            <label className={styles.field}>
              Sponsor name
              <input maxLength={100} required value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label className={styles.field}>
              Sponsor tier
              <select value={tierId} onChange={(event) => setTierId(event.target.value)}>
                {SPONSOR_TIER_OPTIONS.map((tier) => <option value={tier.id} key={tier.id}>{tier.label}</option>)}
              </select>
            </label>
            <label className={styles.field}>
              Sponsor website URL
              <input type="url" maxLength={2048} placeholder="https://example.com" required value={url} onChange={(event) => setUrl(event.target.value)} />
            </label>
            <label className={styles.field}>
              Public logo image URL
              <input type="url" maxLength={2048} placeholder="https://example.com/logo.png" required value={logoUrl} onChange={(event) => setLogoUrl(event.target.value)} />
            </label>
            <button className={styles.submit} type="submit" disabled={busy}>
              {busy ? "Adding sponsor…" : "Add sponsor"}
            </button>
          </form>
        </section>

        <section className={styles.column} aria-labelledby="current-sponsors-heading">
          <header className={styles.columnHeader}>
            <h2 className={styles.columnTitle} id="current-sponsors-heading">Added sponsors</h2>
            <span className={styles.count}>{sponsors.length}</span>
          </header>
          <div className={styles.teamList}>
            {sponsors.length ? sponsors.map((sponsor) => (
              <article className={styles.teamRow} key={sponsor.id}>
                <div className={styles.teamCopy}>
                  <span className={styles.teamName}>{sponsor.name}</span>
                  <span className={styles.teamLead}>{SPONSOR_TIER_OPTIONS.find((tier) => tier.id === sponsor.tier_id)?.label}</span>
                  <span className={styles.teamLead}>{sponsor.url}</span>
                </div>
              </article>
            )) : <p className={styles.empty}>No sponsors have been added from admin yet.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
