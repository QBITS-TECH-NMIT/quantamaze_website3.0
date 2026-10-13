"use client";

import { useEffect, useRef } from "react";

/* Step timings — keep these at the top so the sequence is easy to tune. */
const HAND_ENTER_MS = 500;
const HAND_TRAVEL_BASE_MS = 350;
const HAND_TRAVEL_MAX_MS = 800;
const HAND_HOLD_MS = 300;
const HAND_RETREAT_MS = 500;
const HAND_TILT_DEG = 10;
const WICK = { x: 80, y: 32 }; // flame base in SVG units — travel aims this at the diya wick
const GRIP = { x: 85, y: 165 }; // fist center; tilt rotates around here, not the SVG corner
const VIEW_W = 160;
const VIEW_H = 300;

function prefersReducedMotion() {
  return typeof window !== "undefined"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function restPoint(container) {
  const w = container.clientWidth;
  const h = container.clientHeight;
  return { x: w * 0.82, y: h * 1.12, rotate: 0 };
}

function travelMs(from, to) {
  const dist = Math.hypot(to.x - from.x, to.y - from.y);
  return Math.min(HAND_TRAVEL_MAX_MS, HAND_TRAVEL_BASE_MS + dist);
}

/**
 * One hand. Parent replaces instant setLit with enqueueLight(i).
 * Visual lighting is applied only at the hold (step 4), via onIgnite.
 */
export default function HandWithCandle({
  containerRef,
  diyaRefs,
  rotateLampRef,
  enqueueLightRef,
  onIgnite,
  onClear,
  sharedLitKey,
}) {
  const handRef = useRef(null);
  const queueRef = useRef([]);
  const queuedSetRef = useRef(new Set());
  const litRef = useRef(new Set());
  const runningRef = useRef(false);
  const posRef = useRef({ x: 0, y: 0, rotate: 0 });
  const hiddenRef = useRef(true);
  const cancelledRef = useRef(false);
  const animsRef = useRef(new Set());
  const currentTargetRef = useRef(null);
  const genRef = useRef(0);
  const diyaRefsRef = useRef(diyaRefs);

  useEffect(() => {
    diyaRefsRef.current = diyaRefs;
  }, [diyaRefs]);

  const cancelAnims = () => {
    animsRef.current.forEach((a) => a.cancel());
    animsRef.current.clear();
  };

  const applyTransform = (x, y, rotate, opacity) => {
    const el = handRef.current;
    if (!el) return;
    posRef.current = { x, y, rotate };
    el.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg)`;
    if (opacity !== undefined) el.style.opacity = String(opacity);
  };

  // Place WICK on the diya rim, compensating so a grip-centered tilt still hits the wick.
  const wickTranslate = (diyaX, diyaY, rotateDeg, scale) => {
    const rad = (rotateDeg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const gx = GRIP.x * scale;
    const gy = GRIP.y * scale;
    const wx = WICK.x * scale;
    const wy = WICK.y * scale;
    const dx = wx - gx;
    const dy = wy - gy;
    return {
      x: diyaX - (gx + dx * cos - dy * sin),
      y: diyaY - (gy + dx * sin + dy * cos),
    };
  };

  const targetForDiya = (index) => {
    const container = containerRef.current;
    const hand = handRef.current;
    const diyaRef = diyaRefsRef.current.current[index];
    const diya = diyaRef?.current || diyaRef;
    if (!container || !hand || !diya) return null;
    const scale = hand.clientWidth / VIEW_W;
    const c = container.getBoundingClientRect();
    const d = diya.getBoundingClientRect();
    const wickX = d.left + d.width / 2 - c.left;
    const wickY = d.top + d.height * 0.15 - c.top; // rim center, slightly above the bowl
    const t = wickTranslate(wickX, wickY, HAND_TILT_DEG, scale);
    return { x: t.x, y: t.y, rotate: HAND_TILT_DEG };
  };

  const play = (keyframes, duration, easing) => {
    const el = handRef.current;
    if (!el) return Promise.resolve();
    const anim = el.animate(keyframes, { duration, easing, fill: "forwards" });
    animsRef.current.add(anim);
    return anim.finished.finally(() => {
      animsRef.current.delete(anim);
      try { anim.commitStyles(); } catch { /* ignore */ }
      anim.cancel();
    });
  };

  const resetQueue = () => {
    genRef.current += 1;
    queueRef.current = [];
    queuedSetRef.current.clear();
    litRef.current.clear();
    currentTargetRef.current = null;
    runningRef.current = false;
    cancelAnims();
    const container = containerRef.current;
    if (container && handRef.current) {
      const rest = restPoint(container);
      hiddenRef.current = true;
      applyTransform(rest.x, rest.y, 0, 0);
    }
    onClear?.();
  };

  const runQueue = async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    const el = handRef.current;
    const container = containerRef.current;
    if (!el || !container) {
      runningRef.current = false;
      return;
    }

    const gen = genRef.current;
    const stale = () => cancelledRef.current || gen !== genRef.current;

    while (queueRef.current.length && !stale()) {
      const index = queueRef.current[0];
      currentTargetRef.current = index;

      if (prefersReducedMotion()) {
        await rotateLampRef.current?.(index);
        if (stale()) break;
        onIgnite(index);
        litRef.current.add(index);
        queueRef.current.shift();
        queuedSetRef.current.delete(index);
        currentTargetRef.current = null;
        continue;
      }

      await rotateLampRef.current?.(index);
      if (stale()) break;

      // Step 1 — slide in from rest (only when the hand is currently hidden).
      if (hiddenRef.current) {
        const rest = restPoint(container);
        applyTransform(rest.x, rest.y, 0, 0);
        await play(
          [
            { transform: `translate(${rest.x}px, ${rest.y}px) rotate(0deg)`, opacity: 0 },
            { transform: `translate(${rest.x}px, ${rest.y * 0.92}px) rotate(0deg)`, opacity: 1 },
          ],
          HAND_ENTER_MS,
          "ease-out",
        );
        if (stale()) break;
        applyTransform(rest.x, rest.y * 0.92, 0, 1);
        hiddenRef.current = false;
      }

      const dest = targetForDiya(index);
      if (!dest) {
        runningRef.current = false;
        requestAnimationFrame(() => { if (!cancelledRef.current) void runQueue(); });
        return;
      }

      // Step 2 — travel to this diya; duration scales with distance.
      const start = posRef.current;
      const ms = travelMs(start, dest);
      await play(
        [
          { transform: `translate(${start.x}px, ${start.y}px) rotate(${start.rotate}deg)`, opacity: 1 },
          { transform: `translate(${dest.x}px, ${dest.y}px) rotate(${dest.rotate}deg)`, opacity: 1 },
        ],
        ms,
        "ease-out",
      );
        if (stale()) break;
        applyTransform(dest.x, dest.y, dest.rotate, 1);

      // Step 3 — tilt and hold while the candle flame touches the wick.
      await play(
        [
          { transform: `translate(${dest.x}px, ${dest.y}px) rotate(${dest.rotate}deg)` },
          { transform: `translate(${dest.x}px, ${dest.y}px) rotate(${dest.rotate}deg)` },
        ],
        HAND_HOLD_MS,
        "ease-out",
      );
      if (stale()) break;

      // Step 4 — flip the existing lit visual (flame + glow) at the touch moment.
      onIgnite(index);
      litRef.current.add(index);
      queueRef.current.shift();
      queuedSetRef.current.delete(index);
      currentTargetRef.current = null;
    }

    // Step 5 — if another diya is queued, the loop continues without retreating.
    if (!stale() && !queueRef.current.length && !hiddenRef.current) {
      const rest = restPoint(container);
      const start = posRef.current;
      await play(
        [
          { transform: `translate(${start.x}px, ${start.y}px) rotate(${start.rotate}deg)`, opacity: 1 },
          { transform: `translate(${rest.x}px, ${rest.y}px) rotate(0deg)`, opacity: 0 },
        ],
        HAND_RETREAT_MS,
        "ease-out",
      );
      applyTransform(rest.x, rest.y, 0, 0);
      hiddenRef.current = true;
    }

    runningRef.current = false;
    if (!cancelledRef.current && queueRef.current.length) void runQueue();
  };

  useEffect(() => {
    cancelledRef.current = false;
    const container = containerRef.current;
    if (container) {
      const rest = restPoint(container);
      applyTransform(rest.x, rest.y, 0, 0);
    }

    // enqueueLight(i): FIFO, skip if already lit or already queued.
    enqueueLightRef.current = (index) => {
      if (litRef.current.has(index) || queuedSetRef.current.has(index)) return;
      if (prefersReducedMotion()) {
        litRef.current.add(index);
        onIgnite(index);
        return;
      }
      queuedSetRef.current.add(index);
      queueRef.current.push(index);
      void runQueue();
    };

    const onResize = () => {
      const i = currentTargetRef.current;
      if (i == null || hiddenRef.current) return;
      const dest = targetForDiya(i);
      if (dest) applyTransform(dest.x, dest.y, dest.rotate, 1);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    return () => {
      cancelledRef.current = true;
      cancelAnims();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      enqueueLightRef.current = () => {};
    };
    // Intentionally once: queue runner is kept in refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Shared reset (R): all diyas unlit → drop the queue and hide the hand.
  useEffect(() => {
    if (!sharedLitKey || !sharedLitKey.includes("1")) {
      resetQueue();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedLitKey]);

  return (
    <>
      <style>{`
        .hand-with-candle{
          position:absolute;left:0;top:0;z-index:4;width:18%;
          pointer-events:none;opacity:0;will-change:transform,opacity;
          transform-origin:${(GRIP.x / VIEW_W) * 100}% ${(GRIP.y / VIEW_H) * 100}%;
        }
        .hand-with-candle svg{display:block;width:100%;height:auto;overflow:visible}
        .candle-flame{
          transform-box:fill-box;transform-origin:50% 100%;
          animation:handCandleFlick .8s ease-in-out infinite;
        }
        @keyframes handCandleFlick{
          0%,100%{transform:scale(1,1);opacity:1}
          40%{transform:scale(.92,1.08);opacity:.92}
          70%{transform:scale(1.06,.94);opacity:1}
        }
        @media (prefers-reduced-motion:reduce){
          .candle-flame{animation:none}
        }
      `}</style>
      <div ref={handRef} className="hand-with-candle" aria-hidden="true">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
          <defs>
            <linearGradient id="handSkin" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f2c6a3" />
              <stop offset="1" stopColor="#c98f6a" />
            </linearGradient>
            <linearGradient id="handCuff" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#c9470a" />
              <stop offset="1" stopColor="#752605" />
            </linearGradient>
            <radialGradient id="handCandleFlame" cx=".5" cy=".8" r=".7">
              <stop offset="0" stopColor="#fff2e8" />
              <stop offset=".4" stopColor="#ff8c3a" />
              <stop offset="1" stopColor="#f5590a" />
            </radialGradient>
            <filter id="handDrop" x="-20%" y="-10%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#000" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* 1. Candle (back) — shaft is later covered by the closed fist */}
          <rect x="68" y="40" width="24" height="130" rx="4" fill="#f5efe6" />
          <rect x="68" y="154" width="24" height="16" rx="3" fill="#c9470a" opacity="0.85" />
          <line x1="80" y1="40" x2="80" y2="32" stroke="#3a1b10" strokeWidth="1.6" strokeLinecap="round" />
          <path className="candle-flame" fill="url(#handCandleFlame)" d="M80 32c-11-8-13-22-4-32 3 8 12 14 12 24 0 5-3 8-8 8z" />
          <circle data-flame-tip cx={WICK.x} cy={WICK.y} r="1.2" fill="transparent" />

          <g filter="url(#handDrop)">
            {/* 2. Forearm — extends past the viewBox so the wrist never shows a cut edge */}
            <path
              fill="url(#handSkin)"
              d="M48 208 C42 232 40 268 36 318 L36 360 L110 360 L110 318 C106 268 104 232 112 208 C110 198 50 198 48 208 Z"
            />
            <path fill="url(#handCuff)" d="M44 228 C42 236 42 248 40 258 L120 258 C118 248 116 236 116 228 C114 222 46 222 44 228 Z" />
            <path fill="rgba(90,40,18,0.28)" d="M46 238 H114 V244 H46 Z" />

            {/* 3. Palm / fist body — one connected base under every finger */}
            <rect x="40" y="118" width="90" height="96" rx="30" fill="url(#handSkin)" />
            <path fill="rgba(90,40,18,0.16)" d="M48 186 C70 206 100 206 122 186 L120 208 C96 222 72 222 48 208 Z" />

            {/* 4. Four curled fingers (front of candle). Left cap slightly rounder. */}
            {[120, 145, 170, 195].map((y) => (
              <g key={y}>
                <path
                  fill="url(#handSkin)"
                  stroke="rgba(120,70,40,0.45)"
                  strokeWidth="1.2"
                  d={`M58 ${y} H112 A13.5 13.5 0 0 1 112 ${y + 27} H58 A16 13.5 0 0 1 58 ${y} Z`}
                />
                <ellipse cx="86" cy={y + 24} rx="34" ry="4.5" fill="rgba(90,40,18,0.22)" />
                <ellipse cx="68" cy={y + 8} rx="22" ry="3.2" fill="rgba(255,244,230,0.3)" />
              </g>
            ))}

            {/* 5. Thumb — one path, attached to the fist, resting on the candle */}
            <path
              fill="url(#handSkin)"
              stroke="rgba(120,70,40,0.45)"
              strokeWidth="1.2"
              d="M46 168 C38 158 36 140 48 126 C56 116 62 112 70 112 C78 112 80 122 72 128 C66 132 58 140 54 152 C52 160 52 168 46 168 Z"
            />
            <path fill="rgba(255,244,230,0.22)" d="M50 132 C56 122 64 116 70 116 C66 118 58 126 52 136 Z" />
          </g>
        </svg>
      </div>
    </>
  );
}
