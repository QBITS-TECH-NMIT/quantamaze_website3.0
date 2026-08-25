"use client";

import { useEffect, useRef } from "react";

const TAU = Math.PI * 2;
const INTERACTION_RADIUS = 150;
const BASE_RADIUS = 2;
const ACTIVE_RADIUS = 5.5;
const BASE_OPACITY = 0.25;
const ACTIVE_OPACITY = 1;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (start, end, amount) => start + (end - start) * amount;

export default function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: -9999, y: -9999, active: false };
    let width = 0;
    let height = 0;
    let dots = [];
    let rafId = 0;
    let lastTime = 0;
    let visible = !document.hidden;

    function generateDots() {
      const spacing = window.innerWidth < 768 ? 42 : window.innerWidth < 1400 ? 36 : 30;
      dots = [];

      for (let y = 0; y <= height + spacing; y += spacing) {
        for (let x = 0; x <= width + spacing; x += spacing) {
          dots.push({
            x,
            y,
            radius: BASE_RADIUS,
            opacity: BASE_OPACITY,
          });
        }
      }
    }

    function resizeCanvas() {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      generateDots();
    }

    function updateDots(delta) {
      for (const dot of dots) {
        let targetRadius = BASE_RADIUS;
        let targetOpacity = BASE_OPACITY;

        if (pointer.active) {
          const dx = dot.x - pointer.x;
          const dy = dot.y - pointer.y;
          const distance = Math.hypot(dx, dy);

          if (distance < INTERACTION_RADIUS) {
            const influence = 1 - distance / INTERACTION_RADIUS;
            const eased = influence * influence;
            targetRadius = lerp(BASE_RADIUS, ACTIVE_RADIUS, eased);
            targetOpacity = lerp(BASE_OPACITY, ACTIVE_OPACITY, eased);
          }
        }

        const smoothing = reducedMotion ? 0.12 * delta : 0.18 * delta;
        dot.radius += (targetRadius - dot.radius) * smoothing;
        dot.opacity += (targetOpacity - dot.opacity) * smoothing;
      }
    }

    function renderFrame(time) {
      if (!visible) {
        rafId = 0;
        return;
      }

      const delta = clamp((time - (lastTime || time)) / 16.67, 0.5, 1.5);
      lastTime = time;

      context.clearRect(0, 0, width, height);
      context.fillStyle = "#0a0a0a";
      context.fillRect(0, 0, width, height);

      updateDots(delta);

      for (const dot of dots) {
        context.beginPath();
        context.arc(dot.x, dot.y, dot.radius, 0, TAU);
        context.fillStyle = `rgba(255, 107, 26, ${dot.opacity})`;
        context.fill();
      }

      if (!reducedMotion) {
        rafId = window.requestAnimationFrame(renderFrame);
      }
    }

    function handlePointerMove(event) {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    }

    function handlePointerLeave() {
      pointer.active = false;
    }

    function handleTouchMove(event) {
      if (!event.touches || !event.touches[0]) return;
      pointer.x = event.touches[0].clientX;
      pointer.y = event.touches[0].clientY;
      pointer.active = true;
    }

    function handleVisibilityChange() {
      visible = !document.hidden;
      if (visible && !rafId && !reducedMotion) {
        rafId = window.requestAnimationFrame(renderFrame);
      }
    }

    resizeCanvas();
    lastTime = performance.now();

    if (!reducedMotion && visible) {
      rafId = window.requestAnimationFrame(renderFrame);
    }

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("mouseleave", handlePointerLeave);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseleave", handlePointerLeave);
      window.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 block"
      style={{
        width: "100vw",
        height: "100dvh",
        zIndex: -1,
        background: "#0a0a0a",
      }}
    />
  );
}
