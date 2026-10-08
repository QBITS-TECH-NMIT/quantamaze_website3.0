"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import styles from "@/app/results/results.module.css";

function CountUp({ value }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      const frameId = window.requestAnimationFrame(() => setCount(value));
      return () => window.cancelAnimationFrame(frameId);
    }

    const startTime = performance.now();
    const duration = 900;
    let frameId;

    const animateCount = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const easedProgress = 1 - (1 - progress) ** 3;
      setCount(Math.round(value * easedProgress));
      if (progress < 1) frameId = window.requestAnimationFrame(animateCount);
    };

    frameId = window.requestAnimationFrame(animateCount);
    return () => window.cancelAnimationFrame(frameId);
  }, [value]);

  return <span>{count}</span>;
}

function initialsFor(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function TeamLeadDetails({ name }) {
  return (
    <li className={`${styles.memberRow} ${styles.leadRow}`}>
      <span className={styles.avatar} aria-hidden="true">{initialsFor(name)}</span>
      <span className={styles.memberCopy}>
        <span className={styles.memberNameLine}>
          <span className={styles.memberName}>{name}</span>
          <span className={styles.leadBadge}>Lead</span>
        </span>
        <span className={styles.memberRole}>Team Lead</span>
      </span>
    </li>
  );
}

function TeamCard({ team, index, openId, pinnedId, setOpenId, setPinnedId }) {
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion();
  const cardRef = useRef(null);
  const isOpen = openId === team.id;
  const contentId = `team-lead-${team.id}`;

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return undefined;

    if (!("IntersectionObserver" in window)) {
      const frameId = window.requestAnimationFrame(() => setVisible(true));
      return () => window.cancelAnimationFrame(frameId);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  const handlePointerEnter = (event) => {
    if (event.pointerType !== "mouse") return;
    setPinnedId(null);
    setOpenId(team.id);
  };

  const handlePointerLeave = (event) => {
    if (event.pointerType !== "mouse" || pinnedId === team.id) return;
    setOpenId((currentId) => currentId === team.id ? null : currentId);
  };

  const handlePointerMove = (event) => {
    if (event.pointerType !== "mouse" || !cardRef.current) return;
    const bounds = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty("--spot-x", `${event.clientX - bounds.left}px`);
    cardRef.current.style.setProperty("--spot-y", `${event.clientY - bounds.top}px`);
  };

  const toggleCard = () => {
    if (pinnedId === team.id) {
      setPinnedId(null);
      setOpenId((currentId) => currentId === team.id ? null : currentId);
      return;
    }
    setPinnedId(team.id);
    setOpenId(team.id);
  };

  return (
    <motion.article
      ref={cardRef}
      layout
      className={`${styles.teamCard} ${isOpen ? styles.teamCardOpen : ""} ${visible ? styles.teamCardVisible : ""}`}
      style={{ "--entrance-delay": `${Math.min(index * 60, 360)}ms` }}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      transition={{ layout: { duration: reduceMotion ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] } }}
    >
      <span className={styles.cardShimmer} aria-hidden="true" />
      <span className={styles.cardIndex} aria-hidden="true">{String(team.result_rank).padStart(2, "0")}</span>
      <button
        type="button"
        className={styles.cardTrigger}
        aria-expanded={isOpen}
        aria-controls={contentId}
        aria-label={`${isOpen ? "Collapse" : "Show"} team lead for ${team.name}`}
        onClick={toggleCard}
      >
        <span className={styles.cardHeading}>
          <span className={styles.teamIndex}>{String(team.result_rank).padStart(2, "0")}</span>
          <span className={styles.teamName}>{team.name}</span>
        </span>
        <span className={styles.cardMeta}>
          <span className={styles.memberCount}>{team.track || "Track not assigned"}</span>
          <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`} aria-hidden="true">+</span>
        </span>
      </button>
      <div className={`${styles.memberDisclosure} ${isOpen ? styles.disclosureOpen : ""}`} id={contentId} aria-hidden={!isOpen}>
        <div className={styles.disclosureInner}>
          <ul className={styles.memberList}>
            <TeamLeadDetails name={team.team_lead_name} />
          </ul>
        </div>
      </div>
    </motion.article>
  );
}

export default function ResultsExperience() {
  const reduceMotion = useReducedMotion();
  const [managedTeams, setManagedTeams] = useState([]);
  const [managedTeamsError, setManagedTeamsError] = useState("");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);
  const [pinnedId, setPinnedId] = useState(null);
  const normalizedQuery = query.trim().toLowerCase();
  const allTeams = useMemo(() => managedTeams
    .filter((team) => team.status === "selected")
    .map((team) => ({
      id: `managed-${team.id}`,
      name: team.name,
      track: team.track,
      team_lead_name: team.team_lead_name,
      result_rank: team.result_rank,
    }))
    .sort((first, second) => first.result_rank - second.result_rank), [managedTeams]);
  const filteredTeams = useMemo(() => {
    if (!normalizedQuery) return allTeams;
    return allTeams.filter((team) =>
      team.name.toLowerCase().includes(normalizedQuery) ||
      team.team_lead_name.toLowerCase().includes(normalizedQuery)
    );
  }, [allTeams, normalizedQuery]);
  useEffect(() => {
    let active = true;
    fetch("/api/results", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load added results.");
        if (active) setManagedTeams(data.teams);
      })
      .catch((error) => {
        if (active) setManagedTeamsError(error.message);
      });
    return () => { active = false; };
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.backgroundGrid} aria-hidden="true" />
      <div className={styles.pageContent}>
        <header className={styles.hero}>
          <p className={styles.phaseBadge}><span className={styles.liveDot} />Phase 1 · Results</p>
          <h1 className={styles.title}>Phase 1 <span>Results</span></h1>
          <p className={styles.subtitle}>QUANT-A-MAZE 3.0 <span>{"//"}</span> PHASE 1 SELECTION</p>

          <motion.div
            className={styles.resultsState}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <p className={styles.countLine}><span className={styles.countNumber}><CountUp value={allTeams.length} /></span> {allTeams.length === 1 ? "team" : "teams"} selected</p>
          </motion.div>
        </header>

        <motion.section
          className={styles.resultsSection}
          aria-label="Phase 1 selected teams"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.12 }}
        >
            <div className={styles.listToolbar}>
              <p className={styles.listLabel}><span />Selected teams <span className={styles.listCount}>{String(filteredTeams.length).padStart(2, "0")}</span></p>
              <label className={styles.searchBox}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m16 16 4 4" />
                </svg>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search teams or team leads"
                  aria-label="Search teams by team or team lead name"
                />
                {query && <button className={styles.clearSearch} type="button" onClick={() => setQuery("")} aria-label="Clear search">×</button>}
              </label>
            </div>

            {managedTeamsError && <p role="alert" className={styles.noResults}>{managedTeamsError}</p>}
            {filteredTeams.length > 0 ? (
              <>
                <motion.div className={styles.teamGrid} layout>
                  <AnimatePresence initial={false}>
                    {filteredTeams.map((team, index) => (
                      <TeamCard
                        key={team.id}
                        team={team}
                        index={index}
                        openId={openId}
                        pinnedId={pinnedId}
                        setOpenId={setOpenId}
                        setPinnedId={setPinnedId}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </>
            ) : (
              <p className={styles.noResults}>No teams or team leads match “{query}”.</p>
            )}
        </motion.section>
      </div>
    </main>
  );
}