"use client";

import { Component, useState } from "react";
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
}) {
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  const showFallback = failed || !ready;

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
            opacity: ready ? 1 : 0,
            pointerEvents: ready ? "auto" : "none",
          }}
        >
          <Lamp3DBoundary onFail={() => setFailed(true)}>
            <Lamp3D
              onReady={() => setReady(true)}
              onFail={() => setFailed(true)}
              onZoomChange={onZoomChange}
              diyaRefCallbacks={diyaRefCallbacks}
              rotateLampRef={rotateLampRef}
              lit={lit}
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
