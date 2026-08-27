"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const STAGE = {
  IDLE: "idle",
  EXPLODING: "exploding",
  WHITEOUT: "whiteout",
  REVEAL: "reveal",
  DISMISSING: "dismissing",
};

const TIMING = {
  SHAKE_END: 980,
  CHROMATIC_END: 260,
  WHITEOUT_START: 2200,
  REVEAL_START: 3100,
};

const SHOCKWAVE_COUNT = 5;
const STREAK_COUNT = 28;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return reduced;
}

function createParticles(count, originX, originY, options = {}) {
  const {
    minDistance = 120,
    maxDistance = 520,
    minDelay = 0,
    maxDelay = 120,
    minDuration = 900,
    maxDuration = 1500,
    minSize = 2,
    maxSize = 7,
    streak = false,
  } = options;

  const colors = ["#ff6b1a", "#ff8c32", "#ffc46b", "#fff5e8", "#ffffff", "#ff4500"];

  return Array.from({ length: count }, (_, index) => {
    const angle = Math.random() * Math.PI * 2;
    const distance = minDistance + Math.random() * (maxDistance - minDistance);

    return {
      id: `${minDelay}-${index}`,
      x: originX,
      y: originY,
      tx: Math.cos(angle) * distance,
      ty: Math.sin(angle) * distance,
      size: minSize + Math.random() * (maxSize - minSize),
      delay: minDelay + Math.random() * (maxDelay - minDelay),
      duration: minDuration + Math.random() * (maxDuration - minDuration),
      color: colors[Math.floor(Math.random() * colors.length)],
      streak,
      rotate: `${angle}rad`,
    };
  });
}

export default function CosmicExplosionOverlay({
  active,
  origin = { x: 0, y: 0 },
  onAnimationComplete,
  onDismiss,
  onReset,
  registrationUrl = "REGISTRATION_URL_HERE",
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [stage, setStage] = useState(STAGE.IDLE);
  const [shake, setShake] = useState(false);
  const [chromatic, setChromatic] = useState(false);
  const skipRef = useRef(false);
  const timersRef = useRef([]);

  const primaryParticles = useMemo(() => {
    if (!active || reducedMotion) return [];
    return createParticles(110, origin.x, origin.y, {
      minDistance: 140,
      maxDistance: 560,
      minDelay: 320,
      maxDelay: 520,
      minDuration: 1000,
      maxDuration: 1800,
    });
  }, [active, origin.x, origin.y, reducedMotion]);

  const debrisParticles = useMemo(() => {
    if (!active || reducedMotion) return [];
    return createParticles(75, origin.x, origin.y, {
      minDistance: 80,
      maxDistance: 420,
      minDelay: 380,
      maxDelay: 620,
      minDuration: 1100,
      maxDuration: 1900,
      minSize: 3,
      maxSize: 9,
    });
  }, [active, origin.x, origin.y, reducedMotion]);

  const sparkParticles = useMemo(() => {
    if (!active || reducedMotion) return [];
    return createParticles(36, origin.x, origin.y, {
      minDistance: 200,
      maxDistance: 680,
      minDelay: 480,
      maxDelay: 720,
      minDuration: 700,
      maxDuration: 1200,
      minSize: 1,
      maxSize: 3,
      streak: true,
    });
  }, [active, origin.x, origin.y, reducedMotion]);

  const shockwaves = useMemo(
    () => Array.from({ length: SHOCKWAVE_COUNT }, (_, index) => index),
    [],
  );

  const streaks = useMemo(
    () => Array.from({ length: STREAK_COUNT }, (_, index) => index),
    [],
  );

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const schedule = useCallback((callback, delay) => {
    const timer = window.setTimeout(callback, delay);
    timersRef.current.push(timer);
    return timer;
  }, []);

  const skipToReveal = useCallback(() => {
    if (skipRef.current || stage === STAGE.REVEAL || stage === STAGE.DISMISSING) return;
    skipRef.current = true;
    clearTimers();
    setShake(false);
    setChromatic(false);
    setStage(STAGE.REVEAL);
  }, [clearTimers, stage]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!active) {
      clearTimers();
      skipRef.current = false;
      setStage(STAGE.IDLE);
      setShake(false);
      setChromatic(false);
      return undefined;
    }

    skipRef.current = false;

    if (reducedMotion) {
      setStage(STAGE.WHITEOUT);
      schedule(() => setStage(STAGE.REVEAL), 320);
      return clearTimers;
    }

    setStage(STAGE.EXPLODING);
    setShake(true);
    setChromatic(true);

    schedule(() => setChromatic(false), TIMING.CHROMATIC_END);
    schedule(() => setShake(false), TIMING.SHAKE_END);
    schedule(() => setStage(STAGE.WHITEOUT), TIMING.WHITEOUT_START);
    schedule(() => setStage(STAGE.REVEAL), TIMING.REVEAL_START);

    return clearTimers;
  }, [active, clearTimers, reducedMotion, schedule]);

  useEffect(() => {
    if (!active) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [active]);

  // Notify the parent when the reveal card becomes visible so it can transition
  // isAnimating → false and isRevealed → true. This covers all three paths to REVEAL:
  // the normal timer, the reducedMotion shortcut, and the user clicking to skip.
  useEffect(() => {
    if (stage === STAGE.REVEAL) {
      onAnimationComplete?.();
    }
  }, [stage, onAnimationComplete]);

  const handleDismiss = useCallback(() => {
    setStage(STAGE.DISMISSING);
    schedule(() => {
      onDismiss?.();
      setStage(STAGE.IDLE);
    }, 380);
  }, [onDismiss, schedule]);

  const handleReset = useCallback(() => {
    setStage(STAGE.DISMISSING);
    schedule(() => {
      onReset?.();
      setStage(STAGE.IDLE);
    }, 380);
  }, [onReset, schedule]);

  if (!mounted || !active) return null;

  const isExploding = stage === STAGE.EXPLODING;
  const isWhiteoutStage = stage === STAGE.WHITEOUT;
  const isWhiteout = isWhiteoutStage || stage === STAGE.REVEAL || stage === STAGE.DISMISSING;
  const isReveal = stage === STAGE.REVEAL;
  const isDismissing = stage === STAGE.DISMISSING;
  const canSkip = isExploding || isWhiteoutStage;
  const showCosmicFx = (isExploding || isWhiteoutStage) && !reducedMotion;

  const renderParticle = (particle) => (
    <span
      key={particle.id}
      className={particle.streak ? "cosmic-spark" : "cosmic-particle"}
      style={{
        left: particle.x - particle.size / 2,
        top: particle.y - particle.size / 2,
        width: particle.streak ? particle.size : particle.size,
        height: particle.streak ? particle.size * 14 : particle.size,
        backgroundColor: particle.color,
        "--tx": `${particle.tx}px`,
        "--ty": `${particle.ty}px`,
        "--delay": `${particle.delay}ms`,
        "--duration": `${particle.duration}ms`,
        "--rotate": particle.rotate ?? "0rad",
      }}
    />
  );

  return createPortal(
    <div
      className={[
        "cosmic-easter-egg",
        shake ? "cosmic-easter-egg--shake" : "",
        chromatic ? "cosmic-easter-egg--chromatic" : "",
        reducedMotion ? "cosmic-easter-egg--reduced" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={canSkip ? skipToReveal : (isReveal ? handleDismiss : undefined)}
      onKeyDown={(event) => {
        if (canSkip && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          skipToReveal();
        } else if (isReveal && event.key === "Escape") {
          event.preventDefault();
          handleDismiss();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cosmic-easter-egg-title"
    >
      {showCosmicFx && (
        <div
          className={[
            "cosmic-fx-layer",
            isWhiteoutStage ? "cosmic-fx-layer--dissolve" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{
            "--origin-x": `${origin.x}px`,
            "--origin-y": `${origin.y}px`,
          }}
          aria-hidden="true"
        >
          <div className="cosmic-void" />

          <div
            className="cosmic-implosion"
            style={{ left: origin.x, top: origin.y }}
          />

          <div
            className="cosmic-core-flash"
            style={{ left: origin.x, top: origin.y }}
          />

          <div
            className="cosmic-burst cosmic-burst--primary"
            style={{ left: origin.x, top: origin.y }}
          />

          <div
            className="cosmic-burst cosmic-burst--secondary"
            style={{ left: origin.x, top: origin.y }}
          />

          <div
            className="cosmic-nebula"
            style={{ left: origin.x, top: origin.y }}
          />

          {shockwaves.map((ring) => (
            <div
              key={`shock-${ring}`}
              className="cosmic-shockwave"
              style={{
                left: origin.x,
                top: origin.y,
                "--ring-index": ring,
              }}
            />
          ))}

          {streaks.map((streak) => (
            <div
              key={`streak-${streak}`}
              className="cosmic-streak"
              style={{
                left: origin.x,
                top: origin.y,
                "--streak-index": streak,
              }}
            />
          ))}

          <div className="cosmic-particle-field">
            {primaryParticles.map(renderParticle)}
            {debrisParticles.map(renderParticle)}
            {sparkParticles.map(renderParticle)}
          </div>
        </div>
      )}

      <div
        aria-hidden="true"
        className={[
          "cosmic-whiteout",
          isWhiteoutStage && !isDismissing ? "cosmic-whiteout--building" : "",
          isReveal && !isDismissing ? "cosmic-whiteout--visible" : "",
          isDismissing ? "cosmic-whiteout--dismissing" : "",
          reducedMotion ? "cosmic-whiteout--reduced" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      />

      {(isReveal || isDismissing) && (
        <div
          className={[
            "cosmic-reveal",
            isReveal && !isDismissing ? "cosmic-reveal--visible" : "",
            isDismissing ? "cosmic-reveal--dismissing" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="cosmic-reveal__close"
            onClick={handleDismiss}
            aria-label="Close"
          >
            ×
          </button>

          <p className="cosmic-reveal__kicker">Quantum anomaly detected</p>
          <h2 id="cosmic-easter-egg-title" className="cosmic-reveal__title">
            Secret unlocked.
          </h2>
          <p className="cosmic-reveal__subtitle">
            You found the hidden shortcut to Quant-A-Maze 3.0 registration.
          </p>

          <div className="cosmic-reveal__actions">
            <a
              href={registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cosmic-reveal__btn cosmic-reveal__btn--primary"
            >
              Register
            </a>
            <button
              type="button"
              onClick={handleReset}
              className="cosmic-reveal__btn cosmic-reveal__btn--secondary"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
