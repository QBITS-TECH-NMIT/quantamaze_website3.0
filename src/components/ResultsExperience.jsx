"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import teams from "@/data/teams";
import ResultsCountdown from "@/components/ResultsCountdown";
import useResultsAvailability from "@/hooks/useResultsAvailability";
import { getResultsCountdown } from "@/lib/results";
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

function MemberDetails({ member }) {
  const details = [member.college, member.year, member.branch, member.email].filter(Boolean);

  return (
    <li className={`${styles.memberRow} ${member.role === "Team Lead" ? styles.leadRow : ""}`}>
      <span className={styles.avatar} aria-hidden="true">{initialsFor(member.name)}</span>
      <span className={styles.memberCopy}>
        <span className={styles.memberNameLine}>
          <span className={styles.memberName}>{member.name}</span>
          {member.role === "Team Lead" && <span className={styles.leadBadge}>Lead</span>}
        </span>
        <span className={styles.memberRole}>{member.role}</span>
        {details.length > 0 && (
          <span className={styles.memberDetails}>
            {details.map((detail) => <span key={detail}>{detail}</span>)}
          </span>
        )}
      </span>
    </li>
  );
}

function TeamCard({ team, index, openId, pinnedId, setOpenId, setPinnedId }) {
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion();
  const cardRef = useRef(null);
  const isOpen = openId === team.id;
  const contentId = `team-members-${team.id}`;

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
      <span className={styles.cardIndex} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
      <button
        type="button"
        className={styles.cardTrigger}
        aria-expanded={isOpen}
        aria-controls={contentId}
        aria-label={`${isOpen ? "Collapse" : "Show"} members of ${team.name}`}
        onClick={toggleCard}
      >
        <span className={styles.cardHeading}>
          <span className={styles.teamIndex}>{String(index + 1).padStart(2, "0")}</span>
          <span className={styles.teamName}>{team.name}</span>
        </span>
        <span className={styles.cardMeta}>
          <span className={styles.memberCount}>{team.members.length} {team.members.length === 1 ? "member" : "members"}</span>
          <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`} aria-hidden="true">+</span>
        </span>
      </button>
      <div className={`${styles.memberDisclosure} ${isOpen ? styles.disclosureOpen : ""}`} id={contentId} aria-hidden={!isOpen}>
        <div className={styles.disclosureInner}>
          <ul className={styles.memberList}>
            {team.members.map((member) => (
                      <MemberDetails key={`${team.id}-${member.name}`} member={member} />
            ))}
          </ul>
        </div>
      </div>
    </motion.article>
  );
}

export default function ResultsExperience() {
  const { mounted, now, isLive } = useResultsAvailability(true);
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);
  const [pinnedId, setPinnedId] = useState(null);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredTeams = useMemo(() => {
    if (!normalizedQuery) return teams;
    return teams.filter((team) =>
      team.name.toLowerCase().includes(normalizedQuery) ||
      team.members.some((member) => member.name.toLowerCase().includes(normalizedQuery))
    );
  }, [normalizedQuery]);
  const remaining = mounted ? getResultsCountdown(now) : null;

  return (
    <main className={styles.page}>
      <div className={styles.backgroundGrid} aria-hidden="true" />
      <div className={styles.pageContent}>
        <header className={styles.hero}>
          <p className={styles.phaseBadge}><span className={styles.liveDot} />Phase 2 · Shortlisted</p>
          <h1 className={styles.title}>Shortlisted <span>Teams</span></h1>
          <p className={styles.subtitle}>QUANT-A-MAZE 3.0 <span>{"//"}</span> PHASE 2 SELECTION</p>

          <AnimatePresence mode="wait" initial={false}>
            {isLive ? (
              <motion.div
                key="results"
                className={styles.resultsState}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <p className={styles.countLine}><span className={styles.countNumber}><CountUp value={teams.length} /></span> {teams.length === 1 ? "team" : "teams"} selected</p>
              </motion.div>
            ) : (
              <motion.div
                key="locked"
                className={styles.lockedState}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <span className={styles.lockIcon} aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="10" width="16" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    <path d="M12 14v3" />
                  </svg>
                </span>
                <h2>Phase 2 results unlock soon</h2>
                <p className={styles.unlockMessage}>Results unlock on 9 October</p>
                <ResultsCountdown
                  remaining={remaining}
                  ready={mounted}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {isLive && (
          <motion.section
            className={styles.resultsSection}
            aria-label="Teams shortlisted for Phase 2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.12 }}
          >
            <div className={styles.listToolbar}>
              <p className={styles.listLabel}><span />Shortlist <span className={styles.listCount}>{String(filteredTeams.length).padStart(2, "0")}</span></p>
              <label className={styles.searchBox}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m16 16 4 4" />
                </svg>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search teams or members"
                  aria-label="Search teams by team or member name"
                />
                {query && <button className={styles.clearSearch} type="button" onClick={() => setQuery("")} aria-label="Clear search">×</button>}
              </label>
            </div>

            {filteredTeams.length > 0 ? (
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
            ) : (
              <p className={styles.noResults}>No teams or members match “{query}”.</p>
            )}
          </motion.section>
        )}
      </div>
    </main>
  );
}