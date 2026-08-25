"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useMemo, useRef } from "react";
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

// The qubit layer is a Bloch sphere, two latitude/longitude rings, and a bright state.
function QubitCore() {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.56, 20, 12]} />
        <meshBasicMaterial color={ORANGE} transparent opacity={0.13} wireframe depthWrite={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.56, 0.008, 6, 64]} />
        <meshBasicMaterial color={AMBER} transparent opacity={0.6} toneMapped={false} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.56, 0.008, 6, 64]} />
        <meshBasicMaterial color={AMBER} transparent opacity={0.45} toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.17, 16, 16]} />
        <meshBasicMaterial color="#fff1c0" toneMapped={false} />
      </mesh>
      <pointLight color={AMBER} intensity={2.5} distance={2.8} />
      <EntanglementNetwork />
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

function QuantumCoreCube({ showMaze = true, showQubit = true, showCornerNodes = true }) {
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
      {showQubit && <QubitCore />}
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
  return (
    <div className="h-full w-full" aria-hidden="true">
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
        <QuantumCoreCube showMaze={showMaze} showQubit={showQubit} showCornerNodes={showCornerNodes} />
        <GroundGlow />
        <OrbitControls enablePan={false} enableZoom={false} enableDamping dampingFactor={0.08} autoRotate autoRotateSpeed={0.5} rotateSpeed={0.9} />
        <EffectComposer>
          <Bloom intensity={0.7} mipmapBlur luminanceThreshold={0.22} luminanceSmoothing={0.75} radius={0.8} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
