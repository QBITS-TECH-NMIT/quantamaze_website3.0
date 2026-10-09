"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import ResultsCountdown from "@/components/ResultsCountdown";
import useResultsAvailability from "@/hooks/useResultsAvailability";
import { getResultsCountdown } from "@/lib/results";
import resultStyles from "@/app/results/results.module.css";
import styles from "@/app/check-result/check-result.module.css";

const MAX_LENGTH = 60;
const STATUS_LINES = [
  "> Locating team…",
  "> Verifying team lead…",
  "> Cross-checking Phase 1 results…",
  "> Compiling status…",
];
const easeOut = [0.16, 1, 0.3, 1];

function ConfettiBurst({ active }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext("2d");
    if (!context) return undefined;

    let frameId;
    let running = true;
    const colors = ["#F25C05", "#FF8A3D", "#FFD27A", "#FFFFFF", "#E8C36A"];
    const particles = Array.from({ length: 72 }, () => ({
      x: canvas.width / 2,
      y: canvas.height * 0.28,
      vx: (Math.random() - 0.5) * 7.2,
      vy: Math.random() * -7 - 2,
      size: Math.random() * 5 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
    }));
    const started = performance.now();

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();

    const draw = (time) => {
      if (!running) return;
      context.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.14;
        particle.life -= 0.008;
        context.globalAlpha = Math.max(particle.life, 0);
        context.fillStyle = particle.color;
        context.fillRect(particle.x, particle.y, particle.size, particle.size * 0.7);
      });
      context.globalAlpha = 1;
      if (time - started < 2500) frameId = window.requestAnimationFrame(draw);
    };

    frameId = window.requestAnimationFrame(draw);
    return () => {
      running = false;
      window.cancelAnimationFrame(frameId);
    };
  }, [active]);

  return <canvas ref={canvasRef} className={styles.confetti} aria-hidden="true" />;
}

function LetterReveal({ text }) {
  return (
    <p className={styles.teamReveal} aria-hidden="true">
      {Array.from(text).map((letter, index) => (
        <span
          className={styles.letter}
          key={`${letter}-${index}`}
          style={{ animationDelay: `${index * 38}ms` }}
        >
          {letter === " " ? "\u00A0" : letter}
        </span>
      ))}
    </p>
  );
}

export default function CheckResultExperience() {
  const { mounted, now, isLive } = useResultsAvailability(true);
  const reduceMotion = useReducedMotion();
  const headingRef = useRef(null);
  const [teamName, setTeamName] = useState("");
  const [teamLeadName, setTeamLeadName] = useState("");
  const [errors, setErrors] = useState({});
  const [view, setView] = useState("form");
  const [statusLine, setStatusLine] = useState(STATUS_LINES[0]);
  const [result, setResult] = useState(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (view !== "verifying" || reduceMotion) return undefined;
    let index = 0;
    const id = window.setInterval(() => {
      index = (index + 1) % STATUS_LINES.length;
      setStatusLine(STATUS_LINES[index]);
    }, 700);
    return () => window.clearInterval(id);
  }, [view, reduceMotion]);

  useEffect(() => {
    if (view === "result" && headingRef.current) {
      headingRef.current.focus();
    }
  }, [view, result]);

  const resetForm = () => {
    setTeamName("");
    setTeamLeadName("");
    setErrors({});
    setResult(null);
    setFormError("");
    setStatusLine(STATUS_LINES[0]);
    setView("form");
  };

  const validate = () => {
    const nextErrors = {};
    if (!teamName.trim()) nextErrors.teamName = "Enter your team name.";
    else if (teamName.trim().length > MAX_LENGTH) nextErrors.teamName = "Use 60 characters or fewer.";
    if (!teamLeadName.trim()) nextErrors.teamLeadName = "Enter the team lead name.";
    else if (teamLeadName.trim().length > MAX_LENGTH) nextErrors.teamLeadName = "Use 60 characters or fewer.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    if (!validate() || view === "verifying") return;

    setView("verifying");
    const delay = reduceMotion ? 800 : 3000;
    // Remove the preview query override before launch.
    const preview = new URLSearchParams(window.location.search).get("preview") === "true";

    const request = fetch("/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teamName: teamName.trim(),
        teamLeadName: teamLeadName.trim(),
        preview,
      }),
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        return { ok: response.ok, status: response.status, data };
      })
      .catch(() => ({
        ok: false,
        status: 0,
        data: { message: "Could not connect to the results service. Please check your connection and try again." },
      }));

    const [{ ok, status, data }] = await Promise.all([
      request,
      new Promise((resolve) => window.setTimeout(resolve, delay)),
    ]);

    if (status === 429) {
      setFormError("Too many checks. Please wait a moment and try again.");
      setView("form");
      return;
    }

    if (!ok || !["selected", "waiting_list", "not_selected"].includes(data.status)) {
      setFormError(
        status === 403 && data.error === "locked"
          ? "Result checking is not open yet. Please try again later."
          : data.message || "We could not complete the check. Please try again."
      );
      setView("form");
      return;
    }

    setResult(data);
    setView("result");
  };

  const selected = result?.status === "selected";
  const waitingListed = result?.status === "waiting_list";
  const remaining = mounted ? getResultsCountdown(now) : null;
  const liveMessage =
    view === "verifying"
      ? "Verifying your details."
      : view === "result"
        ? selected
          ? `Selected. Congratulations, Team ${result.teamName}.`
          : waitingListed
            ? `Your team ${result.teamName} is on the waiting list.`
            : "Not selected. Thank you for participating."
        : "";

  return (
    <main className={styles.page}>
      <div className={styles.backgroundGrid} aria-hidden="true" />
      <div className={styles.wireframe} aria-hidden="true">
        <svg viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="78" fill="none" stroke="#F25C05" strokeWidth="0.6" />
          <ellipse cx="100" cy="100" rx="78" ry="28" fill="none" stroke="#F25C05" strokeWidth="0.45" />
          <ellipse cx="100" cy="100" rx="28" ry="78" fill="none" stroke="#F25C05" strokeWidth="0.45" />
          <ellipse cx="100" cy="100" rx="62" ry="78" fill="none" stroke="#FF8A3D" strokeWidth="0.35" />
        </svg>
      </div>

      <div className={styles.pageContent}>
        <header className={styles.hero}>
          <p className={styles.phaseBadge}>
            <span className={styles.liveDot} />
            RESULT CHECK
          </p>
          <h1 className={styles.title}>
            Check your <span>status</span>
          </h1>
          <p className={styles.subtitle}>
            QUANT-A-MAZE 3.0 <span>{"//"}</span> PHASE 1 RESULTS
          </p>
        </header>

        <div aria-live="polite" className={styles.srLive}>
          {liveMessage}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {!isLive ? (
            <motion.div
              key="locked"
              className={resultStyles.lockedState}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <span className={resultStyles.lockIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="10" width="16" height="11" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  <path d="M12 14v3" />
                </svg>
              </span>
              <h2>Phase 1 results unlock soon</h2>
              <p className={resultStyles.unlockMessage}>Results unlock on 9 October at 11:00 AM IST</p>
              <ResultsCountdown
                remaining={remaining}
                ready={mounted}
              />
            </motion.div>
          ) : (
            <motion.div
              key="live"
              className={styles.stage}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: easeOut }}
            >
              <AnimatePresence mode="wait">
                {view === "form" && (
                  <motion.div
                    key="form"
                    className={styles.card}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, filter: "blur(8px)", scale: 0.96 }}
                    transition={{ duration: reduceMotion ? 0.2 : 0.4, ease: easeOut }}
                  >
                    <form className={styles.form} onSubmit={handleSubmit} noValidate>
                      <div className={`${styles.field} ${errors.teamName ? styles.fieldError : ""}`}>
                        <span className={styles.fieldIcon} aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                        </span>
                        <input
                          id="teamName"
                          name="teamName"
                          type="text"
                          autoComplete="off"
                          maxLength={MAX_LENGTH}
                          placeholder=" "
                          value={teamName}
                          onChange={(event) => {
                            setTeamName(event.target.value);
                            setErrors((current) => ({ ...current, teamName: undefined }));
                          }}
                          aria-invalid={Boolean(errors.teamName)}
                          aria-describedby={errors.teamName ? "teamName-error" : undefined}
                        />
                        <label htmlFor="teamName">Team Name</label>
                        {errors.teamName && (
                          <span className={styles.error} id="teamName-error">
                            {errors.teamName}
                          </span>
                        )}
                      </div>

                      <div className={`${styles.field} ${errors.teamLeadName ? styles.fieldError : ""}`}>
                        <span className={styles.fieldIcon} aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M5 16 8 8l4 4 4-4 3 8" />
                            <path d="M3 20h18" />
                            <circle cx="12" cy="5" r="1.6" />
                          </svg>
                        </span>
                        <input
                          id="teamLeadName"
                          name="teamLeadName"
                          type="text"
                          autoComplete="name"
                          maxLength={MAX_LENGTH}
                          placeholder=" "
                          value={teamLeadName}
                          onChange={(event) => {
                            setTeamLeadName(event.target.value);
                            setErrors((current) => ({ ...current, teamLeadName: undefined }));
                          }}
                          aria-invalid={Boolean(errors.teamLeadName)}
                          aria-describedby={errors.teamLeadName ? "teamLeadName-error" : undefined}
                        />
                        <label htmlFor="teamLeadName">Team Lead Name</label>
                        {errors.teamLeadName && (
                          <span className={styles.error} id="teamLeadName-error">
                            {errors.teamLeadName}
                          </span>
                        )}
                      </div>

                      {formError && <p className={styles.error}>{formError}</p>}

                      <button className={styles.submit} type="submit" disabled={view === "verifying"}>
                        Check Status
                      </button>
                    </form>
                    <div className={styles.divider} />
                    <div className={styles.listCard}>
                      <p className={styles.listCopy}>Want to see everyone who made it?</p>
                      <Link className={styles.fullList} href="/results">
                        View all selected teams <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </motion.div>
                )}

                {view === "verifying" && (
                  <motion.div
                    key="verifying"
                    className={styles.card}
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: easeOut }}
                  >
                    <div className={styles.verify} role="status">
                      <div className={styles.scanWrap}>
                        {!reduceMotion && <span className={styles.scanLine} />}
                        <svg className={styles.ring} viewBox="0 0 120 120" aria-hidden="true">
                          <defs>
                            <linearGradient id="checkRing" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#F25C05" />
                              <stop offset="100%" stopColor="#FF8A3D" />
                            </linearGradient>
                          </defs>
                          <circle cx="60" cy="60" r="52" className={styles.ringCircle} />
                        </svg>
                      </div>
                      <p className={styles.statusLine}>{reduceMotion ? "> Verifying…" : statusLine}</p>
                      <div className={styles.progressTrack} aria-hidden="true">
                        <div className={styles.progressFill} />
                      </div>
                      <button className={styles.submit} type="button" disabled>
                        <span className={styles.spinner} aria-hidden="true" />
                        Checking
                      </button>
                    </div>
                  </motion.div>
                )}

                {view === "result" && result && (
                  <motion.div
                    key="result"
                    className={`${styles.card} ${selected ? styles.cardGlow : ""}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: easeOut }}
                  >
                    {selected && !reduceMotion && <ConfettiBurst active />}
                    <div className={styles.result}>
                      <div className={styles.iconBurst}>
                        {selected && <span className={styles.lightBurst} aria-hidden="true" />}
                        {selected ? (
                          <svg className={styles.iconSvg} viewBox="0 0 96 96" aria-hidden="true">
                            <defs>
                              <linearGradient id="checkMark" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#F25C05" />
                                <stop offset="100%" stopColor="#FF8A3D" />
                              </linearGradient>
                            </defs>
                            <circle cx="48" cy="48" r="36" fill="none" stroke="url(#checkMark)" strokeWidth="3" opacity="0.45" />
                            <path className={styles.checkPath} d="M30 49.5 43 62 68 34" />
                          </svg>
                        ) : (
                          <svg className={styles.iconSvg} viewBox="0 0 96 96" aria-hidden="true">
                            <circle className={styles.neutralCircle} cx="48" cy="48" r="32" />
                            <line className={styles.neutralMark} x1="34" y1="48" x2="62" y2="48" />
                          </svg>
                        )}
                      </div>

                      {selected && <LetterReveal text={result.teamName} />}

                      <h2 ref={headingRef} tabIndex={-1} className={styles.resultHeading}>
                        {selected
                          ? `Congratulations, Team ${result.teamName}! 🎉`
                          : waitingListed
                            ? `Team ${result.teamName} is on the waiting list`
                            : "Thank you for participating"}
                      </h2>
                      <p className={styles.resultBody}>
                        {selected
                          ? "Your team has been selected after Phase 1 of Quant-A-Maze 3.0. Further details will be shared with the team lead shortly."
                          : waitingListed
                            ? "Your team is currently on the Phase 1 waiting list. We will contact the team lead if a place becomes available."
                            : "We could not find a team with these details in the Phase 1 results. Please check that the team name and team lead name match your registration exactly. If you believe this is a mistake, please contact the organizing team. We sincerely appreciate your effort and hope to see you at our future events."}
                      </p>

                      <div className={styles.actions}>
                        <button className={styles.ghost} type="button" onClick={resetForm}>
                          {selected ? "Check another team" : "Check again"}
                        </button>
                        {!selected && (
                          <Link className={styles.link} href="/#footer">
                            Contact us
                          </Link>
                        )}
                      </div>

                      <div className={styles.divider} />
                      <div className={styles.listCard}>
                        <p className={styles.listCopy}>Want to see everyone who made it?</p>
                        <Link className={styles.fullList} href="/results">
                          View all selected teams <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
