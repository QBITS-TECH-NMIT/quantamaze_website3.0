"use client";

import { useEffect, useMemo } from "react";
import { eventPhotos } from "@/lib/eventPhotos";
import { InfiniteCanvasScene } from "./InfiniteCanvas/reference/infinite-canvas/scene";

export default function InfiniteCanvasView({ onClose }) {
  const media = useMemo(
    () => eventPhotos.map((photo) => ({ url: photo.src, width: photo.width, height: photo.height })),
    []
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="infinite-canvas-overlay" role="dialog" aria-modal="true" aria-label="3D events canvas">
      <InfiniteCanvasScene
        media={media}
        backgroundColor="#050505"
        fogColor="#050505"
        fogNear={120}
        fogFar={320}
        cameraFov={60}
      />
      <div className="infinite-canvas-vignette" aria-hidden="true" />
      <div className="infinite-canvas-hud" aria-hidden="true">
        <span>EVENTS // INFINITE FIELD</span>
        <span>{media.length} ARCHIVES // DRAG TO EXPLORE</span>
      </div>
      <p className="infinite-canvas-instructions">DRAG TO PAN // SCROLL OR PINCH TO ZOOM // WASD + QE TO MOVE</p>
      <button type="button" className="infinite-canvas-close" onClick={onClose} aria-label="Exit 3D canvas">
        <span aria-hidden="true">×</span>
        <span>Exit 3D Canvas</span>
      </button>
    </div>
  );
}
