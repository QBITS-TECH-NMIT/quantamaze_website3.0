"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import styles from "@/app/admin/results/results-admin.module.css";
import { RESULT_TRACKS } from "@/lib/resultTracks";

const STATUSES = [
  { value: "selected", label: "Selected" },
  { value: "waiting_list", label: "Waiting list" },
];

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

export default function ResultsAdminExperience() {
  const [supabase] = useState(getSupabaseClient);
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(() => !supabase);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState(["", ""]);
  const [status, setStatus] = useState("selected");
  const [track, setTrack] = useState(RESULT_TRACKS[0]);
  const [teams, setTeams] = useState([]);
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [notice, setNotice] = useState(() => (
    supabase ? "" : "Admin sign-in is not configured. Set the Supabase public URL and anon key, then restart the app."
  ));
  const [noticeIsError, setNoticeIsError] = useState(() => !supabase);

  const showNotice = useCallback((message, isError = false) => {
    setNotice(message);
    setNoticeIsError(isError);
  }, []);

  const loadTeams = useCallback(async (accessToken) => {
    const response = await fetch("/api/results", {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    const data = await readResponse(response);
    setTeams(data.teams);
  }, []);

  useEffect(() => {
    if (!supabase) return undefined;

    let active = true;
    supabase.auth.getSession().then(async ({ data, error }) => {
      if (!active) return;
      if (error) showNotice("Could not restore your admin session. Please sign in again.", true);
      const restoredSession = data?.session || null;
      setSession(restoredSession);
      if (restoredSession?.access_token) {
        try {
          await loadTeams(restoredSession.access_token);
        } catch (loadError) {
          if (active) showNotice(loadError.message, true);
        }
      }
      setAuthReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.access_token) {
        loadTeams(nextSession.access_token).catch((error) => showNotice(error.message, true));
      } else {
        setTeams([]);
      }
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadTeams, showNotice, supabase]);

  const groupedTeams = useMemo(() => ({
    selected: teams.filter((team) => team.status === "selected"),
    waiting_list: teams.filter((team) => team.status === "waiting_list"),
  }), [teams]);

  const handleSignIn = async (event) => {
    event.preventDefault();
    if (!supabase) {
      showNotice("Supabase sign-in is not configured.", true);
      return;
    }
    setBusy(true);
    setNotice("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (error) {
      showNotice("Sign-in failed. Check your email and password, and confirm your account is authorized.", true);
      return;
    }
    setSession(data.session);
    setPassword("");
  };

  const handleSignOut = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signOut();
    setBusy(false);
    if (error) {
      showNotice("Could not sign out. Please try again.", true);
      return;
    }
    setSession(null);
    setTeams([]);
    showNotice("You have signed out.");
  };

  const handleAddTeam = async (event) => {
    event.preventDefault();
    if (!session?.access_token) return;
    const normalizedMembers = members.map((member) => member.trim());
    if (normalizedMembers.some((member) => !member)) {
      showNotice("Enter a name for every team member.", true);
      return;
    }
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch("/api/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ name: teamName, members: normalizedMembers, status, track }),
      });
      await readResponse(response);
      setTeamName("");
      setMembers(["", ""]);
      await loadTeams(session.access_token);
      showNotice("Team result added.");
    } catch (error) {
      showNotice(error.message, true);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (team) => {
    if (!session?.access_token || !window.confirm(`Delete the result for ${team.name}?`)) return;
    setDeletingId(team.id);
    setNotice("");
    try {
      const response = await fetch("/api/results", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id: team.id }),
      });
      await readResponse(response);
      await loadTeams(session.access_token);
      showNotice("Team result deleted.");
    } catch (error) {
      showNotice(error.message, true);
    } finally {
      setDeletingId("");
    }
  };

  if (!authReady) {
    return <main className={styles.page}><div className={styles.container} role="status">Loading admin sign-in…</div></main>;
  }

  if (!session) {
    return (
      <main className={styles.page}>
        <section className={styles.loginPanel}>
          <p className={styles.eyebrow}>Q-Bits · Phase 1 results management</p>
          <h1 className={styles.title}>Admin sign in</h1>
          <p className={styles.subheading}>Use an authorized Supabase account to manage selected and waiting-list teams.</p>
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
            <p className={styles.eyebrow}>Q-Bits · Phase 1 results management</p>
            <h1 className={styles.title}>Phase 1 team results</h1>
            <p className={styles.subheading}>Add results, review both lists, or remove a team.</p>
          </div>
          <button className={styles.signOut} type="button" onClick={handleSignOut} disabled={busy}>Sign out</button>
        </header>

        {notice && <p className={`${styles.notice} ${noticeIsError ? styles.noticeError : ""}`} role={noticeIsError ? "alert" : "status"}>{notice}</p>}

        <section className={styles.formPanel} aria-labelledby="add-team-heading">
          <h2 className={styles.formTitle} id="add-team-heading">Add a team result</h2>
          <form className={styles.form} onSubmit={handleAddTeam}>
            <label className={styles.field}>
              Team name
              <input maxLength={60} required value={teamName} onChange={(event) => setTeamName(event.target.value)} />
            </label>
            <label className={styles.field}>
              Number of members
              <select
                value={members.length}
                onChange={(event) => {
                  const count = Number(event.target.value);
                  setMembers((current) => Array.from({ length: count }, (_, index) => current[index] || ""));
                }}
              >
                {[2, 3, 4].map((count) => <option value={count} key={count}>{count} members</option>)}
              </select>
            </label>
            {members.map((member, index) => (
              <label className={styles.field} key={index}>
                {index === 0 ? "Member 1 (Team lead)" : `Member ${index + 1}`}
                <input
                  maxLength={60}
                  required
                  value={member}
                  onChange={(event) => setMembers((current) => current.map((name, memberIndex) => (
                    memberIndex === index ? event.target.value : name
                  )))}
                />
              </label>
            ))}
            <label className={styles.field}>
              Result column
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                {STATUSES.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className={styles.field}>
              Track
              <select value={track} onChange={(event) => setTrack(event.target.value)}>
                {RESULT_TRACKS.map((resultTrack) => <option value={resultTrack} key={resultTrack}>{resultTrack}</option>)}
              </select>
            </label>
            <button className={styles.submit} type="submit" disabled={busy}>
              {busy ? "Saving…" : "Add team"}
            </button>
          </form>
        </section>

        <div className={styles.toolbar} role="status">
          {busy ? "Updating results…" : `${teams.length} ${teams.length === 1 ? "team" : "teams"} in the lists`}
        </div>

        <div className={styles.board}>
          {STATUSES.map((column) => (
            <section className={styles.column} key={column.value} aria-labelledby={`column-${column.value}`}>
              <header className={styles.columnHeader}>
                <h2 className={styles.columnTitle} id={`column-${column.value}`}>{column.label}</h2>
                <span className={styles.count}>{groupedTeams[column.value].length}</span>
              </header>
              <div className={styles.teamList}>
                {groupedTeams[column.value].length ? groupedTeams[column.value].map((team) => (
                  <article className={styles.teamRow} key={team.id}>
                    <div className={styles.teamCopy}>
                      <span className={styles.teamName}>{team.name}</span>
                      {(team.members || [{ name: team.team_lead_name, role: "Team Lead" }]).map((member, index) => (
                        <span className={styles.teamLead} key={`${team.id}-${index}`}>
                          {member.role === "Team Lead" ? "Lead" : `Member ${index + 1}`}: {member.name}
                        </span>
                      ))}
                      <span className={styles.teamLead}>Track: {team.track || "Not assigned"}</span>
                    </div>
                    <button
                      className={styles.deleteButton}
                      type="button"
                      onClick={() => handleDelete(team)}
                      disabled={deletingId === team.id || busy}
                      aria-label={`Delete ${team.name}`}
                    >
                      {deletingId === team.id ? "Deleting…" : "Delete"}
                    </button>
                  </article>
                )) : <p className={styles.empty}>No teams in this column yet.</p>}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
