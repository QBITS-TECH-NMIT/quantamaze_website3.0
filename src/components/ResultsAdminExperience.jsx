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

function sortByRank(teams) {
  return [...teams].sort((first, second) => (
    RESULT_TRACKS.indexOf(first.track) - RESULT_TRACKS.indexOf(second.track) ||
    first.result_rank - second.result_rank
  ));
}

function getNextRank(teams, selectedTrack, excludedTeamId = "") {
  const rank = teams
    .filter((team) => team.track === selectedTrack && team.id !== excludedTeamId)
    .reduce((highestRank, team) => Math.max(highestRank, Number(team.result_rank) || 0), 0) + 1;
  return String(Math.min(rank, 15));
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
  const [teamLeadName, setTeamLeadName] = useState("");
  const [resultRank, setResultRank] = useState("1");
  const [status, setStatus] = useState("selected");
  const [track, setTrack] = useState(RESULT_TRACKS[0]);
  const [teams, setTeams] = useState([]);
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [editingTeamId, setEditingTeamId] = useState("");
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
    setTeams(sortByRank(data.teams));
    return data.teams;
  }, []);

  useEffect(() => {
    if (!supabase) return undefined;

    let active = true;
    let restoreTimedOut = false;
    const restoreTimeout = window.setTimeout(() => {
      if (!active) return;
      restoreTimedOut = true;
      setAuthReady(true);
      showNotice("Could not restore your admin session. Please sign in again.", true);
    }, 3000);

    const restoreSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!active) return;
        window.clearTimeout(restoreTimeout);
        if (error) showNotice("Could not restore your admin session. Please sign in again.", true);
        else if (restoreTimedOut) showNotice("");

        const restoredSession = data?.session || null;
        setSession(restoredSession);
        setAuthReady(true);
        if (restoredSession?.access_token) {
          loadTeams(restoredSession.access_token).catch((loadError) => {
            if (active) showNotice(loadError.message, true);
          }).then((loadedTeams) => {
            if (active && loadedTeams) setResultRank(getNextRank(loadedTeams, RESULT_TRACKS[0]));
          });
        }
      } catch (restoreError) {
        if (!active) return;
        window.clearTimeout(restoreTimeout);
        console.error("Could not restore results admin session:", restoreError);
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
        loadTeams(nextSession.access_token)
          .then((loadedTeams) => {
            if (active) setResultRank(getNextRank(loadedTeams, RESULT_TRACKS[0]));
          })
          .catch((error) => showNotice(error.message, true));
      } else {
        setTeams([]);
      }
    });
    return () => {
      active = false;
      window.clearTimeout(restoreTimeout);
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

  const resetTeamForm = (currentTeams = teams) => {
    setTeamName("");
    setTeamLeadName("");
    setResultRank(getNextRank(currentTeams, RESULT_TRACKS[0]));
    setStatus("selected");
    setTrack(RESULT_TRACKS[0]);
    setEditingTeamId("");
  };

  const handleSaveTeam = async (event) => {
    event.preventDefault();
    if (!session?.access_token) return;
    if (!teamLeadName.trim()) {
      showNotice("Enter the team lead's name.", true);
      return;
    }
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch("/api/results", {
        method: editingTeamId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          ...(editingTeamId ? { id: editingTeamId } : {}),
          name: teamName,
          team_lead_name: teamLeadName,
          result_rank: Number(resultRank),
          status,
          track,
        }),
      });
      const wasEditing = Boolean(editingTeamId);
      const oldTeam = wasEditing ? teams.find((team) => team.id === editingTeamId) : null;
      const oldRank = Number(oldTeam?.result_rank);
      const { team: savedTeam } = await readResponse(response);
      const targetRank = Number(savedTeam.result_rank);
      const nextTeams = wasEditing
        ? sortByRank(teams.map((team) => {
          if (team.id === savedTeam.id) return savedTeam;
          if (oldTeam?.track === savedTeam.track) {
            if (team.track !== savedTeam.track) return team;
            if (targetRank < oldRank && team.result_rank >= targetRank && team.result_rank < oldRank) {
              return { ...team, result_rank: team.result_rank + 1 };
            }
            if (targetRank > oldRank && team.result_rank > oldRank && team.result_rank <= targetRank) {
              return { ...team, result_rank: team.result_rank - 1 };
            }
          } else {
            if (team.track === oldTeam?.track && team.result_rank > oldRank) {
              return { ...team, result_rank: team.result_rank - 1 };
            }
            if (team.track === savedTeam.track && team.result_rank >= targetRank) {
              return { ...team, result_rank: team.result_rank + 1 };
            }
          }
          return team;
        }))
        : sortByRank([
          ...teams.map((team) => (
            team.track === savedTeam.track && team.result_rank >= targetRank
              ? { ...team, result_rank: team.result_rank + 1 }
              : team
          )),
          savedTeam,
        ]);
      setTeams(nextTeams);
      setTrack(RESULT_TRACKS[0]);
      resetTeamForm(nextTeams);
      showNotice(wasEditing ? "Team result updated." : "Team result added.");
    } catch (error) {
      showNotice(error.message, true);
    } finally {
      setBusy(false);
    }
  };

  const handleEdit = (team) => {
    setEditingTeamId(team.id);
    setTeamName(team.name);
    setTeamLeadName(team.team_lead_name || "");
    setResultRank(String(team.result_rank));
    setStatus(team.status);
    setTrack(RESULT_TRACKS.includes(team.track) ? team.track : RESULT_TRACKS[0]);
    setNotice("");
    document.getElementById("add-team-heading")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleTrackChange = (nextTrack) => {
    setTrack(nextTrack);
    setResultRank((currentRank) => {
      const availableRanks = teams.filter(
        (team) => team.track === nextTrack && team.id !== editingTeamId,
      ).length + 1;
      const rank = Number(currentRank);
      return String(Math.max(1, Math.min(rank, availableRanks, 15)));
    });
  };

  const selectedTrackCount = teams.filter(
    (team) => team.track === track && team.id !== editingTeamId,
  ).length;
  const trackIsFull = selectedTrackCount >= 15;

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
      setTeams(sortByRank(teams
        .filter((existingTeam) => existingTeam.id !== team.id)
        .map((existingTeam) => (
            existingTeam.track === team.track && existingTeam.result_rank > team.result_rank
            ? { ...existingTeam, result_rank: existingTeam.result_rank - 1 }
            : existingTeam
        ))));
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
            <p className={styles.subheading}>Add or edit results, review both lists, or remove a team.</p>
          </div>
          <button className={styles.signOut} type="button" onClick={handleSignOut} disabled={busy}>Sign out</button>
        </header>

        {notice && <p className={`${styles.notice} ${noticeIsError ? styles.noticeError : ""}`} role={noticeIsError ? "alert" : "status"}>{notice}</p>}

        <section className={styles.formPanel} aria-labelledby="add-team-heading">
          <h2 className={styles.formTitle} id="add-team-heading">{editingTeamId ? "Edit team result" : "Add a team result"}</h2>
          <form className={styles.form} onSubmit={handleSaveTeam}>
            <label className={styles.field}>
              Team name
              <input maxLength={60} required value={teamName} onChange={(event) => setTeamName(event.target.value)} />
            </label>
            <label className={styles.field}>
              Team lead name
              <input maxLength={60} required value={teamLeadName} onChange={(event) => setTeamLeadName(event.target.value)} />
            </label>
            <label className={styles.field}>
              Result column
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                {STATUSES.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className={styles.field}>
              Track
              <select value={track} onChange={(event) => handleTrackChange(event.target.value)}>
                {RESULT_TRACKS.map((resultTrack) => <option value={resultTrack} key={resultTrack}>{resultTrack}</option>)}
              </select>
            </label>
            <label className={styles.field}>
              Rank in this track
              <select required value={resultRank} onChange={(event) => setResultRank(event.target.value)}>
                {Array.from({
                  length: Math.min(
                    15,
                    teams.filter((team) => team.track === track && team.id !== editingTeamId).length + 1,
                  ),
                }, (_, index) => index + 1).map((rank) => <option value={rank} key={rank}>{rank}</option>)}
              </select>
            </label>
            <button className={styles.submit} type="submit" disabled={busy || trackIsFull}>
              {busy ? "Saving…" : trackIsFull ? "Track is full (15 teams)" : editingTeamId ? "Save changes" : "Add team"}
            </button>
            {editingTeamId && (
              <button className={styles.cancelEdit} type="button" onClick={resetTeamForm} disabled={busy}>
                Cancel edit
              </button>
            )}
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
                      <span className={styles.teamLead}>Rank in {team.track || "unassigned track"}: {team.result_rank}</span>
                      <span className={styles.teamLead}>Team lead: {team.team_lead_name}</span>
                      <span className={styles.teamLead}>Track: {team.track || "Not assigned"}</span>
                    </div>
                    <button
                      className={styles.editButton}
                      type="button"
                      onClick={() => handleEdit(team)}
                      disabled={busy || Boolean(deletingId)}
                      aria-label={`Edit ${team.name}`}
                    >
                      Edit
                    </button>
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
