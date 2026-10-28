"use client";

import { Component, useCallback, useState } from "react";
import dynamic from "next/dynamic";

const Lamp3D = dynamic(() => import("./Lamp3D"), { ssr: false, loading: () => null });

class Lamp3DBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    console.error("[Inauguration] 3D lamp renderer failed.", error);
    this.props.onFail?.();
  }
  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

/**
 * 3D lamp in the same #lampLayer box. Existing 2D lamp is the fallback
 * while WebGL is missing, the chunk is loading, or the scene throws.
 */
export default function LampViewport({
  fallback,
  overlay,
  fallbackDiyaRefs,
  diyaRefs,
  diyaRefCallbacks,
  rotateLampRef,
  onZoomChange,
  lit,
  active,
}) {
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const handleContextLost = useCallback(() => setContextLost(true), []);
  const handleContextRestored = useCallback(() => setContextLost(false), []);

  const showFallback = failed || !ready || contextLost;

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: showFallback ? 1 : 0,
          pointerEvents: showFallback ? "auto" : "none",
        }}
      >
        {fallback}
      </div>
      {!failed ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: ready && !contextLost ? 1 : 0,
            pointerEvents: ready && !contextLost ? "auto" : "none",
          }}
        >
          <Lamp3DBoundary onFail={() => setFailed(true)}>
            <Lamp3D
              onReady={() => setReady(true)}
              onZoomChange={onZoomChange}
              onContextLost={handleContextLost}
              onContextRestored={handleContextRestored}
              diyaRefCallbacks={diyaRefCallbacks}
              rotateLampRef={rotateLampRef}
              lit={lit}
              active={active}
            />
          </Lamp3DBoundary>
        </div>
      ) : null}
      {typeof overlay === "function"
        ? overlay(showFallback ? fallbackDiyaRefs : diyaRefs)
        : overlay}
    </>
  );
}
