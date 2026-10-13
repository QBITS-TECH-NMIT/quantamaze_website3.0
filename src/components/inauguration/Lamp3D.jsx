"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const NUM_DIYAS = 7;
const STEM_EXTENSION = 0.8;
const PLATE_Y = 4.36 + STEM_EXTENSION;
const DIYA_RING_R = 2.6;
const DIYA_SCALE = 0.6;
const CAM_DISTANCE = 11.5;
const CAM_POLAR = 1.15;
const CAM_FOV = 58;
const CAM_TARGET = [0, 3.3, 0];
const AUTO_ROTATE_DELAY_MS = 5000;
const AUTO_ROTATE_DEG_PER_SEC = 0.4;
const BRASS_DARK = "#573508";
const BRASS_HI = "#ffe08a";

function slotAngle(index) {
  return (index / NUM_DIYAS) * Math.PI * 2;
}

function defaultCameraPosition() {
  return [
    CAM_TARGET[0],
    CAM_TARGET[1] + CAM_DISTANCE * Math.cos(CAM_POLAR),
    CAM_TARGET[2] + CAM_DISTANCE * Math.sin(CAM_POLAR),
  ];
}

function latheGeom(xy, segments = 64) {
  const pts = xy.map((point) => (
    point instanceof THREE.Vector2 ? point : new THREE.Vector2(...point)
  ));
  return new THREE.LatheGeometry(pts, segments);
}

function Lathe({ points, material, segments = 64 }) {
  const geometry = useMemo(() => latheGeom(points, segments), [points, segments]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} material={material} />;
}

function LampStand({ brass }) {
  const bodyPoints = useMemo(() => {
    const V = (x, y) => new THREE.Vector2(x, y);
    const points = [
      V(0.001, 0), V(2.0, 0), V(2.08, 0.06), V(2.08, 0.2), V(1.92, 0.27), V(1.5, 0.3),
      V(1.3, 0.4), V(1.1, 0.55), V(0.85, 0.72), V(0.68, 0.9), V(0.6, 1.0),
      V(0.66, 1.05), V(0.66, 1.14), V(0.48, 1.24),
    ];
    const RIBS = 14;
    const STEPS = RIBS * 6;
    const y0 = 1.3;
    const y1 = 2.7 + STEM_EXTENSION;
    for (let i = 0; i <= STEPS; i++) {
      const t = i / STEPS;
      const y = y0 + (y1 - y0) * t;
      const barrel = 0.46 + 0.13 * Math.sin(Math.PI * t);
      const rib = 0.045 * Math.abs(Math.sin(t * RIBS * Math.PI));
      points.push(V(barrel + rib, y));
    }
    points.push(
      V(0.5, 2.75 + STEM_EXTENSION), V(0.68, 2.8 + STEM_EXTENSION),
      V(0.68, 2.9 + STEM_EXTENSION), V(0.9, 2.98 + STEM_EXTENSION),
      V(1.3, 3.1 + STEM_EXTENSION), V(1.8, 3.35 + STEM_EXTENSION),
      V(2.3, 3.8 + STEM_EXTENSION), V(2.55, 4.15 + STEM_EXTENSION),
      V(2.9, 4.25 + STEM_EXTENSION), V(2.95, 4.3 + STEM_EXTENSION),
      V(2.9, 4.36 + STEM_EXTENSION), V(2.3, 4.36 + STEM_EXTENSION),
      V(2.2, 4.1 + STEM_EXTENSION), V(1.8, 3.75 + STEM_EXTENSION),
      V(1.3, 3.55 + STEM_EXTENSION), V(0.7, 3.47 + STEM_EXTENSION),
      V(0.001, 3.45 + STEM_EXTENSION),
    );
    return points;
  }, []);
  const finialPoints = useMemo(() => [
    new THREE.Vector2(0.001, 3.45 + STEM_EXTENSION),
    new THREE.Vector2(0.55, 3.5 + STEM_EXTENSION),
    new THREE.Vector2(0.5, 3.65 + STEM_EXTENSION),
    new THREE.Vector2(0.32, 3.75 + STEM_EXTENSION),
    new THREE.Vector2(0.3, 3.95 + STEM_EXTENSION),
    new THREE.Vector2(0.42, 4.15 + STEM_EXTENSION),
    new THREE.Vector2(0.5, 4.4 + STEM_EXTENSION),
    new THREE.Vector2(0.4, 4.7 + STEM_EXTENSION),
    new THREE.Vector2(0.22, 5.1 + STEM_EXTENSION),
    new THREE.Vector2(0.08, 5.5 + STEM_EXTENSION),
    new THREE.Vector2(0.001, 5.7 + STEM_EXTENSION),
  ], []);
  const spikeGeometry = useMemo(() => new THREE.ConeGeometry(0.3, 1.0, 4), []);
  useEffect(() => () => spikeGeometry.dispose(), [spikeGeometry]);

  return (
    <group>
      <Lathe points={bodyPoints} material={brass} segments={96} />
      <Lathe points={finialPoints} material={brass} segments={64} />
      {Array.from({ length: NUM_DIYAS }, (_, i) => {
        const angle = slotAngle(i + 0.5);
        const outward = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
        const tilt = THREE.MathUtils.degToRad(18);
        const direction = new THREE.Vector3(
          outward.x * Math.cos(tilt),
          Math.sin(tilt),
          outward.z * Math.cos(tilt),
        ).normalize();
        const rimPoint = new THREE.Vector3(
          outward.x * 2.85,
          4.25 + STEM_EXTENSION,
          outward.z * 2.85,
        );
        const center = rimPoint.clone().addScaledVector(direction, 0.35);
        const rotation = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          direction,
        );
        return (
          <mesh
            key={i}
            geometry={spikeGeometry}
            material={brass}
            position={center}
            quaternion={rotation}
            scale={[1, 1, 0.35]}
          />
        );
      })}
    </group>
  );
}

function Diya({ index, brass, diyaRefCallback, lit }) {
  const flameRef = useRef(null);
  const angle = slotAngle(index);
  const x = Math.sin(angle) * DIYA_RING_R;
  const z = Math.cos(angle) * DIYA_RING_R;
  const bowl = useMemo(() => latheGeom([
    [0, -0.28],
    [0.12, -0.28],
    [0.38, -0.22],
    [0.48, -0.1],
    [0.5, 0],
    [0.46, 0.04],
    [0.42, 0],
    [0.34, -0.12],
    [0.1, -0.2],
    [0, -0.2],
  ]), []);
  const oil = useMemo(() => new THREE.CircleGeometry(0.34, 24), []);
  const flame = useMemo(() => latheGeom([
    [0, 0],
    [0.075, 0.035],
    [0.12, 0.16],
    [0.105, 0.3],
    [0.065, 0.44],
    [0.025, 0.54],
    [0, 0.6],
  ], 24), []);
  useEffect(() => () => {
    bowl.dispose();
    oil.dispose();
    flame.dispose();
  }, [bowl, oil, flame]);
  useFrame(({ clock }) => {
    if (!flameRef.current || !lit[index]) return;
    const flicker = 1 + Math.sin(clock.elapsedTime * 17 + index) * 0.07;
    flameRef.current.scale.set(1 / flicker, flicker, 1 / flicker);
  });

  return (
    <group name={`diya-${index}`} position={[x, PLATE_Y, z]} rotation={[0, angle, 0]} scale={DIYA_SCALE}>
      <group position={[0, 0.28, 0]}>
        <mesh geometry={bowl} material={brass} />
        <mesh geometry={oil} position={[0, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#1a0a06" roughness={0.85} metalness={0.1} />
        </mesh>
        <mesh position={[0, -0.02, 0.46]} rotation={[0.35, 0, 0]} material={brass}>
          <coneGeometry args={[0.12, 0.22, 12]} />
        </mesh>
        <mesh name={`wick-${index}`} position={[0, 0.08, 0.04]} rotation={[0.25, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.03, 0.14, 8]} />
          <meshStandardMaterial color="#f5efe6" roughness={0.9} metalness={0} />
        </mesh>
        <Html position={[0, 0.15, 0.04]} center>
          <span
            ref={diyaRefCallback}
            className="diya-wick-anchor"
            aria-hidden="true"
            style={{ display: "block", width: 2, height: 2, pointerEvents: "none" }}
          />
        </Html>
        {lit[index] ? (
          <group position={[0, 0.15, 0.04]}>
            <mesh ref={flameRef} geometry={flame}>
              <meshBasicMaterial color="#ff7a1a" />
            </mesh>
            <mesh geometry={flame} scale={0.68} position={[0, 0.02, 0]}>
              <meshBasicMaterial color="#fff0b3" />
            </mesh>
            <pointLight color="#ff8a24" intensity={1.8} distance={2.2} decay={2} />
          </group>
        ) : null}
      </group>
    </group>
  );
}

function IdleControls({ onReady, onZoomChange }) {
  const { gl, size } = useThree();
  const [autoRotate, setAutoRotate] = useState(false);
  const idleRef = useRef(null);
  const readyOnce = useRef(false);
  const controls = useRef(null);
  const scheduleAutoRotate = useCallback(() => {
    window.clearTimeout(idleRef.current);
    idleRef.current = window.setTimeout(() => setAutoRotate(true), AUTO_ROTATE_DELAY_MS);
  }, []);
  const bump = useCallback(() => {
    setAutoRotate(false);
    scheduleAutoRotate();
  }, [scheduleAutoRotate]);
  const setZoomViewport = useCallback(() => {
    const distance = controls.current?.getDistance() ?? CAM_DISTANCE;
    onZoomChange?.(distance < CAM_DISTANCE * 0.98);
  }, [onZoomChange]);
  const handleWheel = useCallback((event) => {
    bump();
    if (event.deltaY < 0) onZoomChange?.(true);
    window.requestAnimationFrame(setZoomViewport);
  }, [bump, onZoomChange, setZoomViewport]);
  const handleTouchStart = useCallback(() => {
    bump();
    onZoomChange?.(true);
  }, [bump, onZoomChange]);
  const aspect = size.width / Math.max(size.height, 1);
  const minDistance = Math.max(6.1, 4.5 / Math.max(aspect, 0.45));

  useEffect(() => {
    if (!readyOnce.current) {
      readyOnce.current = true;
      onReady?.();
    }
  }, [onReady]);

  useEffect(() => {
    const el = gl.domElement;
    scheduleAutoRotate();
    el.addEventListener("pointerdown", bump);
    el.addEventListener("wheel", handleWheel, { passive: true });
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    return () => {
      window.clearTimeout(idleRef.current);
      el.removeEventListener("pointerdown", bump);
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("touchstart", handleTouchStart);
    };
  }, [gl, bump, handleWheel, handleTouchStart, scheduleAutoRotate]);

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      enablePan={false}
      enableZoom
      zoomSpeed={1}
      minDistance={minDistance}
      maxDistance={32}
      minPolarAngle={0.35}
      maxPolarAngle={1.55}
      rotateSpeed={0.8}
      autoRotate={autoRotate}
      autoRotateSpeed={(AUTO_ROTATE_DEG_PER_SEC / 12) * 2}
      target={CAM_TARGET}
      onChange={setZoomViewport}
    />
  );
}

function HiddenTabPause() {
  const { invalidate } = useThree();
  useEffect(() => {
    const onVis = () => {
      if (!document.hidden) invalidate();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [invalidate]);
  return null;
}

function Scene({ onReady, onZoomChange, diyaRefCallbacks, lit, rotateLampRef }) {
  const lampGroupRef = useRef(null);
  const rotationTargetRef = useRef(0);
  const rotationResolverRef = useRef(null);
  const brass = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#d4a22a",
    metalness: 1,
    roughness: 0.22,
    envMapIntensity: 1.4,
    side: THREE.DoubleSide,
  }), []);
  useEffect(() => () => brass.dispose(), [brass]);

  useEffect(() => {
    if (!rotateLampRef) return undefined;
    rotateLampRef.current = (index) => new Promise((resolve) => {
      rotationTargetRef.current = -slotAngle(index);
      if (Math.abs(Math.atan2(
        Math.sin(rotationTargetRef.current - (lampGroupRef.current?.rotation.y || 0)),
        Math.cos(rotationTargetRef.current - (lampGroupRef.current?.rotation.y || 0)),
      )) < 0.002) {
        resolve();
        return;
      }
      rotationResolverRef.current?.();
      rotationResolverRef.current = resolve;
    });
    return () => {
      rotateLampRef.current = null;
      rotationResolverRef.current?.();
      rotationResolverRef.current = null;
    };
  }, [rotateLampRef]);

  useFrame((_, delta) => {
    const lamp = lampGroupRef.current;
    if (!lamp) return;
    const difference = Math.atan2(
      Math.sin(rotationTargetRef.current - lamp.rotation.y),
      Math.cos(rotationTargetRef.current - lamp.rotation.y),
    );
    if (Math.abs(difference) < 0.002) {
      lamp.rotation.y = rotationTargetRef.current;
      rotationResolverRef.current?.();
      rotationResolverRef.current = null;
      return;
    }
    lamp.rotation.y += difference * (1 - Math.exp(-6 * delta));
  });

  return (
    <>
      <ambientLight intensity={0.22} />
      <directionalLight position={[6, 10, 8]} intensity={1.35} color={BRASS_HI} />
      <directionalLight position={[-5, 4, -3]} intensity={0.3} color={BRASS_DARK} />
      <Suspense fallback={null}>
        <Environment preset="sunset" environmentIntensity={0.32} background={false} />
      </Suspense>
      <group ref={lampGroupRef}>
        <LampStand brass={brass} />
        {Array.from({ length: NUM_DIYAS }, (_, i) => (
          <Diya
            key={i}
            index={i}
            brass={brass}
            diyaRefCallback={diyaRefCallbacks[i]}
            lit={lit}
          />
        ))}
      </group>
      <IdleControls onReady={onReady} onZoomChange={onZoomChange} />
      <HiddenTabPause />
    </>
  );
}

export default function Lamp3D({
  onReady,
  onFail,
  onZoomChange,
  diyaRefCallbacks,
  lit,
  rotateLampRef,
}) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <Canvas
        dpr={[1, 1.5]}
        frameloop={hidden ? "never" : "always"}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        camera={{ position: defaultCameraPosition(), fov: CAM_FOV, near: 0.1, far: 80 }}
        style={{ width: "100%", height: "100%", background: "transparent", touchAction: "none", display: "block" }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x000000, 0);
          scene.background = null;
          gl.domElement.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            onFail?.();
          });
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Scene
          onReady={onReady}
          onZoomChange={onZoomChange}
          diyaRefCallbacks={diyaRefCallbacks}
          lit={lit}
          rotateLampRef={rotateLampRef}
        />
    </Canvas>
  );
}
