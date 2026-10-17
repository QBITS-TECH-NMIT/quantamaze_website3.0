"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import styles from "@/app/admin/results/results-admin.module.css";
import { MEMBER_GROUPS } from "@/lib/memberGroups";

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

const EMPTY_FORM = {
  groupId: "operations",
  name: "",
  role: "Member",
  code: "",
  photoUrl: "",
  imagePosition: "",
  isHead: false,
  isTopLeadership: false,
};

function formFromMember(member) {
  return {
    groupId: member.group_id,
    name: member.name,
    role: member.role,
    code: member.code || "",
    photoUrl: member.photo_url || "",
    imagePosition: member.image_position || "",
    isHead: member.is_head,
    isTopLeadership: member.is_top_leadership,
  };
}

export default function MembersAdminExperience() {
  const [supabase] = useState(getSupabaseClient);
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(() => !supabase);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [groupFilter, setGroupFilter] = useState("all");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState(() => (
    supabase ? "" : "Admin sign-in is not configured. Set the Supabase public URL and anon key, then restart the app."
  ));
  const [noticeIsError, setNoticeIsError] = useState(() => !supabase);

  const showNotice = useCallback((message, isError = false) => {
    setNotice(message);
    setNoticeIsError(isError);
  }, []);

  const setField = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const authHeaders = useCallback((extra = {}) => ({
    ...extra,
    Authorization: `Bearer ${session?.access_token}`,
  }), [session]);

  const loadMembers = useCallback(async (accessToken) => {
    const response = await fetch("/api/members", {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    const data = await readResponse(response);
    if (!Array.isArray(data.members)) throw new Error("The members response was invalid.");
    setMembers(data.members);
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
          loadMembers(restoredSession.access_token).catch((loadError) => {
            if (active) showNotice(loadError.message, true);
          });
        }
      } catch (error) {
        if (!active) return;
        console.error("Could not restore members admin session:", error);
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
        loadMembers(nextSession.access_token).catch((error) => showNotice(error.message, true));
      } else {
        setMembers([]);
      }
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadMembers, showNotice, supabase]);

  const handleSignIn = async (event) => {
    event.preventDefault();
    if (!supabase) {
      showNotice("Supabase sign-in is not configured.", true);
      return;
    }
    setBusy(true);
    setNotice("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      setSession(data.session);
      setPassword("");
    } catch (error) {
      console.error("Could not sign in to members admin:", error);
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
      setMembers([]);
      showNotice("You have signed out.");
    } catch (error) {
      console.error("Could not sign out of members admin:", error);
      showNotice("Could not sign out. Please try again.", true);
    } finally {
      setBusy(false);
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleEdit = (member) => {
    setForm(formFromMember(member));
    setEditingId(member.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !session?.access_token) return;
    setUploading(true);
    setNotice("");
    try {
      const data = new FormData();
      data.append("file", file);
      const response = await fetch("/api/members/photo", {
        method: "POST",
        headers: authHeaders(),
        body: data,
      });
      const { url } = await readResponse(response);
      setForm((current) => ({ ...current, photoUrl: url }));
      showNotice("Photo uploaded. Save the member to use it.");
    } catch (error) {
      showNotice(error.message, true);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!session?.access_token) return;
    setBusy(true);
    setNotice("");
    const payload = {
      group_id: form.groupId,
      name: form.name,
      role: form.role,
      code: form.code,
      photo_url: form.photoUrl,
      image_position: form.imagePosition,
      is_head: form.isHead,
      is_top_leadership: form.groupId === "leadership" ? form.isTopLeadership : false,
    };
    try {
      const response = await fetch(editingId ? `/api/members/${editingId}` : "/api/members", {
        method: editingId ? "PATCH" : "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });
      const { member } = await readResponse(response);
      setMembers((current) => (
        editingId ? current.map((item) => (item.id === member.id ? member : item)) : [...current, member]
      ));
      showNotice(editingId ? "Member updated." : "Member added. It appears on the members page within about a minute.");
      resetForm();
    } catch (error) {
      showNotice(error.message, true);
    } finally {
      setBusy(false);
    }
  };

  const handleToggleActive = async (member) => {
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch(`/api/members/${member.id}`, {
        method: "PATCH",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ active: !member.active }),
      });
      const { member: updated } = await readResponse(response);
      setMembers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      showNotice(updated.active ? `${updated.name} is visible again.` : `${updated.name} is hidden from the members page.`);
    } catch (error) {
      showNotice(error.message, true);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (member) => {
    if (!window.confirm(`Permanently delete ${member.name}? Use Hide if you might want them back.`)) return;
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch(`/api/members/${member.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      await readResponse(response);
      setMembers((current) => current.filter((item) => item.id !== member.id));
      if (editingId === member.id) resetForm();
      showNotice(`${member.name} was deleted.`);
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
          <p className={styles.eyebrow}>Q-Bits · Member management</p>
          <h1 className={styles.title}>Admin sign in</h1>
          <p className={styles.subheading}>Use an authorized Supabase account to manage team members.</p>
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

  const visibleGroups = MEMBER_GROUPS.filter((group) => groupFilter === "all" || group.id === groupFilter);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Q-Bits · Member management</p>
            <h1 className={styles.title}>Members</h1>
            <p className={styles.subheading}>Add, edit, hide or remove people on the public members page.</p>
          </div>
          <button className={styles.signOut} type="button" onClick={handleSignOut} disabled={busy}>Sign out</button>
        </header>

        <nav className={styles.toolbar} aria-label="Admin pages">
          <Link className={styles.editButton} href="/admin/results">Manage team results</Link>
          <Link className={styles.editButton} href="/admin/sponsors">Manage sponsors</Link>
          <Link className={styles.editButton} href="/members">View public members page</Link>
        </nav>

        {notice && <p className={`${styles.notice} ${noticeIsError ? styles.noticeError : ""}`} role={noticeIsError ? "alert" : "status"}>{notice}</p>}

        <section className={styles.formPanel} aria-labelledby="member-form-heading">
          <h2 className={styles.formTitle} id="member-form-heading">{editingId ? "Edit member" : "Add a member"}</h2>
          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              Name
              <input maxLength={100} required value={form.name} onChange={setField("name")} />
            </label>
            <label className={styles.field}>
              Group
              <select value={form.groupId} onChange={setField("groupId")}>
                {MEMBER_GROUPS.map((group) => <option value={group.id} key={group.id}>{group.label}</option>)}
              </select>
            </label>
            <label className={styles.field}>
              Role
              <input maxLength={80} placeholder="Member, Head, Lead…" value={form.role} onChange={setField("role")} />
            </label>
            <label className={styles.field}>
              Code (optional)
              <input maxLength={20} placeholder="OP-09" value={form.code} onChange={setField("code")} />
            </label>
            <label className={styles.field}>
              Photo (JPG, PNG or WebP, under 4 MB)
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoUpload} disabled={uploading || busy} />
            </label>
            <label className={styles.field}>
              Photo URL {uploading ? "(uploading…)" : "(filled in by the upload, or paste one)"}
              <input maxLength={2048} placeholder="https://… or /team-photos/…" value={form.photoUrl} onChange={setField("photoUrl")} />
            </label>
            {form.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.photoUrl} alt="Photo preview" style={{ width: 96, height: 96, objectFit: "cover", borderRadius: "50%" }} />
            )}
            <label className={styles.field}>
              Photo focus (optional)
              <input maxLength={40} placeholder="50% 18%" value={form.imagePosition} onChange={setField("imagePosition")} />
            </label>
            <label className={styles.field}>
              <span><input type="checkbox" checked={form.isHead} onChange={setField("isHead")} /> Domain head</span>
            </label>
            {form.groupId === "leadership" && (
              <label className={styles.field}>
                <span><input type="checkbox" checked={form.isTopLeadership} onChange={setField("isTopLeadership")} /> Top leadership (President / VP)</span>
              </label>
            )}
            <button className={styles.submit} type="submit" disabled={busy || uploading}>
              {busy ? "Saving…" : editingId ? "Save changes" : "Add member"}
            </button>
            {editingId && (
              <button className={styles.cancelEdit} type="button" onClick={resetForm} disabled={busy}>Cancel edit</button>
            )}
          </form>
        </section>

        <label className={styles.field}>
          Show group
          <select value={groupFilter} onChange={(event) => setGroupFilter(event.target.value)}>
            <option value="all">All groups</option>
            {MEMBER_GROUPS.map((group) => <option value={group.id} key={group.id}>{group.label}</option>)}
          </select>
        </label>

        {visibleGroups.map((group) => {
          const groupMembers = members.filter((member) => member.group_id === group.id);
          return (
            <section className={styles.column} key={group.id} aria-labelledby={`group-${group.id}`}>
              <header className={styles.columnHeader}>
                <h2 className={styles.columnTitle} id={`group-${group.id}`}>{group.label}</h2>
                <span className={styles.count}>{groupMembers.length}</span>
              </header>
              <div className={styles.teamList}>
                {groupMembers.length ? groupMembers.map((member) => (
                  <article className={styles.teamRow} key={member.id} style={member.active ? undefined : { opacity: 0.5 }}>
                    <div className={styles.teamCopy}>
                      <span className={styles.teamName}>{member.name}{member.active ? "" : " (hidden)"}</span>
                      <span className={styles.teamLead}>{member.role}{member.code ? ` · ${member.code}` : ""}{member.photo_url ? "" : " · no photo"}</span>
                    </div>
                    <button className={styles.editButton} type="button" onClick={() => handleEdit(member)} disabled={busy}>Edit</button>
                    <button className={styles.editButton} type="button" onClick={() => handleToggleActive(member)} disabled={busy}>
                      {member.active ? "Hide" : "Show"}
                    </button>
                    <button className={styles.deleteButton} type="button" onClick={() => handleDelete(member)} disabled={busy}>Delete</button>
                  </article>
                )) : <p className={styles.empty}>No members in this group.</p>}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
