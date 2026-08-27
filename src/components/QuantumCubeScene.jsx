"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import CosmicExplosionOverlay from "@/components/CosmicExplosionOverlay";

const CUBE_SIZE = 2.2;
const FACE_SIZE = 1.92;
const ORANGE = "#ff8c32";
const AMBER = "#ffc46b";

// A deterministic recursive-backtracking maze keeps the face pattern stable between renders.
function createMazeSegments(size = 7) {
  const visited = Array.from({ length: size }, () => Array(size).fill(false));
  const walls = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({ right: true, bottom: true })),
  );
  const directions = [
    [1, 0, "right"],
    [-1, 0, "left"],
    [0, 1, "bottom"],
    [0, -1, "top"],
  ];

  const visit = (row, column) => {
    visited[row][column] = true;
    const shuffled = [...directions].sort(
      ([firstRow, firstColumn], [secondRow, secondColumn]) =>
        Math.sin((row + 1) * (column + 2) * (firstRow + firstColumn + 3)) -
        Math.sin((row + 1) * (column + 2) * (secondRow + secondColumn + 3)),
    );

    shuffled.forEach(([columnStep, rowStep, direction]) => {
      const nextColumn = column + columnStep;
      const nextRow = row + rowStep;
      if (
        nextColumn < 0 ||
        nextColumn >= size ||
        nextRow < 0 ||
        nextRow >= size ||
        visited[nextRow][nextColumn]
      ) {
        return;
      }

      if (direction === "right") walls[row][column].right = false;
      if (direction === "left") walls[nextRow][nextColumn].right = false;
      if (direction === "bottom") walls[row][column].bottom = false;
      if (direction === "top") walls[nextRow][nextColumn].bottom = false;
      visit(nextRow, nextColumn);
    });
  };

  visit(0, 0);

  const cellSize = FACE_SIZE / size;
  const segments = [];
  const addSegment = (x1, y1, x2, y2) => {
    segments.push(x1, y1, 0, x2, y2, 0);
  };

  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      const left = -FACE_SIZE / 2 + column * cellSize;
      const top = FACE_SIZE / 2 - row * cellSize;
      if (walls[row][column].right) addSegment(left + cellSize, top, left + cellSize, top - cellSize);
      if (walls[row][column].bottom) addSegment(left, top - cellSize, left + cellSize, top - cellSize);
    }
  }

  addSegment(-FACE_SIZE / 2, FACE_SIZE / 2, FACE_SIZE / 2, FACE_SIZE / 2);
  addSegment(-FACE_SIZE / 2, -FACE_SIZE / 2, FACE_SIZE / 2, -FACE_SIZE / 2);
  addSegment(-FACE_SIZE / 2, -FACE_SIZE / 2, -FACE_SIZE / 2, FACE_SIZE / 2);
  addSegment(FACE_SIZE / 2, -FACE_SIZE / 2, FACE_SIZE / 2, FACE_SIZE / 2);
  return new THREE.Float32BufferAttribute(segments, 3);
}

// A single subtle LineSegments maze is etched just inside each selected cube face.
function MazeFace({ rotation = [0, 0, 0], position = [0, 0, 0] }) {
  const geometry = useMemo(() => {
    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute("position", createMazeSegments());
    return buffer;
  }, []);

  return (
    <lineSegments geometry={geometry} position={position} rotation={rotation}>
      <lineBasicMaterial color={ORANGE} transparent opacity={0.42} depthWrite={false} />
    </lineSegments>
  );
}

function MazeFaces() {
  return (
    <group>
      <MazeFace position={[0, 0, FACE_SIZE / 2 + 0.015]} />
      <MazeFace position={[FACE_SIZE / 2 + 0.015, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
    </group>
  );
}

// Entanglement links pulse while their three particles orbit the central state.
function EntanglementNetwork() {
  const particleRefs = useRef([]);
  const lineMaterialRef = useRef();
  const lineRef = useRef();
  const geometry = useMemo(() => {
    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(18), 3));
    return buffer;
  }, []);
  const particles = useMemo(
    () => [
      { radius: 0.78, speed: 0.72, phase: 0.3, color: ORANGE },
      { radius: 0.68, speed: -0.55, phase: 2.1, color: AMBER },
      { radius: 0.9, speed: 0.42, phase: 4.3, color: "#ff6b1a" },
    ],
    [],
  );

  useFrame((state) => {
    const lineGeometry = lineRef.current?.geometry;
    if (!lineGeometry) return;

    const positions = lineGeometry.attributes.position.array;
    particles.forEach((particle, index) => {
      const time = state.clock.elapsedTime * particle.speed + particle.phase;
      const position = [
        Math.cos(time) * particle.radius,
        Math.sin(time * 1.7) * 0.34,
        Math.sin(time) * particle.radius,
      ];
      particleRefs.current[index]?.position.set(...position);
      positions.set([0, 0, 0, ...position], index * 6);
    });
    lineGeometry.attributes.position.needsUpdate = true;
    if (lineMaterialRef.current) {
      lineMaterialRef.current.opacity = 0.2 + (Math.sin(state.clock.elapsedTime * 2.2) + 1) * 0.12;
    }
  });

  return (
    <group>
      <lineSegments ref={lineRef} geometry={geometry}>
        <lineBasicMaterial ref={lineMaterialRef} color={ORANGE} transparent opacity={0.28} depthWrite={false} />
      </lineSegments>
      {particles.map((particle, index) => (
        <mesh key={`entangled-particle-${index}`} ref={(node) => { particleRefs.current[index] = node; }}>
          <sphereGeometry args={[0.065, 12, 12]} />
          <meshBasicMaterial color={particle.color} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

// A compact, self-contained interaction layer for the central qubit.
// It keeps all click timing, pulse feedback, instability states, and particle bursts
// isolated to the Bloch-sphere meshes so orbit controls remain unaffected.
//
// overlayActive: when true, ALL clicks are silently ignored — the overlay owns the
// screen and the qubit must not accept new triggers until it is dismissed.
// resetKey: bumped by the parent whenever a dismiss/reset occurs; causes resetSimulation().
function QubitInteraction({ onDecoherence, resetKey = 0, overlayActive = false }) {
  const groupRef = useRef();
  const wireRef = useRef();
  const ringXRef = useRef();
  const ringYRef = useRef();
  const coreRef = useRef();
  const lightRef = useRef();
  const instancedRef = useRef();
  const particleDummy = useMemo(() => new THREE.Object3D(), []);
  const particleData = useMemo(
    () =>
      Array.from({ length: 150 }, () => ({
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        active: false,
        life: 1,
      })),
    [],
  );

  // All mutable interaction state lives in a ref so it never triggers re-renders
  // and is always synchronously readable inside useFrame and event handlers.
  const interaction = useRef({
    lastClick: 0,
    streak: 0,
    charge: 0,
    instability: 0,
    // triggerLocked: true for the brief 200 ms window immediately after firing to
    // prevent double-firing from a physical double-tap.
    triggerLocked: false,
    // exploded: true while the qubit is in its "collapsed" state (invisible, particles
    // flying outward). Reset to false once particles have fully converged back.
    exploded: false,
    reforming: false,
  });

  const resetSimulation = useCallback(() => {
    const current = interaction.current;
    current.lastClick = 0;
    current.streak = 0;
    current.charge = 0;
    current.instability = 0;
    current.exploded = false;
    current.reforming = false;
    current.triggerLocked = false;

    if (groupRef.current) {
      groupRef.current.visible = true;
      groupRef.current.scale.setScalar(1);
      groupRef.current.rotation.set(0, 0, 0);
    }

    particleData.forEach((particle) => {
      particle.position.set(0, 0, 0);
      particle.velocity.set(0, 0, 0);
      particle.active = false;
      particle.life = 1;
    });
  }, [particleData]);

  // Reset whenever the parent bumps resetKey (dismiss or reset button pressed).
  useEffect(() => {
    resetSimulation();
  }, [resetKey, resetSimulation]);

  const triggerExplosion = (event) => {
    const current = interaction.current;
    // Double-fire guard: locked for 200 ms after the first trigger.
    if (current.triggerLocked || current.exploded) return;

    current.triggerLocked = true;
    current.exploded = true;
    current.reforming = false;
    current.streak = 0;
    current.charge = 0;
    current.instability = 1;

    if (groupRef.current) {
      groupRef.current.visible = false;
    }

    particleData.forEach((particle) => {
      const angle = Math.random() * Math.PI * 2;
      const elevation = Math.acos(2 * Math.random() - 1) - Math.PI / 2;
      const distance = 0.7 + Math.random() * 1.9;
      const velocity = new THREE.Vector3(
        Math.cos(elevation) * Math.cos(angle),
        Math.sin(elevation),
        Math.cos(elevation) * Math.sin(angle),
      ).multiplyScalar(distance * (0.18 + Math.random() * 0.25));

      particle.position.set(0, 0, 0);
      particle.velocity.copy(velocity);
      particle.active = true;
      particle.life = 1;
    });

    const nativeEvent = event?.nativeEvent ?? event;
    onDecoherence({
      x: nativeEvent?.clientX ?? window.innerWidth / 2,
      y: nativeEvent?.clientY ?? window.innerHeight / 2,
    });

    // Release the 200 ms double-tap guard, then start particle convergence.
    // Particles will reform visually but the overlay is still on screen — the
    // qubit becomes clickable again only after the overlay is dismissed (resetKey bump).
    window.setTimeout(() => {
      current.triggerLocked = false;
      current.reforming = true;
    }, 200);
  };

  const handleQubitClick = (event) => {
    // Hard gate: ignore every click while the overlay is on screen.
    if (overlayActive) return;

    const current = interaction.current;

    // Also ignore if we're still in the exploded / locked state from a previous trigger
    // that hasn't been reset yet (safety net in case resetKey hasn't propagated).
    if (current.triggerLocked || current.exploded) return;

    const now = performance.now();
    const gap = now - current.lastClick;

    if (gap > 800) {
      current.streak = 0;
    }

    current.streak += 1;
    current.lastClick = now;
    current.charge = Math.min(1, current.charge + 0.5);

    if (current.streak >= 5) {
      triggerExplosion(event);
      return;
    }

    if (groupRef.current) {
      groupRef.current.scale.setScalar(1.08 + current.charge * 0.28);
    }
  };

  useFrame((state, delta) => {
    const current = interaction.current;
    const pulse = Math.max(0, current.charge - delta * 0.95);
    current.charge = pulse;

    if (groupRef.current) {
      const targetScale = current.exploded ? 0.0001 : 1 + current.charge * 0.18 + (current.instability || 0) * 0.55;
      groupRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        current.exploded ? 0.3 : 0.18,
      );
      if (!current.exploded) {
        groupRef.current.rotation.x += delta * (0.9 + current.charge * 1.2);
        groupRef.current.rotation.z += delta * (1.2 + current.charge * 1.5);
      }
    }

    if (wireRef.current) {
      wireRef.current.material.opacity = current.exploded
        ? 0.12 + (Math.sin(state.clock.elapsedTime * 18) + 1) * 0.08
        : 0.18 + current.charge * 0.22;
    }

    if (ringXRef.current) {
      ringXRef.current.rotation.x += delta * (1 + current.charge * 3 + (current.instability || 0) * 5.5);
      ringYRef.current.rotation.y += delta * (1.3 + current.charge * 2.8 + (current.instability || 0) * 6.5);
      ringXRef.current.scale.setScalar(1 + (current.instability || 0) * 0.26);
      ringYRef.current.scale.setScalar(1 + (current.instability || 0) * 0.24);
    }

    if (coreRef.current) {
      const brightness = 0.95 + current.charge * 2.8 + (current.instability || 0) * 4.5;
      coreRef.current.scale.setScalar(1 + current.charge * 0.44 + (current.instability || 0) * 0.45);
      const material = coreRef.current.material;
      material.opacity = current.exploded ? 0.05 : 0.9 + current.charge * 0.85;
      material.color.set(current.exploded ? "#ffffff" : "#fff5d5");
      if (lightRef.current) {
        lightRef.current.intensity = 2.2 + brightness;
      }
    }

    if (current.instability > 0 && !current.exploded) {
      current.instability = Math.max(0, current.instability - delta * 0.8);
    }

    if (current.reforming) {
      particleData.forEach((particle) => {
        if (!particle.active) return;
        particle.velocity.multiplyScalar(0.92);
        particle.position.addScaledVector(particle.velocity, delta * 0.8);
        particle.position.multiplyScalar(0.94);
        if (particle.position.length() < 0.05) {
          particle.position.set(0, 0, 0);
          particle.velocity.set(0, 0, 0);
          particle.active = false;
        }
      });

      const activeCount = particleData.filter((particle) => particle.active).length;
      if (activeCount === 0) {
        current.reforming = false;
        // Keep exploded = true and the group invisible while the overlay is still up.
        // resetSimulation() (via resetKey) is the only thing that revives the qubit.
        // This prevents any possibility of re-triggering while the reveal card shows.
        if (!overlayActive) {
          current.exploded = false;
          if (groupRef.current) {
            groupRef.current.visible = true;
          }
        }
      }
    }

    if (instancedRef.current) {
      particleData.forEach((particle, index) => {
        if (!particle.active) {
          particleDummy.position.set(0, 0, 0);
          particleDummy.scale.setScalar(0.001);
        } else {
          const scale = current.exploded ? 0.09 + (1 - particle.life) * 0.04 : 0.07;
          particleDummy.position.copy(particle.position);
          particleDummy.scale.setScalar(scale);
          particleDummy.updateMatrix();
          instancedRef.current.setMatrixAt(index, particleDummy.matrix);
        }
      });
      instancedRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={wireRef} onClick={(event) => { event.stopPropagation(); handleQubitClick(event); }} onPointerDown={(event) => { event.stopPropagation(); }}>
        <sphereGeometry args={[0.56, 24, 18]} />
        <meshBasicMaterial color={ORANGE} transparent opacity={0.13} wireframe depthWrite={false} />
      </mesh>

      <mesh ref={ringXRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.56, 0.008, 6, 64]} />
        <meshBasicMaterial color={AMBER} transparent opacity={0.6} toneMapped={false} />
      </mesh>
      <mesh ref={ringYRef} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.56, 0.008, 6, 64]} />
        <meshBasicMaterial color={AMBER} transparent opacity={0.45} toneMapped={false} />
      </mesh>

      <mesh ref={coreRef} onClick={(event) => { event.stopPropagation(); handleQubitClick(event); }} onPointerDown={(event) => { event.stopPropagation(); }}>
        <sphereGeometry args={[0.17, 16, 16]} />
        <meshBasicMaterial color="#fff1c0" transparent opacity={0.9} toneMapped={false} />
      </mesh>
      <Html position={[0.48, 0.38, 0]} center distanceFactor={5} style={{ pointerEvents: "none" }}>
        <span className="qubit-click-hint">CLICK ME IF YOU DARE</span>
      </Html>
      <pointLight ref={lightRef} color={AMBER} intensity={2.5} distance={2.8} />
      <EntanglementNetwork />

      <instancedMesh ref={instancedRef} args={[undefined, undefined, particleData.length]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color={ORANGE} transparent opacity={0.9} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

// Corner nodes mark the eight vertices and pulse independently from the cube rotation.
function CornerNodes() {
  const nodeRefs = useRef([]);
  const positions = useMemo(
    () => [-1, 1].flatMap((x) => [-1, 1].flatMap((y) => [-1, 1].map((z) => [x * 1.16, y * 1.16, z * 1.16]))),
    [],
  );

  useFrame((state) => {
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.1) * 0.18;
    nodeRefs.current.forEach((node, index) => {
      if (node) node.scale.setScalar(pulse + Math.sin(index) * 0.02);
    });
  });

  return (
    <group>
      {positions.map((position, index) => (
        <mesh key={`corner-node-${index}`} position={position} ref={(node) => { nodeRefs.current[index] = node; }}>
          <icosahedronGeometry args={[0.085, 1]} />
          <meshBasicMaterial color={ORANGE} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function QuantumCoreCube({ showMaze = true, showQubit = true, showCornerNodes = true, onDecoherence, resetKey, overlayActive }) {
  const cubeRef = useRef();
  const edgeGeometry = useMemo(() => new THREE.BoxGeometry(2.28, 2.28, 2.28), []);

  useFrame((state, delta) => {
    if (!cubeRef.current) return;

    const floatLift = Math.sin(state.clock.elapsedTime * 0.9) * 0.12;
    cubeRef.current.position.y = floatLift;
    cubeRef.current.rotation.y += delta * 0.05;
    cubeRef.current.rotation.x = THREE.MathUtils.lerp(
      cubeRef.current.rotation.x,
      -state.pointer.y * 0.45,
      0.08,
    );
    cubeRef.current.rotation.z = THREE.MathUtils.lerp(
      cubeRef.current.rotation.z,
      state.pointer.x * 0.25,
      0.08,
    );
  });

  return (
    <group ref={cubeRef} scale={1.2}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]} />
        <meshPhysicalMaterial
          color="#17181d"
          metalness={0.8}
          roughness={0.24}
          transparent
          opacity={0.24}
          depthWrite={false}
          clearcoat={1}
          clearcoatRoughness={0.2}
          reflectivity={1}
          envMapIntensity={1.2}
          emissive="#0c0d10"
          emissiveIntensity={0.2}
        />
      </mesh>

      <lineSegments>
        <primitive object={new THREE.EdgesGeometry(edgeGeometry)} attach="geometry" />
        <lineBasicMaterial color={ORANGE} transparent opacity={0.48} toneMapped={false} />
      </lineSegments>

      {showMaze && <MazeFaces />}
      {showQubit && (
        <QubitInteraction
          onDecoherence={onDecoherence}
          resetKey={resetKey}
          overlayActive={overlayActive}
        />
      )}
      {showCornerNodes && <CornerNodes />}

      <pointLight color="#ff8a3d" intensity={14} distance={8} position={[2.6, 1.8, 2.6]} />
      <spotLight
        position={[0, 2.8, 2.5]}
        angle={Math.PI / 6}
        penumbra={0.7}
        intensity={16}
        color="#ff9d5c"
      />
    </group>
  );
}

function GroundGlow() {
  return (
    <mesh position={[0, -1.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[2.8, 64]} />
      <meshBasicMaterial color="#ff7b3a" transparent opacity={0.16} side={THREE.DoubleSide} />
    </mesh>
  );
}

export default function QuantumCubeScene({ showMaze = true, showQubit = true, showCornerNodes = true }) {
  // animationKey: a monotonically-increasing integer bumped on every explosion trigger.
  // Used as the overlay's React key so it fully unmounts+remounts each time, guaranteeing
  // all CSS animations restart from frame 0 and all internal state is fresh — even when
  // the origin coordinates are identical to the previous trigger.
  const [animationKey, setAnimationKey] = useState(0);
  const [explosionOrigin, setExplosionOrigin] = useState({ x: 0, y: 0 });

  // resetKey is bumped on dismiss/reset to tell QubitInteraction to fully reset.
  const [resetKey, setResetKey] = useState(0);

  // isAnimating: true only while the explosion/whiteout sequence is actively playing.
  // Used to debounce re-triggers from spam-clicks — the cube ignores new triggers while
  // this is true. Set back to false once the reveal card is shown (animation complete).
  const [isAnimating, setIsAnimating] = useState(false);

  // isRevealed: true once the reveal card is showing. Set back to false on dismiss.
  const [isRevealed, setIsRevealed] = useState(false);

  // overlayActive: the combined "overlay owns the screen" flag — true during BOTH the
  // animation phase and the reveal phase. Passed into the Three.js scene to gate clicks.
  const overlayActive = isAnimating || isRevealed;

  // isAnimating ref: a ref mirror so the handleDecoherence guard can synchronously read
  // the current value without a stale-closure issue between batched setState calls.
  const isAnimatingRef = useRef(false);

  // Called by QubitInteraction when the 5-click threshold is reached.
  // Guard: if animation is already in-flight, ignore this call so spam-clicks can't
  // double-trigger and overlap animations.
  const handleDecoherence = useCallback((origin) => {
    if (isAnimatingRef.current) return; // already animating — ignore
    isAnimatingRef.current = true;
    setIsAnimating(true);
    setIsRevealed(false);
    setExplosionOrigin(origin);
    setAnimationKey((n) => n + 1);
  }, []);

  // Called by CosmicExplosionOverlay once the reveal card is fully shown.
  // Transitions isAnimating → false, isRevealed → true.
  const handleAnimationComplete = useCallback(() => {
    setIsAnimating(false);
    setIsRevealed(true);
    // isAnimatingRef stays true while isRevealed is true; we reset it in handleOverlayClose.
  }, []);

  // Called by the overlay's × close button or Reset button.
  // Fully resets all state so the next 5 clicks trigger a fresh animation from scratch.
  const handleOverlayClose = useCallback(() => {
    isAnimatingRef.current = false;
    setIsAnimating(false);
    setIsRevealed(false);
    setResetKey((n) => n + 1);
  }, []);

  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ position: [0, 0, 6.8], fov: 36, near: 0.1, far: 1000 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.0;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <ambientLight intensity={0.75} />
        <QuantumCoreCube
          showMaze={showMaze}
          showQubit={showQubit}
          showCornerNodes={showCornerNodes}
          onDecoherence={handleDecoherence}
          resetKey={resetKey}
          overlayActive={overlayActive}
        />
        <GroundGlow />
        <OrbitControls enablePan={false} enableZoom={false} enableDamping dampingFactor={0.08} autoRotate autoRotateSpeed={0.5} rotateSpeed={0.9} />
        <EffectComposer>
          <Bloom intensity={0.7} mipmapBlur luminanceThreshold={0.22} luminanceSmoothing={0.75} radius={0.8} />
        </EffectComposer>
      </Canvas>

      {/* animationKey is used as `key` so React unmounts+remounts the overlay on every
          new trigger, guaranteeing all CSS animations restart from frame 0 and all
          internal timer/ref state is fresh — even if the origin coordinates are identical. */}
      <CosmicExplosionOverlay
        key={animationKey}
        active={overlayActive}
        origin={explosionOrigin}
        onAnimationComplete={handleAnimationComplete}
        onDismiss={handleOverlayClose}
        onReset={handleOverlayClose}
      />
    </div>
  );
}
