"use client";

/**
 * CountdownTimer — Premium animated countdown for Q-Bits / Quant-A-Maze.
 *
 * Props:
 *   targetDate  {Date | string}  – The target date/time for the countdown.
 *   startDate   {Date | string}  – Optional start date; drives the progress bar.
 *                                  Defaults to 30 days before targetDate.
 *   label       {string}         – Optional heading text. Defaults to "Launching In".
 *   accentColor {string}         – CSS colour token for glows/bar. Defaults to site orange.
 */

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export const COUNTDOWN_PHASES = [
  { heading: "LAUNCHING IN", startDate: "2026-08-08T00:00:00+05:30", targetDate: "2026-09-07T00:00:00+05:30" },
  { heading: "SUBMISSIONS CLOSE IN", startDate: "2026-09-07T00:00:00+05:30", targetDate: "2026-10-05T23:59:59+05:30" },
  { heading: "PHASE 1 RESULTS IN", startDate: "2026-09-29T00:00:00+05:30", targetDate: "2026-10-03T00:00:00+05:30" },
  { heading: "EVENT STARTS IN", startDate: "2026-10-03T00:00:00+05:30", targetDate: "2026-10-28T00:00:00+05:30" },
  { heading: "FINAL RESULTS IN", startDate: "2026-10-28T00:00:00+05:30", targetDate: "2026-10-30T23:59:59+05:30" },
];

export const REGISTRATION_CUTOFF = "2026-10-05T00:00:00+05:30";
const REGISTRATION_CUTOFF_MS = new Date(REGISTRATION_CUTOFF).getTime();

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */

function getTimeLeft(target, now) {
  const diff = new Date(target).getTime() - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1_000) % 60),
    expired: false,
  };
}

function getProgress(start, target, now) {
  const total = new Date(target).getTime() - new Date(start).getTime();
  const elapsed = now - new Date(start).getTime();
  return total <= 0 ? 100 : Math.min(100, Math.max(0, (elapsed / total) * 100));
}

function getActivePhase(phases, now) {
  return phases.findIndex((phase) => new Date(phase.targetDate).getTime() > now);
}

function getAnnouncementState(now) {
  const submissionsDeadline = new Date("2026-10-05T23:59:59+05:30").getTime();
  const resultsVisibleFrom = new Date("2026-10-09T00:00:00+05:30").getTime();

  if (now > submissionsDeadline && now < resultsVisibleFrom) {
    return {
      badge: "Stay Tuned",
      title: "Phase 1 results will be announced soon.",
      subtitle: "We are finalising the evaluation.",
      showResultsButton: false,
    };
  }

  if (now >= resultsVisibleFrom) {
    return {
      badge: "Results",
      title: "Phase 1 results are live.",
      subtitle: "Check the official result page to view the shortlisted teams.",
      showResultsButton: true,
      buttonLabel: "View Results",
      buttonLink: "/check-result",
    };
  }

  return null;
}

/* ─────────────────────────────────────────────
   Single digit slot — flip/roll animation
───────────────────────────────────────────── */

function DigitSlot({ digit, reducedMotion }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: "0.62em",
        position: "relative",
        overflow: "hidden",
        lineHeight: 1,
      }}
    >
      <AnimatePresence mode={reducedMotion ? undefined : "popLayout"} initial={false}>
        <motion.span
          key={digit}
          style={{ display: "block", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}
          initial={reducedMotion ? false : { y: "-110%", opacity: 0, rotateX: -60 }}
          animate={{ y: "0%", opacity: 1, rotateX: 0 }}
          exit={reducedMotion ? undefined : { y: "110%", opacity: 0, rotateX: 60 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.42, ease: [0.4, 0.0, 0.2, 1] }}
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* Only the digits that changed will animate — each slot has its own key. */
function AnimatedNumber({ value, reducedMotion }) {
  const str = String(value).padStart(2, "0");
  return (
    <span style={{ display: "inline-flex", justifyContent: "center" }}>
      <DigitSlot digit={str[0]} reducedMotion={reducedMotion} />
      <DigitSlot digit={str[1]} reducedMotion={reducedMotion} />
    </span>
  );
}

/* ─────────────────────────────────────────────
   Glass-card segment
───────────────────────────────────────────── */

function TimerSegment({ value, label, isPulsing, accent, motionDelay, reducedMotion }) {
  const glowHex = accent + "33";
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 36 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.65, delay: motionDelay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={reducedMotion ? undefined : {
        scale: 1.04,
        boxShadow: `0 0 0 1px rgba(255,255,255,0.13), 0 12px 48px rgba(0,0,0,0.55), 0 0 48px ${glowHex}`,
        transition: { duration: 0.2 },
      }}
      className="countdown-segment-mobile relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-[0_4px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.04)] select-none cursor-default"
      style={{
        gap: "10px",
      }}
    >
      {/* Glass inner-top highlight */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          background: "linear-gradient(160deg, rgba(255,255,255,0.07) 0%, transparent 45%)",
          pointerEvents: "none",
        }}
      />

      {/* Seconds-only outer glow pulse ring */}
      {isPulsing && !reducedMotion && (
        <motion.div
          aria-hidden
          animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.28, 0.1] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            inset: -5,
            borderRadius: "22px",
            border: `1.5px solid ${accent}`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Number */}
      <motion.div
        animate={
          isPulsing && !reducedMotion
            ? {
                scale: [1, 1.028, 1],
                filter: [
                  `drop-shadow(0 0 6px ${accent}44)`,
                  `drop-shadow(0 0 18px ${accent}88)`,
                  `drop-shadow(0 0 6px ${accent}44)`,
                ],
              }
            : {}
        }
        transition={isPulsing && !reducedMotion ? { duration: 1, repeat: Infinity, ease: "easeInOut" } : {}}
        style={{
          fontSize: "clamp(28px, 8vw, 68px)",
          fontWeight: 800,
          color: "#ffffff",
          lineHeight: 1,
          fontFamily: "var(--font-geist-mono, 'Courier New', monospace)",
          textShadow: `0 0 20px ${accent}55, 0 2px 8px rgba(0,0,0,0.7)`,
          letterSpacing: "-0.02em",
          position: "relative",
          zIndex: 1,
        }}
      >
        <AnimatedNumber value={value} reducedMotion={reducedMotion} />
      </motion.div>

      {/* Label */}
      <span
        style={{
          position: "relative",
          zIndex: 1,
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: "#6b7280",
          fontFamily: "var(--font-geist-sans, sans-serif)",
        }}
      >
        {label}
      </span>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Glowing divider dots (breathe animation)
───────────────────────────────────────────── */

function DividerDots({ accent, delay, reducedMotion }) {
  return (
    <div
      aria-hidden
      className="countdown-divider hidden sm:flex flex-col gap-2 self-center shrink-0 px-1"
    >
      {[0, 1].map((i) => (
        <motion.span
          key={i}
          animate={reducedMotion ? undefined : { opacity: [0.25, 0.8, 0.25] }}
          transition={reducedMotion ? undefined : {
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: delay + i * 0.35,
          }}
          style={{
            display: "block",
            width: "5px",
            height: "5px",
            borderRadius: "50%",
            background: accent,
            boxShadow: `0 0 8px 2px ${accent}77`,
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Floating ambient particles (pure React/motion)
───────────────────────────────────────────── */

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${5 + ((i * 313) % 90)}%`,
  top: `${10 + ((i * 173) % 80)}%`,
  size: 1.2 + (i % 4) * 0.6,
  opacity: 0.08 + (i % 5) * 0.04,
  dur: 5 + (i % 6) * 1.8,
  delay: (i * 0.38) % 5,
}));

function AmbientParticles({ accent, reducedMotion }) {
  if (reducedMotion) return null;

  return (
    <div
      aria-hidden
      style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}
    >
      {PARTICLES.map((p) => (
        <motion.span
          key={p.id}
          animate={{ y: [0, -20, 0], opacity: [p.opacity, p.opacity * 2.8, p.opacity] }}
          transition={{ duration: p.dur, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
          style={{
            position: "absolute",
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: "50%",
            background: accent,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main export — CountdownTimer
───────────────────────────────────────────── */

export default function CountdownTimer({
  phases = COUNTDOWN_PHASES,
  targetDate,
  startDate,
  label = "Launching In",
  accentColor = "#f5590a",
  onRegistrationOpenChange,
}) {
  const reducedMotion = useReducedMotion();
  const resolvedPhases = useMemo(
    () => targetDate
      ? [{
          heading: label,
          startDate: startDate ?? new Date(new Date(targetDate).getTime() - 30 * 86_400_000),
          targetDate,
        }]
      : phases,
    [label, phases, startDate, targetDate],
  );

  const [time, setTime] = useState(null);
  const [progress, setProgress] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(null);
  const [announcementState, setAnnouncementState] = useState(null);

  useEffect(() => {
    function tick() {
      const now = Date.now();
      const nextAnnouncement = getAnnouncementState(now);
      setAnnouncementState(nextAnnouncement);
      onRegistrationOpenChange?.(now < REGISTRATION_CUTOFF_MS);

      if (nextAnnouncement) {
        setTime({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        setProgress(100);
        setPhaseIndex(null);
        return;
      }

      const nextPhaseIndex = getActivePhase(resolvedPhases, now);
      setPhaseIndex(nextPhaseIndex === -1 ? null : nextPhaseIndex);

      if (nextPhaseIndex === -1) {
        setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setProgress(100);
        return;
      }

      const currentPhase = resolvedPhases[nextPhaseIndex];
      setTime(getTimeLeft(currentPhase.targetDate, now));
      setProgress(getProgress(currentPhase.startDate, currentPhase.targetDate, now));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [onRegistrationOpenChange, resolvedPhases]);

  const display = time ?? { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const isCountdownComplete = Boolean(announcementState) || phaseIndex === null || Boolean(time?.expired);
  const heading = announcementState ? null : (isCountdownComplete ? "Stay Tuned" : resolvedPhases[phaseIndex ?? 0]?.heading ?? "Stay Tuned");
  const segments = [
    { key: "days",    value: display.days,    label: "Days"    },
    { key: "hours",   value: display.hours,   label: "Hours"   },
    { key: "minutes", value: display.minutes, label: "Minutes" },
    { key: "seconds", value: display.seconds, label: "Seconds" },
  ];

  return (
    <section
      className="countdown-display"
      aria-label="Hackathon countdown and Phase 1 results"
      style={{
        "--bg": "#0A0A0A",
        "--text": "#FFFFFF",
        "--text-muted": "rgba(255,255,255,0.72)",
        "--accent": "#F25C05",
        "--accent-light": "#FF8A3D",
        "--border": "rgba(242,92,5,0.4)",
        position: "relative",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: announcementState ? "24px" : "22px",
        padding: "24px 12px 20px",
        // isolation creates a new stacking context for internal z-indices only —
        // it does NOT escape to siblings outside this element.
        isolation: "isolate",
        // contain:layout ensures the absolute decorative layers (glow, grid,
        // particles) are clipped to this element's own bounds and cannot
        // overlap or intercept pointer events on the button below.
        contain: "layout style",
      }}
    >
      {/* Radial background glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 75% 65% at 50% 50%, ${accentColor}18 0%, transparent 72%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Faint animated grid */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "52px 52px",
          maskImage: "linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <AmbientParticles accent={accentColor} reducedMotion={reducedMotion} />

      {/* Content vignette keeps the existing wireframe background legible behind text. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "-12px 0",
          zIndex: 0.5,
          pointerEvents: "none",
          background: "radial-gradient(ellipse 68% 78% at 50% 48%, rgba(10,10,10,0.84) 0%, rgba(10,10,10,0.58) 56%, transparent 100%)",
        }}
      />

      {/* Heading */}
      {heading && (
        <motion.p
          initial={reducedMotion ? false : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "relative",
            zIndex: 1,
            margin: 0,
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#6b7280",
            fontFamily: "var(--font-geist-mono, monospace)",
          }}
        >
          {heading}
        </motion.p>
      )}

      {/* Cards + dividers */}
      <AnimatePresence mode="wait">
        {announcementState ? (
          <motion.div
            key="results-announcement"
            initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -18, scale: 0.98 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "relative",
              zIndex: 1,
              width: "100%",
              maxWidth: "760px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              textAlign: "center",
              padding: "18px 12px 8px",
            }}
          >
            <motion.span
              initial={reducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.08, ease: "easeOut" }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--border)",
                background: "rgba(242,92,5,0.09)",
                boxShadow: "inset 0 0 16px rgba(242,92,5,0.08)",
                color: "#FFD0B0",
                borderRadius: "999px",
                padding: "8px 16px",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                fontFamily: "var(--font-geist-mono, monospace)",
              }}
            >
              {announcementState.showResultsButton && !reducedMotion && (
                <motion.span
                  aria-hidden="true"
                  animate={{ opacity: [1, 0.45, 1], scale: [1, 0.86, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  style={{ width: 7, height: 7, marginRight: 9, borderRadius: "50%", background: "var(--accent-light)", boxShadow: "0 0 12px rgba(255,138,61,0.8)" }}
                />
              )}
              {announcementState.badge}
            </motion.span>

            {/* Fluid headline and orange live accent establish the announcement hierarchy. */}
            <motion.h2
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.16, ease: "easeOut" }}
              style={{
                margin: 0,
                color: "var(--text)",
                fontSize: "clamp(2rem, 7vw, 4.5rem)",
                lineHeight: 1.1,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                fontFamily: "var(--font-geist-sans, sans-serif)",
              }}
            >
              {announcementState.showResultsButton ? (
                <>Phase 1 results are <span style={{ color: "var(--accent-light)", backgroundImage: "linear-gradient(100deg, #F25C05, #FFB27E)", backgroundClip: "text", WebkitTextFillColor: "transparent", textDecoration: "underline", textDecorationColor: "rgba(255,138,61,0.55)", textUnderlineOffset: "8px" }}>live.</span></>
              ) : announcementState.title}
            </motion.h2>

            <motion.p
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.24, ease: "easeOut" }}
              style={{
                margin: 0,
                maxWidth: "60ch",
                color: "var(--text-muted)",
                fontSize: "clamp(12px, 1.4vw, 14px)",
                lineHeight: 1.6,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontFamily: "var(--font-geist-mono, monospace)",
              }}
            >
              {announcementState.subtitle}
            </motion.p>

            {announcementState.showResultsButton && (
              <motion.a
                href={announcementState.buttonLink}
                aria-label="View the Phase 1 shortlisted teams"
                initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.32, ease: "easeOut" }}
                whileHover={reducedMotion ? undefined : { y: -2, boxShadow: "0 0 0 4px rgba(242,92,5,0.2), 0 14px 34px rgba(242,92,5,0.3)" }}
                whileTap={reducedMotion ? undefined : { scale: 0.98, y: 0 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  width: "100%",
                  maxWidth: "320px",
                  minWidth: "240px",
                  minHeight: "52px",
                  marginTop: "8px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "linear-gradient(110deg, #F25C05, #FF8A3D)",
                  color: "#16100C",
                  fontSize: "16px",
                  fontWeight: 800,
                  letterSpacing: "0.01em",
                  padding: "16px 28px",
                  textDecoration: "none",
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.1), 0 10px 28px rgba(242,92,5,0.22)",
                  fontFamily: "var(--font-geist-sans, sans-serif)",
                }}
              >
                {announcementState.buttonLabel}
                <span aria-hidden="true" style={{ display: "inline-flex", transition: reducedMotion ? "none" : "transform 180ms ease" }} className="results-button-arrow">↗</span>
              </motion.a>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="countdown"
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -20 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 grid w-full max-w-[860px] grid-cols-2 gap-2.5 sm:flex sm:flex-row sm:items-stretch sm:gap-2.5"
          >
            {segments.map((seg, i) => (
              <div
                key={seg.key}
                style={{ display: "contents" }}
              >
                <TimerSegment
                  value={seg.value}
                  label={seg.label}
                  isPulsing={seg.key === "seconds"}
                  accent={accentColor}
                  motionDelay={i * 0.08}
                  reducedMotion={reducedMotion}
                />
                {i < segments.length - 1 && (
                  <DividerDots
                    accent={accentColor}
                    delay={i * 0.55}
                    reducedMotion={reducedMotion}
                  />
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completed results use an accessible status bar instead of a stale elapsed percentage. */}
      {announcementState ? (
        <motion.div
          role="progressbar"
          aria-label="Phase 1 completion status"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={100}
          initial={reducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.4, ease: "easeOut" }}
          style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "480px", color: "#E5E7EB" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: "#E5E7EB", fontFamily: "var(--font-geist-mono, monospace)" }}>
            <span aria-hidden="true" style={{ display: "inline-flex", width: 18, height: 18, alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "rgba(242,92,5,0.16)", color: "#FF9B5B" }}>
              <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 8 3 3 7-7" /></svg>
            </span>
            <span>PHASE 1 <span aria-hidden="true" style={{ color: "#FF8A3D" }}>·</span> COMPLETED</span>
          </div>
          <div aria-hidden="true" style={{ height: 4, marginTop: 10, overflow: "hidden", borderRadius: 999, background: "rgba(255,255,255,0.12)" }}>
            <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", borderRadius: "inherit", background: "linear-gradient(90deg, #F25C05, #FF8A3D)" }}>
              {!reducedMotion && <motion.span aria-hidden="true" initial={{ x: "-110%" }} animate={{ x: "400%" }} transition={{ duration: 1.25, ease: "easeInOut" }} style={{ position: "absolute", inset: 0, width: "30%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)" }} />}
            </div>
          </div>
        </motion.div>
      ) : (
      /* Progress bar for active countdown phases. */
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "600px",
        }}
      >
        {/* Track */}
        <div
          style={{
            height: "5px",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.07)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Gradient fill */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${progress}%`,
              borderRadius: "inherit",
              background: `linear-gradient(90deg, ${accentColor}, #ffb07a)`,
              boxShadow: `0 0 14px 2px ${accentColor}55`,
              transition: "width 1s linear",
            }}
          />
          {/* Shimmer */}
          {!reducedMotion && <motion.div
            aria-hidden
            animate={{ x: ["-120%", "220%"] }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 1.8,
            }}
            style={{
              position: "absolute",
              inset: 0,
              width: "28%",
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)",
              borderRadius: "inherit",
            }}
          />}
        </div>

        {/* Labels */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "9px",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#D1D5DB",
            fontFamily: "var(--font-geist-mono, monospace)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span>Time elapsed</span>
          <span style={{ color: "#FF8A3D" }}>{progress.toFixed(1)}%</span>
        </div>
      </motion.div>
      )}

      {/* Responsive: hide middle divider when 2×2 wrapping on mobile */}
      <style>{`
        .countdown-display .results-button-arrow { transition: transform 180ms ease; }
        .countdown-display a:hover .results-button-arrow { transform: translateX(4px); }
        .countdown-display a:focus-visible { outline: 3px solid #FFB27E; outline-offset: 4px; }
        @media (max-width: 479px) {
          .countdown-divider { display: none !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .countdown-display .results-button-arrow { transition: none !important; }
        }
        @media (min-width: 480px) {
          .countdown-divider { display: flex !important; }
        }
      `}</style>
    </section>
  );
}
