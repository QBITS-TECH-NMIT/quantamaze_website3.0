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

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */

function getTimeLeft(target) {
  const diff = new Date(target) - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1_000) % 60),
    expired: false,
  };
}

function getProgress(start, target) {
  const total = new Date(target) - new Date(start);
  const elapsed = Date.now() - new Date(start);
  return total <= 0 ? 100 : Math.min(100, Math.max(0, (elapsed / total) * 100));
}

/* ─────────────────────────────────────────────
   Single digit slot — flip/roll animation
───────────────────────────────────────────── */

function DigitSlot({ digit }) {
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
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={digit}
          style={{ display: "block", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}
          initial={{ y: "-110%", opacity: 0, rotateX: -60 }}
          animate={{ y: "0%", opacity: 1, rotateX: 0 }}
          exit={{ y: "110%", opacity: 0, rotateX: 60 }}
          transition={{ duration: 0.42, ease: [0.4, 0.0, 0.2, 1] }}
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* Only the digits that changed will animate — each slot has its own key. */
function AnimatedNumber({ value }) {
  const str = String(value).padStart(2, "0");
  return (
    <span style={{ display: "inline-flex", justifyContent: "center" }}>
      <DigitSlot digit={str[0]} />
      <DigitSlot digit={str[1]} />
    </span>
  );
}

/* ─────────────────────────────────────────────
   Glass-card segment
───────────────────────────────────────────── */

function TimerSegment({ value, label, isPulsing, accent, motionDelay }) {
  const glowHex = accent + "33";
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay: motionDelay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{
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
      {isPulsing && (
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
          isPulsing
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
        transition={isPulsing ? { duration: 1, repeat: Infinity, ease: "easeInOut" } : {}}
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
        <AnimatedNumber value={value} />
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

function DividerDots({ accent, delay }) {
  return (
    <div
      aria-hidden
      className="countdown-divider hidden sm:flex flex-col gap-2 self-center shrink-0 px-1"
    >
      {[0, 1].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.25, 0.8, 0.25] }}
          transition={{
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

function AmbientParticles({ accent }) {
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
  targetDate,
  startDate,
  label = "Launching In",
  accentColor = "#f5590a",
}) {
  const resolvedTarget = targetDate ?? new Date("2026-09-07T00:00:00+05:30");
  const resolvedStart =
    startDate ?? new Date(new Date(resolvedTarget).getTime() - 30 * 86_400_000);

  const [time, setTime] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function tick() {
      setTime(getTimeLeft(resolvedTarget));
      setProgress(getProgress(resolvedStart, resolvedTarget));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
    // resolvedTarget / resolvedStart are stable refs — deps are intentionally omitted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const display = time ?? { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const segments = [
    { key: "days",    value: display.days,    label: "Days"    },
    { key: "hours",   value: display.hours,   label: "Hours"   },
    { key: "minutes", value: display.minutes, label: "Minutes" },
    { key: "seconds", value: display.seconds, label: "Seconds" },
  ];

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "22px",
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

      <AmbientParticles accent={accentColor} />

      {/* Heading */}
      {label && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
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
          {label}
        </motion.p>
      )}

      {/* Cards + dividers */}
      <div
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
            />
            {i < segments.length - 1 && (
              <DividerDots
                accent={accentColor}
                delay={i * 0.55}
              />
            )}
          </div>
        ))}
      </div>

      {/* Progress bar */}
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
          <motion.div
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
          />
        </div>

        {/* Labels */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "9px",
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#4b5563",
            fontFamily: "var(--font-geist-mono, monospace)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span>Time elapsed</span>
          <span style={{ color: accentColor }}>{progress.toFixed(1)}%</span>
        </div>
      </motion.div>

      {/* Responsive: hide middle divider when 2×2 wrapping on mobile */}
      <style>{`
        @media (max-width: 479px) {
          .countdown-divider { display: none !important; }
        }
        @media (min-width: 480px) {
          .countdown-divider { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
