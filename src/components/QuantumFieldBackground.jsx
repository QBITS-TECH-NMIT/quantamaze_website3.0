"use client";

import { useEffect, useRef } from "react";

const TAU = Math.PI * 2;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (start, end, amount) => start + (end - start) * amount;

export default function QuantumFieldBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const desktopNodeCount = 40;
    const mobileNodeCount = 16;

    const maxDpr = 2;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let animationFrame = 0;
    let pointer = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5, active: false };
    let nodes = [];
    let shockwaves = [];
    let packets = [];
    let sectionBias = 0;
    let lastTimestamp = 0;
    let lastEggTimestamp = 0;
    let eggState = null;
    let visible = !document.hidden;

    function getNodeCount() {
      return reducedMotion ? 8 : coarsePointer ? mobileNodeCount : desktopNodeCount;
    }

    function getAccentColor() {
      const blend = (sectionBias + 1) / 2;
      const orange = [255, 107, 26];
      const teal = [42, 217, 201];

      return [
        Math.round(lerp(orange[0], teal[0], blend)),
        Math.round(lerp(orange[1], teal[1], blend)),
        Math.round(lerp(orange[2], teal[2], blend)),
      ];
    }

    function updateSectionBias() {
      const maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1);
      const progress = clamp(window.scrollY / maxScroll, 0, 1);
      sectionBias = progress * 2 - 1;
    }

    function makeNode() {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: 1.6 + Math.random() * 2.8,
        phase: Math.random() * TAU,
        hueShift: Math.random() > 0.72 ? 1 : 0,
      };
    }

    function seedNodes() {
      nodes = Array.from({ length: getNodeCount() }, () => makeNode());
    }

    function triggerShockwave(x, y) {
      shockwaves.push({
        x,
        y,
        radius: 18,
        maxRadius: coarsePointer ? 160 : 220,
        life: 1,
        hueShift: Math.random() > 0.5 ? 1 : 0,
      });
    }

    function createPacket(from, to) {
      packets.push({
        from,
        to,
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.005,
      });
    }

    function maybeSpawnPacket() {
      if (reducedMotion || nodes.length < 2) return;

      if (Math.random() < 0.045) {
        const from = nodes[Math.floor(Math.random() * nodes.length)];
        const to = nodes[Math.floor(Math.random() * nodes.length)];
        if (from !== to) {
          createPacket(from, to);
        }
      }
    }

    function startEggSequence() {
      if (reducedMotion || nodes.length < 8) return;

      const centerX = width * 0.5;
      const centerY = height * 0.48;
      const itemCount = nodes.length;

      const points = Array.from({ length: itemCount }, (_, index) => {
        const t = index / Math.max(1, itemCount - 1);
        const angle = -Math.PI * 0.75 + t * Math.PI * 1.55;
        const radius = 70 + (index % 6) * 13 + Math.sin(index * 0.7) * 20;
        const x = centerX + Math.cos(angle) * radius * 1.2;
        const y = centerY + Math.sin(angle) * radius * 0.9;
        const offset = (index % 2 === 0 ? 1 : -1) * 20;

        return {
          x: clamp(x + offset, 20, width - 20),
          y: clamp(y + offset, 20, height - 20),
        };
      });

      eggState = {
        startedAt: performance.now(),
        duration: 1800,
        points,
      };
    }

    function resizeCanvas() {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width || window.innerWidth;
      height = bounds.height || window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, maxDpr);

      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!nodes.length) {
        seedNodes();
      }
    }

    function updateNodes(deltaTime, time) {
      const attractionRange = coarsePointer ? 160 : 220;
      const accent = getAccentColor();

      if (eggState && time - eggState.startedAt < eggState.duration) {
        const progress = clamp((time - eggState.startedAt) / eggState.duration, 0, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        nodes.forEach((node, index) => {
          const target = eggState.points[index % eggState.points.length];
          if (!target) return;

          const dx = (target.x - node.x) * 0.018;
          const dy = (target.y - node.y) * 0.018;

          node.vx += dx * (1.1 - eased * 0.7);
          node.vy += dy * (1.1 - eased * 0.7);
        });
      }

      nodes.forEach((node, index) => {
        const driftX = Math.sin(time * 0.00042 + node.phase + index * 0.5) * 0.18;
        const driftY = Math.cos(time * 0.00053 + node.phase * 1.3 + index * 0.35) * 0.18;

        node.vx += driftX;
        node.vy += driftY;

        if (pointer.active) {
          const dx = pointer.x - node.x;
          const dy = pointer.y - node.y;
          const distance = Math.hypot(dx, dy) || 1;

          if (distance < attractionRange) {
            const force = (1 - distance / attractionRange) * (coarsePointer ? 0.25 : 0.32);
            node.vx += (dx / distance) * force * 0.8;
            node.vy += (dy / distance) * force * 0.8;
          }
        }

        node.vx *= 0.97;
        node.vy *= 0.97;
        node.x += node.vx * deltaTime;
        node.y += node.vy * deltaTime;

        const margin = 24;
        if (node.x < margin) {
          node.x = margin;
          node.vx *= -0.7;
        }
        if (node.x > width - margin) {
          node.x = width - margin;
          node.vx *= -0.7;
        }
        if (node.y < margin) {
          node.y = margin;
          node.vy *= -0.7;
        }
        if (node.y > height - margin) {
          node.y = height - margin;
          node.vy *= -0.7;
        }

        const pulse = 0.45 + Math.sin(time * 0.0016 + node.phase + index * 0.13) * 0.45;
        node.glow = clamp(pulse, 0.2, 1.4);
        node.hueShift = Math.abs(sectionBias) > 0.2 && index % 2 === 0 ? 1 : 0;
      });

      if (eggState && time - eggState.startedAt > eggState.duration) {
        eggState = null;
      }

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.hypot(dx, dy);
          const threshold = coarsePointer ? 120 : 150;

          if (distance < threshold) {
            const alpha = (1 - distance / threshold) * 0.38;
            const lineHue = a.hueShift === 1 || b.hueShift === 1 ? accent : [255, 107, 26];
            context.beginPath();
            context.moveTo(a.x, a.y);
            context.lineTo(b.x, b.y);
            context.strokeStyle = `rgba(${lineHue[0]}, ${lineHue[1]}, ${lineHue[2]}, ${alpha})`;
            context.lineWidth = 1;
            context.stroke();
          }
        }
      }
    }

    function updateShockwaves(deltaTime) {
      if (!shockwaves.length) return;

      shockwaves.forEach((wave) => {
        wave.radius += (coarsePointer ? 1.9 : 2.8) * deltaTime;
        wave.life -= 0.012 * deltaTime;
      });

      shockwaves = shockwaves.filter((wave) => wave.life > 0.05 && wave.radius < wave.maxRadius);
    }

    function updatePackets(deltaTime) {
      if (!packets.length) return;

      packets.forEach((packet) => {
        packet.progress = (packet.progress + packet.speed * deltaTime) % 1;
      });

      packets = packets.filter((packet) => packet.progress < 0.98);
    }

    function drawContours(time) {
      const contourGap = coarsePointer ? 26 : 22;
      const lineShift = sectionBias * 22;

      for (let y = -20; y <= height + 40; y += contourGap) {
        context.beginPath();
        for (let x = -20; x <= width + 20; x += 4) {
          const waveA = Math.sin((x + time * 0.029) * 0.022 + y * 0.024) * 18;
          const waveB = Math.sin((x * 0.018) - time * 0.018 + y * 0.014) * 12;
          const depth = waveA + waveB + lineShift * Math.sin(x * 0.01 + time * 0.0004);
          const py = y + depth;

          if (x === -20) {
            context.moveTo(x, py);
          } else {
            context.lineTo(x, py);
          }
        }

        const alpha = reducedMotion ? 0.08 : 0.14 + (1 - y / (height + 40)) * 0.18;
        const tone = sectionBias > 0 ? [42, 217, 201] : [255, 107, 26];
        context.strokeStyle = `rgba(${tone[0]}, ${tone[1]}, ${tone[2]}, ${alpha})`;
        context.lineWidth = 1;
        context.stroke();
      }
    }

    function drawNodes() {
      const accent = getAccentColor();

      nodes.forEach((node) => {
        const isCool = node.hueShift === 1;
        const rgb = isCool ? [42, 217, 201] : accent;
        const glow = node.glow * (reducedMotion ? 0.7 : 1);

        context.beginPath();
        context.arc(node.x, node.y, node.radius + glow * 1.2, 0, TAU);
        context.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${0.62 + node.glow * 0.26})`;
        context.shadowBlur = reducedMotion ? 8 : 18;
        context.shadowColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.7)`;
        context.fill();
        context.shadowBlur = 0;
      });

      packets.forEach((packet) => {
        const x = lerp(packet.from.x, packet.to.x, packet.progress);
        const y = lerp(packet.from.y, packet.to.y, packet.progress);
        const orbSize = 2.8 + packet.progress * 2.4;
        const rgb = Math.random() > 0.5 ? [42, 217, 201] : [255, 107, 26];

        context.beginPath();
        context.arc(x, y, orbSize, 0, TAU);
        context.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.9)`;
        context.shadowBlur = 18;
        context.shadowColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.9)`;
        context.fill();
        context.shadowBlur = 0;
      });
    }

    function drawShockwaves() {
      shockwaves.forEach((wave) => {
        const alpha = clamp(wave.life, 0, 1);
        const rgb = wave.hueShift === 1 ? [42, 217, 201] : [255, 107, 26];
        context.beginPath();
        context.arc(wave.x, wave.y, wave.radius, 0, TAU);
        context.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha * 0.7})`;
        context.lineWidth = 1.4;
        context.stroke();
      });
    }

    function drawBackground(time) {
      const base = context.createRadialGradient(
        width * 0.5,
        height * 0.45,
        20,
        width * 0.5,
        height * 0.55,
        Math.max(width, height) * 0.8,
      );
      base.addColorStop(0, "rgba(15, 16, 18, 1)");
      base.addColorStop(0.45, "rgba(10, 10, 10, 1)");
      base.addColorStop(1, "rgba(8, 8, 10, 1)");
      context.fillStyle = base;
      context.fillRect(0, 0, width, height);

      const flare = context.createRadialGradient(
        width * (0.24 + Math.sin(time * 0.0002) * 0.1),
        height * (0.28 + Math.cos(time * 0.00018) * 0.12),
        0,
        width * 0.4,
        height * 0.35,
        width * 0.7,
      );
      flare.addColorStop(0, "rgba(255, 107, 26, 0.10)");
      flare.addColorStop(0.45, "rgba(42, 217, 201, 0.06)");
      flare.addColorStop(1, "rgba(0, 0, 0, 0)");
      context.fillStyle = flare;
      context.fillRect(0, 0, width, height);

      drawContours(time);
    }

    function render(time) {
      if (!visible) return;

      const deltaTime = clamp((time - lastTimestamp || 16.67) / 16.67, 0.7, 1.6);
      lastTimestamp = time;

      context.clearRect(0, 0, width, height);
      drawBackground(time);
      updateNodes(deltaTime, time);
      drawShockwaves();
      drawNodes();
      updateShockwaves(deltaTime);
      updatePackets(deltaTime);

      if (time - lastEggTimestamp > 35000 + Math.random() * 10000) {
        lastEggTimestamp = time;
        startEggSequence();
      }

      maybeSpawnPacket();

      if (!reducedMotion) {
        animationFrame = requestAnimationFrame(render);
      }
    }

    function handlePointerMove(event) {
      const bounds = canvas.getBoundingClientRect();
      pointer = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
        active: true,
      };
    }

    function handlePointerLeave() {
      pointer.active = false;
    }

    function handleTouchMove(event) {
      if (!event.touches || !event.touches[0]) return;
      handlePointerMove(event.touches[0]);
    }

    function handleDeviceTilt(event) {
      if (!coarsePointer || !event.gamma && !event.beta) return;
      const gamma = clamp(event.gamma || 0, -30, 30) / 30;
      const beta = clamp(event.beta || 0, -30, 30) / 30;
      pointer = {
        x: width * 0.5 + gamma * width * 0.35,
        y: height * 0.5 + beta * height * 0.28,
        active: true,
      };
    }

    function handlePointerDown(event) {
      const bounds = canvas.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      triggerShockwave(x, y);
      pointer = { x, y, active: true };
    }

    function handleVisibilityChange() {
      visible = !document.hidden;
      if (visible && !animationFrame && !reducedMotion) {
        animationFrame = requestAnimationFrame(render);
      }
    }

    function handleScroll() {
      updateSectionBias();
    }

    function setup() {
      resizeCanvas();
      updateSectionBias();
      seedNodes();
      lastTimestamp = performance.now();

      if (!reducedMotion && visible) {
        animationFrame = requestAnimationFrame(render);
      }
    }

    setup();

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleDeviceTilt, { passive: true });
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("deviceorientation", handleDeviceTilt);

      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,107,26,0.12),transparent_42%),linear-gradient(180deg,#0a0a0a_0%,#111318_100%)]" />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-90"
        style={{ display: "block" }}
      />
    </div>
  );
}
