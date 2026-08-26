"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

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
function QubitInteraction({ onDecoherence, resetKey = 0 }) {
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

  const interaction = useRef({
    lastClick: 0,
    streak: 0,
    charge: 0,
    instability: 0,
    triggerLocked: false,
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

  useEffect(() => {
    resetSimulation();
  }, [resetKey, resetSimulation]);

  const triggerExplosion = () => {
    const current = interaction.current;
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

    onDecoherence(true);

    window.setTimeout(() => {
      current.triggerLocked = false;
      current.reforming = true;
    }, 200);
  };

  const handleQubitClick = () => {
    const now = performance.now();
    const gap = now - interaction.current.lastClick;

    if (gap > 800) {
      interaction.current.streak = 0;
    }

    interaction.current.streak += 1;
    interaction.current.lastClick = now;
    interaction.current.charge = Math.min(1, interaction.current.charge + 0.5);

    if (interaction.current.streak >= 5) {
      triggerExplosion();
      return;
    }

    if (groupRef.current) {
      groupRef.current.scale.setScalar(1.08 + interaction.current.charge * 0.28);
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
        current.exploded = false;
        if (groupRef.current) {
          groupRef.current.visible = true;
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
      <mesh ref={wireRef} onClick={(event) => { event.stopPropagation(); handleQubitClick(); }} onPointerDown={(event) => { event.stopPropagation(); }}>
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

      <mesh ref={coreRef} onClick={(event) => { event.stopPropagation(); handleQubitClick(); }} onPointerDown={(event) => { event.stopPropagation(); }}>
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

function QuantumCoreCube({ showMaze = true, showQubit = true, showCornerNodes = true, onDecoherence, resetKey }) {
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
      {showQubit && <QubitInteraction onDecoherence={onDecoherence} resetKey={resetKey} />}
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
  const [decoherenceVisible, setDecoherenceVisible] = useState(false);
  const [resetKey, setResetKey] = useState(0);

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
          onDecoherence={setDecoherenceVisible}
          resetKey={resetKey}
        />
        <GroundGlow />
        <OrbitControls enablePan={false} enableZoom={false} enableDamping dampingFactor={0.08} autoRotate autoRotateSpeed={0.5} rotateSpeed={0.9} />
        <EffectComposer>
          <Bloom intensity={0.7} mipmapBlur luminanceThreshold={0.22} luminanceSmoothing={0.75} radius={0.8} />
        </EffectComposer>
      </Canvas>

      {decoherenceVisible && (
        <div className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center bg-[#08090d]/40 p-6 backdrop-blur-[1px]">
          <div className="w-full max-w-xs rounded-2xl border border-[#ff8c32]/25 bg-[#0d0d0d]/85 p-4 shadow-[0_0_40px_rgba(255,140,50,0.18)] ring-1 ring-white/5">
            <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-slate-300">
              <span className="h-2 w-2 rounded-full bg-[#ff8c32] shadow-[0_0_12px_rgba(255,140,50,0.85)]" />
              <span>Qubit</span>
            </div>
            <h3 className="font-mono text-lg font-bold uppercase tracking-[0.08em] text-[#f5f0e8]">
              TRAPPED IN SUPERPOSITION
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              You are stuck between states in the quantum maze. Enter Quant-A-Maze 3.0 to collapse the wavefunction.
            </p>
            <div className="mt-4 flex items-center gap-2">
              {/* Replace REGISTRATION_URL_HERE with the real hackathon registration URL. */}
              <a
                href="REGISTRATION_URL_HERE"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[#ff6b1a] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#0d0d0d] transition hover:bg-[#ff8c32]"
              >
                Register Now
              </a>
              <button
                type="button"
                onClick={() => {
                  setDecoherenceVisible(false);
                  setResetKey((value) => value + 1);
                }}
                className="inline-flex items-center justify-center rounded-full border border-[#ff8c32]/40 bg-[#ff8c32]/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[#ffd7a8] transition hover:border-[#ff8c32]/60 hover:bg-[#ff8c32]/18"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
