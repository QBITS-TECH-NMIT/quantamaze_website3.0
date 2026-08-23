"use client";

import { useEffect, useRef, useState } from "react";
import {
  MAZE_ENTRANCE,
  MAZE_EXIT,
  MAZE_SOLUTION,
  MAZE_VIEWBOX,
  MAZE_WALLS,
} from "@/lib/mazeData";

const LOADER_KEY = "qam_loader_seen";
const MAX_DURATION = 4500;
const MIN_DURATION = 700;

function loadAssets(onAssetLoaded) {
  const imageLoads = ["/logo.png", "/abt_theme.jpg"].map(
    (src) =>
      new Promise((resolve) => {
        const image = new Image();
        const complete = () => {
          onAssetLoaded();
          resolve();
        };
        image.onload = complete;
        image.onerror = complete;
        image.src = src;
      })
  );
  const video = document.createElement("video");
  const videoLoad = new Promise((resolve) => {
    const complete = () => {
      onAssetLoaded();
      resolve();
    };
    video.onloadeddata = complete;
    video.onerror = complete;
    video.src = "/fire-bg.mp4";
    video.load();
  });
  const fontLoad = (document.fonts?.ready || Promise.resolve()).then(() => onAssetLoaded());
  return Promise.all([...imageLoads, videoLoad, fontLoad]);
}

function solutionPath(points) {
  return points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`).join(" ");
}

export default function LoadingScreen({ onComplete }) {
  const pathRef = useRef(null);
  const frameRef = useRef(null);
  const startedRef = useRef(false);
  const targetProgressRef = useRef(0);
  const visualProgressRef = useRef(0);
  const pathLengthRef = useRef(1);
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cursor, setCursor] = useState({ x: MAZE_ENTRANCE[0], y: MAZE_ENTRANCE[1] });
  const [skipReady, setSkipReady] = useState(false);

  useEffect(() => {
    if (!pathRef.current) return undefined;
    const length = pathRef.current.getTotalLength();
    pathLengthRef.current = length;
    return undefined;
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const alreadySeen = window.sessionStorage.getItem(LOADER_KEY) === "true";

    if (alreadySeen && !startedRef.current) {
      setVisible(false);
      onComplete();
      return undefined;
    }

    startedRef.current = true;
    setReduced(prefersReducedMotion);
    if (prefersReducedMotion) targetProgressRef.current = 1;

    let complete = false;
    let finishing = false;
    let assetsReady = false;
    let minTimeReady = prefersReducedMotion;
    const startedAt = performance.now();
    const assetCount = 4;
    let loadedAssets = 0;
    const updateAssetProgress = () => {
      loadedAssets += 1;
      targetProgressRef.current = Math.min(1, loadedAssets / assetCount);
      if (loadedAssets === assetCount) {
        assetsReady = true;
        if (minTimeReady) finish();
      }
    };
    const assetPromise = loadAssets(updateAssetProgress);
    const minTimer = window.setTimeout(() => {
      minTimeReady = true;
      if (assetsReady || prefersReducedMotion) finish();
    }, prefersReducedMotion ? 60 : MIN_DURATION);
    const hardTimer = window.setTimeout(() => finish(), MAX_DURATION);
    const skipTimer = window.setTimeout(() => setSkipReady(true), 1000);

    function finish() {
      if (complete || finishing) return;
      finishing = true;
      targetProgressRef.current = 1;
      window.setTimeout(() => {
        complete = true;
        window.sessionStorage.setItem(LOADER_KEY, "true");
        setProgress(100);
        setFading(true);
        window.setTimeout(() => {
          setVisible(false);
          onComplete();
        }, prefersReducedMotion ? 400 : 620);
      }, prefersReducedMotion ? 0 : 620);
    }

    function animate(now) {
      if (!assetsReady && now - startedAt >= MAX_DURATION) targetProgressRef.current = 1;
      const current = visualProgressRef.current;
      const target = targetProgressRef.current;
      const next = prefersReducedMotion ? target : current + (target - current) * 0.085;
      visualProgressRef.current = Math.abs(target - next) < 0.001 ? target : next;
      setProgress(Math.round(visualProgressRef.current * 100));
      if (pathRef.current && pathLengthRef.current) {
        const point = pathRef.current.getPointAtLength(pathLengthRef.current * visualProgressRef.current);
        setCursor({ x: point.x, y: point.y });
      }
      if (!complete) frameRef.current = requestAnimationFrame(animate);
    }

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      assetPromise.catch(() => {});
      window.clearTimeout(minTimer);
      window.clearTimeout(hardTimer);
      window.clearTimeout(skipTimer);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [onComplete]);

  function skipLoader() {
    window.sessionStorage.setItem(LOADER_KEY, "true");
    targetProgressRef.current = 1;
    setProgress(100);
    setFading(true);
    window.setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 620);
  }

  if (!visible) return null;

  const route = solutionPath(MAZE_SOLUTION);
  const dashOffset = reduced ? 0 : 1 - progress / 100;

  return (
    <div className={`maze-loader ${fading ? "maze-loader-complete" : ""}`} role="status" aria-label="Solving the maze">
      <div className={`maze-loader-panel ${reduced ? "maze-loader-reduced" : ""}`}>
        <div className="maze-loader-meta">
          <span className="maze-loader-label">SOLVING THE MAZE</span>
          <span className="maze-loader-percent">{progress}%</span>
        </div>
        <div className="maze-stage">
          <svg viewBox={MAZE_VIEWBOX} role="img" aria-label="A glowing line solving a maze">
            <defs>
              <filter id="maze-glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              <pattern id="maze-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" /></pattern>
              <radialGradient id="maze-vignette" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(255,180,100,0.08)" /><stop offset="100%" stopColor="rgba(0,0,0,0)" /></radialGradient>
            </defs>
            <rect width="400" height="400" fill="url(#maze-grid)" />
            <rect width="400" height="400" fill="url(#maze-vignette)" />
            <g className="maze-walls">{MAZE_WALLS.map((wall) => <path key={wall} d={wall} />)}</g>
            <g className="maze-solution" filter="url(#maze-glow)">
              <path ref={pathRef} d={route} pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: dashOffset }} />
              <path className="maze-solution-core" d={route} pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: dashOffset }} />
            </g>
            <circle className="maze-entry" cx={MAZE_ENTRANCE[0]} cy={MAZE_ENTRANCE[1]} r="5" />
            <circle className="maze-exit" cx={MAZE_EXIT[0]} cy={MAZE_EXIT[1]} r="7" />
            <circle className="maze-cursor" cx={cursor.x} cy={cursor.y} r="5" />
          </svg>
        </div>
      </div>
      <button type="button" onClick={skipLoader} className={`maze-loader-skip ${skipReady ? "is-ready" : ""}`} aria-label="Skip loading animation">Skip</button>
    </div>
  );
}
