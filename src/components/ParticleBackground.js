"use client";

import { useEffect, useRef } from "react";

export default function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let particles = [];
    let mouse = { x: -9999, y: -9999, radius: 160 };
    let animationId;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
    }

    function initParticles() {
      particles = [];
      const area = window.innerWidth * window.innerHeight;
      const count = Math.max(60, Math.floor(area / 25000));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: 1.2 + Math.random() * 1.5,
        });
      }
    }

    function handleMouseMove(e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }

    function handleMouseOut() {
      mouse.x = -9999;
      mouse.y = -9999;
    }

    function draw() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const p of particles) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);

        if (dist < mouse.radius) {
          const push = (mouse.radius - dist) / mouse.radius;
          const nx = dx / (dist || 1);
          const ny = dy / (dist || 1);
          const strength = push * push * 5;
          p.vx += nx * strength * 0.03;
          p.vy += ny * strength * 0.03;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy *= 0.985;

        if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
        if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;

        ctx.fillStyle = "rgba(249,115,22,0.7)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseOut);

    resize();
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseOut);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
}