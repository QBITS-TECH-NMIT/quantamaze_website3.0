"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * ElectricBorderRenderer
 * Noise-displaced rounded-rectangle border animation renderer.
 */
export class ElectricBorderRenderer {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");

    this.width = options.width || 400;
    this.height = options.height || 300;
    this.octaves = options.octaves || 10;
    this.lacunarity = options.lacunarity || 1.6;
    this.gain = options.gain || 0.7;
    this.amplitude = options.amplitude || 0.075;
    this.frequency = options.frequency || 10;
    this.baseFlatness = options.baseFlatness || 0;
    this.displacement = options.displacement || 50;
    this.speed = options.speed || 1.5;
    this.borderOffset = options.borderOffset || 50;
    this.borderRadius = options.borderRadius || 24;
    this.lineWidth = options.lineWidth || 1.2;
    this.color = options.color || "#E2E8F0";

    this.animationId = null;
    this.time = 0;
    this.lastFrameTime = 0;
    this.isRunning = false;

    this.resize(this.width, this.height);
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    if (this.canvas) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  // Random function - creates pseudo-random values from coordinates
  random(x) {
    return (Math.sin(x * 12.9898) * 43758.5453) % 1;
  }

  // 2D noise function for proper time animation
  noise2D(x, y) {
    const i = Math.floor(x);
    const j = Math.floor(y);
    const fx = x - i;
    const fy = y - j;

    const a = this.random(i + j * 57);
    const b = this.random(i + 1 + j * 57);
    const c = this.random(i + (j + 1) * 57);
    const d = this.random(i + 1 + (j + 1) * 57);

    const ux = fx * fx * (3.0 - 2.0 * fx);
    const uy = fy * fy * (3.0 - 2.0 * fy);

    return (
      a * (1 - ux) * (1 - uy) +
      b * ux * (1 - uy) +
      c * (1 - ux) * uy +
      d * ux * uy
    );
  }

  // Octaved noise function
  octavedNoise(
    x,
    octaves,
    lacunarity,
    gain,
    baseAmplitude,
    baseFrequency,
    time = 0,
    seed = 0,
    baseFlatness = 1.0
  ) {
    let y = 0;
    let amplitude = baseAmplitude;
    let frequency = baseFrequency;

    for (let i = 0; i < octaves; i++) {
      let octaveAmplitude = amplitude;
      if (i === 0) {
        octaveAmplitude *= baseFlatness;
      }
      y +=
        octaveAmplitude *
        this.noise2D(frequency * x + seed * 100, time * frequency * 0.3);
      frequency *= lacunarity;
      amplitude *= gain;
    }

    return y;
  }

  // Get a point on a rounded rectangle perimeter using arc-length parameterization
  getRoundedRectPoint(t, left, top, width, height, radius) {
    const straightWidth = width - 2 * radius;
    const straightHeight = height - 2 * radius;
    const cornerArc = (Math.PI * radius) / 2;
    const totalPerimeter =
      2 * straightWidth + 2 * straightHeight + 4 * cornerArc;

    const distance = t * totalPerimeter;
    let accumulated = 0;

    // Top edge
    if (distance <= accumulated + straightWidth) {
      const progress = (distance - accumulated) / straightWidth;
      return { x: left + radius + progress * straightWidth, y: top };
    }
    accumulated += straightWidth;

    // Top-right corner
    if (distance <= accumulated + cornerArc) {
      const progress = (distance - accumulated) / cornerArc;
      return this.getCornerPoint(
        left + width - radius,
        top + radius,
        radius,
        -Math.PI / 2,
        Math.PI / 2,
        progress
      );
    }
    accumulated += cornerArc;

    // Right edge
    if (distance <= accumulated + straightHeight) {
      const progress = (distance - accumulated) / straightHeight;
      return { x: left + width, y: top + radius + progress * straightHeight };
    }
    accumulated += straightHeight;

    // Bottom-right corner
    if (distance <= accumulated + cornerArc) {
      const progress = (distance - accumulated) / cornerArc;
      return this.getCornerPoint(
        left + width - radius,
        top + height - radius,
        radius,
        0,
        Math.PI / 2,
        progress
      );
    }
    accumulated += cornerArc;

    // Bottom edge
    if (distance <= accumulated + straightWidth) {
      const progress = (distance - accumulated) / straightWidth;
      return {
        x: left + width - radius - progress * straightWidth,
        y: top + height,
      };
    }
    accumulated += straightWidth;

    // Bottom-left corner
    if (distance <= accumulated + cornerArc) {
      const progress = (distance - accumulated) / cornerArc;
      return this.getCornerPoint(
        left + radius,
        top + height - radius,
        radius,
        Math.PI / 2,
        Math.PI / 2,
        progress
      );
    }
    accumulated += cornerArc;

    // Left edge
    if (distance <= accumulated + straightHeight) {
      const progress = (distance - accumulated) / straightHeight;
      return { x: left, y: top + height - radius - progress * straightHeight };
    }
    accumulated += straightHeight;

    // Top-left corner
    const progress = (distance - accumulated) / cornerArc;
    return this.getCornerPoint(
      left + radius,
      top + radius,
      radius,
      Math.PI,
      Math.PI / 2,
      progress
    );
  }

  getCornerPoint(centerX, centerY, radius, startAngle, arcLength, progress) {
    const angle = startAngle + progress * arcLength;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  }

  drawElectricBorder(currentTime = 0) {
    if (!this.canvas || !this.ctx) return;

    const deltaTime = this.lastFrameTime
      ? (currentTime - this.lastFrameTime) / 1000
      : 0.016;
    this.time += Math.min(deltaTime, 0.1) * this.speed;
    this.lastFrameTime = currentTime;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    const scale = this.displacement;
    const left = this.borderOffset;
    const top = this.borderOffset;
    const borderWidth = this.canvas.width - 2 * this.borderOffset;
    const borderHeight = this.canvas.height - 2 * this.borderOffset;

    if (borderWidth <= 0 || borderHeight <= 0) return;

    const maxRadius = Math.min(borderWidth, borderHeight) / 2;
    const radius = Math.min(this.borderRadius, maxRadius);

    const approximatePerimeter =
      2 * (borderWidth + borderHeight) + 2 * Math.PI * radius;
    const sampleCount = Math.max(30, Math.floor(approximatePerimeter / 2));

    this.ctx.beginPath();

    for (let i = 0; i <= sampleCount; i++) {
      const progress = i / sampleCount;

      const point = this.getRoundedRectPoint(
        progress,
        left,
        top,
        borderWidth,
        borderHeight,
        radius
      );

      const xNoise = this.octavedNoise(
        progress * 8,
        this.octaves,
        this.lacunarity,
        this.gain,
        this.amplitude,
        this.frequency,
        this.time,
        0,
        this.baseFlatness
      );

      const yNoise = this.octavedNoise(
        progress * 8,
        this.octaves,
        this.lacunarity,
        this.gain,
        this.amplitude,
        this.frequency,
        this.time,
        1,
        this.baseFlatness
      );

      const displacedX = point.x + xNoise * scale;
      const displacedY = point.y + yNoise * scale;

      if (i === 0) {
        this.ctx.moveTo(displacedX, displacedY);
      } else {
        this.ctx.lineTo(displacedX, displacedY);
      }
    }

    this.ctx.closePath();
    this.ctx.stroke();

    if (this.isRunning) {
      this.animationId = requestAnimationFrame((time) =>
        this.drawElectricBorder(time)
      );
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.animationId = requestAnimationFrame((time) =>
      this.drawElectricBorder(time)
    );
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  renderStatic() {
    this.drawElectricBorder(0);
  }
}

/**
 * ElectricBorderCanvas React Component
 * Self-attaching, responsive canvas that wraps around the target card.
 */
export default function ElectricBorderCanvas({
  containerRef,
  canvasId = "electric-border-canvas-platinum",
  color = "#E2E8F0",
  borderRadius = 24,
  borderOffset = 50,
  displacement = 45,
  speed = 1.4,
  lineWidth = 1.2,
}) {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new ElectricBorderRenderer(canvas, {
      color,
      borderRadius,
      borderOffset,
      displacement,
      speed,
      lineWidth,
      octaves: 10,
      lacunarity: 1.6,
      gain: 0.7,
      amplitude: 0.075,
      frequency: 10,
      baseFlatness: 0,
    });
    rendererRef.current = renderer;

    const updateDimensions = () => {
      if (!containerRef?.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      const w = Math.round(rect.width + 2 * borderOffset);
      const h = Math.round(rect.height + 2 * borderOffset);
      if (w > 0 && h > 0) {
        renderer.resize(w, h);
        if (shouldReduceMotion) {
          renderer.renderStatic();
        }
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    if (containerRef?.current) {
      resizeObserver.observe(containerRef.current);
    }

    // IntersectionObserver to pause when out of viewport
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !shouldReduceMotion) {
          renderer.start();
        } else {
          renderer.stop();
          if (shouldReduceMotion) {
            renderer.renderStatic();
          }
        }
      },
      { threshold: 0.05 }
    );

    if (containerRef?.current) {
      intersectionObserver.observe(containerRef.current);
    }

    return () => {
      renderer.stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [
    containerRef,
    color,
    borderRadius,
    borderOffset,
    displacement,
    speed,
    lineWidth,
    shouldReduceMotion,
  ]);

  return (
    <div className="electric-canvas-container pointer-events-none" aria-hidden="true">
      <canvas
        ref={canvasRef}
        id={canvasId}
        className="electric-border-canvas"
      />
    </div>
  );
}
