"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const ORANGE = "#ff6b1a";
const AMBER = "#ffc266";

function AtomScene({ rotation, shouldReduceMotion }) {
  const groupRef = useRef(null);
  const nucleusRef = useRef(null);
  const ringOneSpinRef = useRef(null);
  const ringTwoSpinRef = useRef(null);
  const ringThreeSpinRef = useRef(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;
    const targetX = THREE.MathUtils.degToRad(shouldReduceMotion ? -18 : rotation.x);
    const targetY = THREE.MathUtils.degToRad(shouldReduceMotion ? 32 : rotation.y);
    const targetZ = THREE.MathUtils.degToRad(shouldReduceMotion ? 3.2 : rotation.y * 0.1);

    groupRef.current.rotation.x = targetX;
    groupRef.current.rotation.y = targetY + (shouldReduceMotion ? 0 : state.clock.elapsedTime * 0.16);
    groupRef.current.rotation.z = targetZ;

    ringOneSpinRef.current.rotation.z = shouldReduceMotion ? 0.2 : time * 0.42 + 0.2;
    ringTwoSpinRef.current.rotation.z = shouldReduceMotion ? 1.8 : time * 0.31 + 1.8;
    ringThreeSpinRef.current.rotation.z = shouldReduceMotion ? -0.8 : time * 0.53 - 0.8;

    if (nucleusRef.current && !shouldReduceMotion) {
      nucleusRef.current.rotation.y = time * 0.22;
      nucleusRef.current.rotation.x = time * 0.08;
    }
  });

  return (
    <group ref={groupRef} scale={1.15}>
      <group ref={nucleusRef}>
        {[
          [0.17, [0, 0, 0]],
          [0.145, [0.19, 0.08, 0.06]],
          [0.13, [-0.18, 0.11, -0.04]],
          [0.15, [0.06, -0.2, 0.08]],
          [0.125, [-0.09, -0.12, -0.14]],
          [0.14, [0.14, -0.04, -0.17]],
        ].map(([radius, position], index) => (
          <mesh key={`nucleus-${index}`} position={position}>
            <sphereGeometry args={[radius, 32, 24]} />
            <meshStandardMaterial
              color={AMBER}
              emissive={ORANGE}
              emissiveIntensity={index === 0 ? 2.8 : 1.8}
              roughness={0.28}
              metalness={0.18}
            />
          </mesh>
        ))}
      </group>

      <group rotation={[THREE.MathUtils.degToRad(58), THREE.MathUtils.degToRad(18), THREE.MathUtils.degToRad(14)]}>
        <group ref={ringOneSpinRef}>
          <mesh>
            <torusGeometry args={[1.02, 0.026, 12, 72]} />
            <meshStandardMaterial
              color={ORANGE}
              emissive={ORANGE}
              emissiveIntensity={2.4}
              transparent
              opacity={0.86}
              roughness={0.32}
              metalness={0.35}
            />
          </mesh>
          <mesh position={[0.98, 0.27, 0]}>
            <sphereGeometry args={[0.095, 16, 12]} />
            <meshStandardMaterial color={AMBER} emissive={ORANGE} emissiveIntensity={4.2} />
          </mesh>
          <mesh position={[-0.72, -0.72, 0]}>
            <sphereGeometry args={[0.08, 16, 12]} />
            <meshStandardMaterial color={AMBER} emissive={ORANGE} emissiveIntensity={4} />
          </mesh>
        </group>
      </group>

      <group rotation={[THREE.MathUtils.degToRad(24), THREE.MathUtils.degToRad(68), THREE.MathUtils.degToRad(-28)]}>
        <group ref={ringTwoSpinRef}>
          <mesh>
            <torusGeometry args={[1.22, 0.026, 12, 72]} />
            <meshStandardMaterial
              color={ORANGE}
              emissive={ORANGE}
              emissiveIntensity={2.4}
              transparent
              opacity={0.82}
              roughness={0.32}
              metalness={0.35}
            />
          </mesh>
          <mesh position={[0.38, 1.16, 0]}>
            <sphereGeometry args={[0.09, 16, 12]} />
            <meshStandardMaterial color={AMBER} emissive={ORANGE} emissiveIntensity={4.2} />
          </mesh>
          <mesh position={[-1.12, 0.48, 0]}>
            <sphereGeometry args={[0.078, 16, 12]} />
            <meshStandardMaterial color={AMBER} emissive={ORANGE} emissiveIntensity={4} />
          </mesh>
        </group>
      </group>

      <group rotation={[THREE.MathUtils.degToRad(68), THREE.MathUtils.degToRad(-34), THREE.MathUtils.degToRad(52)]}>
        <group ref={ringThreeSpinRef}>
          <mesh>
            <torusGeometry args={[1.08, 0.026, 12, 72]} />
            <meshStandardMaterial
              color={ORANGE}
              emissive={ORANGE}
              emissiveIntensity={2.4}
              transparent
              opacity={0.82}
              roughness={0.32}
              metalness={0.35}
            />
          </mesh>
          <mesh position={[-0.54, -0.94, 0]}>
            <sphereGeometry args={[0.085, 16, 12]} />
            <meshStandardMaterial color={AMBER} emissive={ORANGE} emissiveIntensity={4.2} />
          </mesh>
          <mesh position={[0.86, -0.66, 0]}>
            <sphereGeometry args={[0.075, 16, 12]} />
            <meshStandardMaterial color={AMBER} emissive={ORANGE} emissiveIntensity={4} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export default function AtomModel3D({ rotation = { x: -16, y: 32 }, shouldReduceMotion = false }) {
  return (
    <Canvas
      frameloop="demand"
      camera={{ position: [0, 0, 5.2], fov: 44 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      style={{ width: "100%", height: "100%", background: "transparent", pointerEvents: "none" }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[0.45, 0.55, 1.9]} intensity={7} distance={4.5} color="#ffd08a" />
      <pointLight position={[2.5, 2, 3]} intensity={4} distance={7} color="#ffb15c" />
      <pointLight position={[-2, -1, 1]} intensity={2.2} distance={6} color={ORANGE} />
      <AtomScene rotation={rotation} shouldReduceMotion={shouldReduceMotion} />
    </Canvas>
  );
}
