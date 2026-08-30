"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Billboard, Html, OrbitControls, RoundedBox, Text } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";

const ROOT_COLOR = "#ff8a3d";
const DOMAIN_COLORS = ["#22d3ee", "#a855f7", "#ff8a3d", "#38bdf8", "#c084fc"];
const ROOT_POSITION = new THREE.Vector3(0, 6.1, 0);
const PLACEHOLDER_PHOTO_URL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3E%3Crect width='256' height='256' fill='%2308080e'/%3E%3Ccircle cx='128' cy='120' r='60' stroke='%23f5590a' stroke-opacity='.35' stroke-width='2' stroke-dasharray='6 4' fill='none'/%3E%3Cpath d='M108 108h-6a3 3 0 0 0-3 3v24a3 3 0 0 0 3 3h52a3 3 0 0 0 3-3v-24a3 3 0 0 0-3-3h-6l-5-6h-15l-5 6Z' stroke='%23f5590a' stroke-opacity='.5' stroke-width='2' fill='none' stroke-linejoin='round'/%3E%3Ccircle cx='128' cy='123' r='8' stroke='%23f5590a' stroke-opacity='.5' stroke-width='2' fill='none'/%3E%3Ctext x='128' y='168' font-family='monospace' font-size='11' font-weight='bold' fill='%23f5590a' fill-opacity='.4' text-anchor='middle' letter-spacing='1.5'%3EPHOTO PENDING%3C/text%3E%3C/svg%3E";
const PORTRAIT_WIDTH = 204;
const PORTRAIT_HEIGHT = 256;

const sharedCoreGeometry = new THREE.SphereGeometry(1, 16, 16);
const sharedShellGeometry = new THREE.SphereGeometry(1, 10, 10);
const sharedPulseGeometry = new THREE.SphereGeometry(0.075, 6, 6);

function useReducedSceneQuality() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" &&
    (window.matchMedia("(max-width: 640px)").matches || navigator.hardwareConcurrency <= 4),
  );

  useEffect(() => {
    const query = window.matchMedia("(max-width: 640px)");
    const handleChange = () => setReduced(query.matches || navigator.hardwareConcurrency <= 4);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return reduced;
}

/**
 * The renderer works from this root → domain → member hierarchy only. Roster records
 * can therefore be replaced later without changing the 3D scene or interactions.
 */
export function createMembersTreeData(leadership = [], faculty = [], domains = []) {
  return {
    id: "q-bits",
    name: "Q-BITS",
    children: [
      {
        id: "leadership",
        name: "Leadership",
        tagline: "Presidency & Executive Leadership",
        members: leadership.map((member) => ({ ...member, photoUrl: member.photoUrl || member.photo || PLACEHOLDER_PHOTO_URL })),
      },
      {
        id: "faculty",
        name: "Faculty",
        tagline: "Mentors, Advisors & Academic Guidance",
        members: faculty.map((member) => ({ ...member, photoUrl: member.photoUrl || member.photo || PLACEHOLDER_PHOTO_URL })),
      },
      ...domains.map((domain) => ({
        id: domain.id,
        name: domain.name,
        tagline: domain.tagline,
        members: domain.members.map((member) => ({ ...member, photoUrl: member.photoUrl || member.photo || PLACEHOLDER_PHOTO_URL })),
      })),
    ],
  };
}

function createTreeLayout(tree, activeDomain) {
  const layout = {
    domains: new Map(),
    members: new Map(),
  };
  const rowYs = [2.65, -0.65, -3.85];
  const rows = [
    [-8.2, -2.75, 2.75, 8.2],
    [-8.2, -2.75, 2.75, 8.2],
    [-5.4, 0, 5.4],
  ];

  tree.children.forEach((domain, domainIndex) => {
    const row = domainIndex < 4 ? 0 : domainIndex < 8 ? 1 : 2;
    const column = row === 0 ? domainIndex : row === 1 ? domainIndex - 4 : domainIndex - 8;
    const position = new THREE.Vector3(
      rows[row][column],
      rowYs[row],
      Math.sin(domainIndex * 1.7) * 2.15 + (row - 1) * 0.7,
    );
    const isExpanded = activeDomain === domain.id;
    const memberSpread = isExpanded ? 1.55 : 0.72;
    const branchDrop = isExpanded ? 1.85 : 1.18;

    layout.domains.set(domain.id, position);
    domain.members.forEach((member, memberIndex) => {
      const offset = memberIndex - (domain.members.length - 1) / 2;
      layout.members.set(
        `${domain.id}-${memberIndex}`,
        position.clone().add(
          new THREE.Vector3(
            offset * 0.92 * memberSpread,
            -branchDrop - Math.abs(offset) * 0.14,
            (memberIndex % 2 === 0 ? 0.95 : -0.95) * memberSpread + Math.cos(memberIndex * 1.4) * 0.32,
          ),
        ),
      );
    });
  });

  return layout;
}

function createConnectorCurve(from, to, bend = 0.38) {
  const direction = to.clone().sub(from);
  const midpoint = from.clone().lerp(to, 0.5);
  const sideways = new THREE.Vector3(-direction.z, 0, direction.x).normalize();
  midpoint.addScaledVector(sideways, bend).add(new THREE.Vector3(0, 0.34, 0));
  return new THREE.QuadraticBezierCurve3(from, midpoint, to);
}

function EnergyPulse({ curve, color, phase, muted }) {
  const pulseRef = useRef();

  useFrame(({ clock }) => {
    if (!pulseRef.current) return;
    const progress = (clock.elapsedTime * 0.105 + phase) % 1;
    pulseRef.current.position.copy(curve.getPoint(progress));
    const scale = muted ? 0.46 : 0.72 + Math.sin(clock.elapsedTime * 4.5 + phase * 9) * 0.12;
    pulseRef.current.scale.setScalar(scale);
  });

  return (
    <mesh ref={pulseRef} geometry={sharedPulseGeometry} renderOrder={3}>
      <meshBasicMaterial color={color} transparent opacity={muted ? 0.16 : 0.78} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

function EnergyEdge({ from, to, color, phase, state, showPulse }) {
  const curve = useMemo(() => createConnectorCurve(from, to, state === "active" ? 0.52 : 0.3), [from, state, to]);
  const points = useMemo(() => curve.getPoints(22), [curve]);
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);
  const muted = state === "muted";
  const active = state === "active";

  return (
    <group>
      <line geometry={geometry}>
        <lineBasicMaterial color={color} transparent opacity={muted ? 0.08 : active ? 0.78 : 0.36} depthWrite={false} toneMapped={false} />
      </line>
      <line geometry={geometry}>
        <lineBasicMaterial color="#f8fafc" transparent opacity={muted ? 0.012 : active ? 0.18 : 0.05} depthWrite={false} toneMapped={false} />
      </line>
      {showPulse && <EnergyPulse curve={curve} color={color} phase={phase} muted={muted} />}
    </group>
  );
}

function NetworkNode({ position, size, color, level, muted = false, active = false, onClick, onHoverChange }) {
  const nodeRef = useRef();
  const shellRef = useRef();
  const auraRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (!nodeRef.current) return;
    nodeRef.current.position.lerp(position, 0.12);
    const pulse = 1 + Math.sin(clock.elapsedTime * (level === "root" ? 2.1 : 1.7) + position.x) * (level === "member" ? 0.035 : 0.055);
    const emphasis = active ? 1.16 : hovered ? 1.1 : muted ? 0.84 : 1;
    const scale = THREE.MathUtils.lerp(nodeRef.current.scale.x, pulse * emphasis, 0.14);
    nodeRef.current.scale.setScalar(scale);
    if (shellRef.current) shellRef.current.rotation.y = clock.elapsedTime * (level === "root" ? 0.32 : 0.16);
    if (auraRef.current) auraRef.current.material.opacity = muted ? 0.018 : active ? 0.15 : level === "root" ? 0.14 : 0.075;
  });

  const handlePointerOver = (event) => {
    event.stopPropagation();
    setHovered(true);
    onHoverChange?.(true);
    document.body.style.cursor = onClick ? "pointer" : "default";
  };

  const handlePointerOut = () => {
    setHovered(false);
    onHoverChange?.(false);
    document.body.style.cursor = "auto";
  };

  return (
    <group ref={nodeRef} position={position}>
      <mesh ref={auraRef} scale={size * 2.5} renderOrder={0}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh
        geometry={sharedCoreGeometry}
        scale={size}
        onClick={(event) => {
          if (!onClick) return;
          event.stopPropagation();
          onClick();
        }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <meshStandardMaterial
          color="#e2e8f0"
          emissive={color}
          emissiveIntensity={muted ? 0.32 : active ? 2.5 : level === "root" ? 2.3 : 1.35}
          roughness={0.22}
          metalness={0.42}
          transparent
          opacity={muted ? 0.22 : 1}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={shellRef} geometry={sharedShellGeometry} scale={size * 1.35} renderOrder={2}>
        <meshBasicMaterial color={color} wireframe transparent opacity={muted ? 0.035 : active ? 0.52 : 0.24} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

function PhotoNode({ member, position, size, color, muted = false, active = false, onClick, onHoverChange }) {
  const nodeRef = useRef();
  const auraRef = useRef();
  const borderMaterialRef = useRef();
  const photoMaterialRef = useRef();
  const [texture, setTexture] = useState(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let nextTexture;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const sourceAspect = PORTRAIT_WIDTH / PORTRAIT_HEIGHT;
      const imageAspect = image.naturalWidth / image.naturalHeight;
      const sourceWidth = imageAspect > sourceAspect ? image.naturalHeight * sourceAspect : image.naturalWidth;
      const sourceHeight = imageAspect > sourceAspect ? image.naturalHeight : image.naturalWidth / sourceAspect;
      const sourceX = (image.naturalWidth - sourceWidth) / 2;
      const sourceY = (image.naturalHeight - sourceHeight) / 2;
      const canvas = document.createElement("canvas");
      canvas.width = PORTRAIT_WIDTH;
      canvas.height = PORTRAIT_HEIGHT;
      canvas.getContext("2d").drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, PORTRAIT_WIDTH, PORTRAIT_HEIGHT);
      nextTexture = new THREE.CanvasTexture(canvas);
      nextTexture.colorSpace = THREE.SRGBColorSpace;
      nextTexture.needsUpdate = true;
      if (cancelled) {
        nextTexture.dispose();
        return;
      }
      setTexture(nextTexture);
    };
    image.src = member.photoUrl;

    return () => {
      cancelled = true;
      nextTexture?.dispose();
    };
  }, [member.photoUrl]);

  const photoWidth = size * 2;
  const photoHeight = photoWidth * (PORTRAIT_HEIGHT / PORTRAIT_WIDTH);

  useFrame(({ clock }) => {
    if (!nodeRef.current) return;
    nodeRef.current.position.lerp(position, 0.12);
    const emphasis = active || hovered ? 1.12 : muted ? 0.84 : 1;
    const scale = THREE.MathUtils.lerp(nodeRef.current.scale.x, emphasis, 0.14);
    nodeRef.current.scale.setScalar(scale);
    const targetOpacity = texture ? (muted ? 0.22 : 1) : 0;
    if (photoMaterialRef.current) {
      photoMaterialRef.current.opacity = THREE.MathUtils.lerp(photoMaterialRef.current.opacity, targetOpacity, 0.14);
    }
    if (auraRef.current) auraRef.current.material.opacity = muted ? 0.018 : hovered || active ? 0.16 : 0.075;
    if (borderMaterialRef.current) borderMaterialRef.current.opacity = muted ? 0.12 : hovered || active ? 0.92 : 0.58;
    if (nodeRef.current) nodeRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.35 + position.x) * 0.012;
  });

  const handlePointerOver = (event) => {
    event.stopPropagation();
    setHovered(true);
    onHoverChange?.(true);
  };

  const handlePointerOut = () => {
    setHovered(false);
    onHoverChange?.(false);
    document.body.style.cursor = "auto";
  };

  return (
    <group ref={nodeRef} position={position}>
      <mesh ref={auraRef} scale={size * 2.5} renderOrder={0}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshBasicMaterial color={color} transparent opacity={0.075} depthWrite={false} toneMapped={false} />
      </mesh>
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <RoundedBox args={[photoWidth + size * 0.12, photoHeight + size * 0.12, 0.16]} radius={size * 0.25} smoothness={1} position={[0, 0, -0.012]} renderOrder={1}>
          <meshBasicMaterial ref={borderMaterialRef} color={color} transparent opacity={0.58} depthWrite={false} toneMapped={false} />
        </RoundedBox>
        <RoundedBox
          args={[photoWidth, photoHeight, 0.08]}
          radius={size * 0.12}
          smoothness={1}
          onClick={(event) => {
            event.stopPropagation();
            onClick?.();
          }}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          renderOrder={2}
        >
          <meshBasicMaterial ref={photoMaterialRef} map={texture} color="#ffffff" transparent opacity={0} depthWrite={false} toneMapped={false} />
        </RoundedBox>
      </Billboard>
    </group>
  );
}

function SceneLabel({ position, title, subtitle, color, size = 0.22, emphasis = false, muted = false, maxWidth = 3.3 }) {
  return (
    <Billboard position={position} follow lockX={false} lockY={false} lockZ={false}>
      <Text
        fontSize={size}
        maxWidth={maxWidth}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        color={muted ? "#64748b" : emphasis ? "#fff7ed" : "#e2e8f0"}
        outlineWidth={emphasis ? 0.022 : 0.014}
        outlineColor="#05060a"
        fillOpacity={muted ? 0.44 : 1}
        letterSpacing={emphasis ? 0.07 : 0.03}
        raycast={() => null}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          position={[0, -size * 1.45, 0]}
          fontSize={emphasis ? 0.125 : 0.1}
          maxWidth={maxWidth}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          color={muted ? "#475569" : color}
          outlineWidth={0.007}
          outlineColor="#05060a"
          letterSpacing={0.07}
          raycast={() => null}
        >
          {subtitle}
        </Text>
      )}
    </Billboard>
  );
}

function RootNode() {
  return (
    <>
      <NetworkNode position={ROOT_POSITION} size={0.74} color={ROOT_COLOR} level="root" />
      <SceneLabel
        position={ROOT_POSITION.clone().add(new THREE.Vector3(0, 1.32, 0))}
        title="Q-BITS"
        subtitle="CLUB CORE"
        color="#ffd1a3"
        size={0.5}
        emphasis
        maxWidth={3.4}
      />
    </>
  );
}

function PlaceholderAvatar({ code }) {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden="true">
      <circle cx="24" cy="17" r="8" fill="#ffb36e" opacity="0.9" />
      <path d="M8 44c1.8-10.2 8-15.3 16-15.3S38.2 33.8 40 44" fill="#f5590a" opacity="0.85" />
      <text x="24" y="43" textAnchor="middle" fill="#fff7ed" fontSize="5" fontFamily="monospace">{code}</text>
    </svg>
  );
}

function MemberTooltip({ member, color }) {
  return (
    <div className="pointer-events-none w-44 overflow-hidden rounded-xl border border-white/15 bg-[#090A10]/95 p-2.5 shadow-[0_14px_35px_rgba(0,0,0,0.72),0_0_24px_rgba(34,211,238,0.13)] backdrop-blur-xl">
      <div className="flex items-center gap-2.5">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border bg-[#120d0a]" style={{ borderColor: color }}>
          <img src={member.photoUrl} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-mono text-[10px] font-black uppercase tracking-wide text-white">{member.name}</p>
          <p className="mt-0.5 text-[10px] leading-tight" style={{ color }}>{member.role}</p>
        </div>
      </div>
    </div>
  );
}

function MemberNode({ member, position, color, state, showLabel, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const muted = state === "muted";

  return (
    <>
      <PhotoNode
        member={member}
        position={position}
        size={0.24}
        color={color}
        muted={muted}
        active={hovered}
        onClick={() => onSelect(member)}
        onHoverChange={setHovered}
      />
      {(true || hovered) && (
        <SceneLabel
          position={position.clone().add(new THREE.Vector3(0, 0.42, 0))}
          title={member.name}
          subtitle={member.role}
          color={color}
          size={0.16}
          muted={muted}
          maxWidth={2.4}
        />
      )}
      {hovered && !muted && (
        <Html position={position.clone().add(new THREE.Vector3(0, 0.7, 0))} center distanceFactor={10} style={{ pointerEvents: "none" }}>
          <MemberTooltip member={member} color={color} />
        </Html>
      )}
    </>
  );
}

function Starfield({ count }) {
  const pointsRef = useRef();
  const positions = useMemo(() => {
    const data = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const angle = index * 2.399963229728653;
      const radius = 11 + ((index * 13) % 31) * 0.54;
      data[index * 3] = Math.cos(angle) * radius;
      data[index * 3 + 1] = ((index * 17) % 43) * 0.44 - 8.4;
      data[index * 3 + 2] = Math.sin(angle) * radius - 6;
    }
    return data;
  }, [count]);

  useFrame(({ clock }) => {
    if (pointsRef.current) pointsRef.current.rotation.y = clock.elapsedTime * 0.0025;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#7dd3fc" size={0.027} sizeAttenuation transparent opacity={0.34} depthWrite={false} toneMapped={false} />
    </points>
  );
}

function CameraRig({ controlsRef, focusRequest, domainPositions }) {
  const { camera } = useThree();
  const movementRef = useRef(null);

  useEffect(() => {
    const target = focusRequest.id ? domainPositions.get(focusRequest.id) : new THREE.Vector3(0, 0.65, 0);
    if (!target) return;
    movementRef.current = {
      progress: 0,
      fromCamera: camera.position.clone(),
      fromTarget: controlsRef.current?.target.clone() || new THREE.Vector3(),
      toCamera: focusRequest.id ? target.clone().add(new THREE.Vector3(0, 0.75, 12.6)) : new THREE.Vector3(0, 0.75, 24),
      toTarget: target.clone(),
    };
  }, [camera, controlsRef, domainPositions, focusRequest]);

  useFrame((_, delta) => {
    if (!movementRef.current || !controlsRef.current) return;
    const movement = movementRef.current;
    controlsRef.current.enabled = false;
    movement.progress = Math.min(1, movement.progress + delta * 1.5);
    const eased = 1 - (1 - movement.progress) ** 3;
    camera.position.lerpVectors(movement.fromCamera, movement.toCamera, eased);
    controlsRef.current.target.lerpVectors(movement.fromTarget, movement.toTarget, eased);
    controlsRef.current.update();
    if (movement.progress === 1) {
      movementRef.current = null;
      controlsRef.current.enabled = true;
    }
  });

  return null;
}

function TreeScene({ tree, activeDomain, onDomainSelect, onMemberSelect, focusRequest, reducedQuality }) {
  const controlsRef = useRef();
  const layout = useMemo(() => createTreeLayout(tree, activeDomain), [tree, activeDomain]);

  return (
    <>
      <fog attach="fog" args={["#06070c", 17, 35]} />
      <ambientLight intensity={0.38} />
      <directionalLight position={[0, 8, 8]} intensity={0.9} color="#d9faff" />
      <Starfield count={reducedQuality ? 50 : 120} />

      {tree.children.map((domain, domainIndex) => {
        const domainPosition = layout.domains.get(domain.id);
        const color = DOMAIN_COLORS[domainIndex % DOMAIN_COLORS.length];
        const state = activeDomain ? (activeDomain === domain.id ? "active" : "muted") : "default";
        return (
          <group key={domain.id}>
            <EnergyEdge
              from={ROOT_POSITION}
              to={domainPosition}
              color={color}
              phase={domainIndex / tree.children.length}
              state={state}
              showPulse={!reducedQuality && (state === "active" || domainIndex % 2 === 0)}
            />
            <NetworkNode
              position={domainPosition}
              size={0.43}
              color={color}
              level="domain"
              muted={state === "muted"}
              active={state === "active"}
              onClick={() => onDomainSelect(domain.id)}
            />
            <SceneLabel
              position={domainPosition.clone().add(new THREE.Vector3(0, 0.78, 0))}
              title={domain.name}
              subtitle={activeDomain === domain.id ? `${domain.members.length} MEMBERS // EXPANDED` : "DOMAIN NODE"}
              color={color}
              size={domain.name.length > 18 ? 0.16 : 0.21}
              emphasis={state === "active"}
              muted={state === "muted"}
              maxWidth={3.1}
            />
            {domain.members.map((member, memberIndex) => {
              const memberPosition = layout.members.get(`${domain.id}-${memberIndex}`);
              return (
                <group key={`${domain.id}-${member.code || memberIndex}`}>
                  <EnergyEdge
                    from={domainPosition}
                    to={memberPosition}
                    color={color}
                    phase={(domainIndex + memberIndex / Math.max(1, domain.members.length)) / tree.children.length}
                    state={state}
                    showPulse={!reducedQuality && (state === "active" || (state === "default" && memberIndex === 0))}
                  />
                  <MemberNode
                    member={member}
                    position={memberPosition}
                    color={color}
                    state={state}
                    showLabel={true}
                    onSelect={onMemberSelect}
                  />
                </group>
              );
            })}
          </group>
        );
      })}

      <CameraRig controlsRef={controlsRef} focusRequest={focusRequest} domainPositions={layout.domains} />
      <OrbitControls
        ref={controlsRef}
        enablePan
        enableZoom
        enableDamping
        dampingFactor={0.12}
        panSpeed={0.55}
        rotateSpeed={0.42}
        zoomSpeed={0.58}
        screenSpacePanning
        zoomToCursor
        autoRotate
        autoRotateSpeed={0.16}
        minDistance={7.5}
        maxDistance={34}
        maxPolarAngle={Math.PI * 0.84}
        minPolarAngle={Math.PI * 0.16}
        mouseButtons={{ LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE }}
        touches={{ ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_ROTATE }}
      />
    </>
  );
}

function MemberDetailPanel({ member, onClose }) {
  if (!member) return null;

  return (
    <div className="absolute bottom-4 right-4 z-10 w-[min(18rem,calc(100%-2rem))] overflow-hidden rounded-xl border border-[#F5590A]/45 bg-[#090A10]/95 p-4 shadow-[0_20px_48px_rgba(0,0,0,0.8),0_0_30px_rgba(245,89,10,0.2)] backdrop-blur-xl sm:bottom-6 sm:right-6">
      <span className="comic-corner-bracket comic-corner-bracket--tl" aria-hidden="true" />
      <span className="comic-corner-bracket comic-corner-bracket--br" aria-hidden="true" />
      <button type="button" onClick={onClose} className="absolute right-2.5 top-2.5 rounded-full px-2 py-0.5 font-mono text-xs text-stone-400 transition hover:bg-white/10 hover:text-white" aria-label="Close member details">
        ×
      </button>
      <div className="flex items-center gap-3 pr-5">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-[#F5590A]/55 bg-[#120d0a] shadow-[0_0_18px_rgba(245,89,10,0.25)]">
          <img src={member.photoUrl} alt={`${member.name} portrait`} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#FF8A3D]">{member.code || "Q-BIT"}</p>
          <h3 className="truncate text-sm font-black text-white">{member.name}</h3>
          <p className="mt-0.5 text-xs text-[#FFB703]">{member.role}</p>
        </div>
      </div>
      <p className="mt-3 border-t border-white/10 pt-3 font-mono text-[10px] leading-relaxed text-stone-400">Connected to the Q-BITS team network. Member profiles can be swapped in without changing this tree layout.</p>
    </div>
  );
}

export default function MembersTree3D({ leadership = [], faculty = [], domains = [], view, onViewChange }) {
  const tree = useMemo(() => createMembersTreeData(leadership, faculty, domains), [leadership, faculty, domains]);
  const reducedQuality = useReducedSceneQuality();
  const viewportRef = useRef(null);
  const [activeDomain, setActiveDomain] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [focusRequest, setFocusRequest] = useState({ id: null, version: 0 });
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !document.fullscreenEnabled || !viewport.requestFullscreen) return undefined;

    viewport.requestFullscreen().catch(() => {
      // CSS viewport fallback remains active when fullscreen is unavailable.
    });

    return () => {
      if (document.fullscreenElement === viewport && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  const focusDomain = (domainId) => {
    const nextDomain = activeDomain === domainId ? null : domainId;
    setActiveDomain(nextDomain);
    setSelectedMember(null);
    setFocusRequest((current) => ({ id: nextDomain, version: current.version + 1 }));
  };

  const resetView = () => {
    setActiveDomain(null);
    setSelectedMember(null);
    setFocusRequest((current) => ({ id: null, version: current.version + 1 }));
  };

  const closeView = () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    onViewChange?.("2d");
  };

  const scene = (
    <section
      ref={viewportRef}
      className="members-3d-viewport fixed inset-0 z-[100] isolate h-screen w-screen overflow-hidden bg-[#06070c]"
      aria-label="Interactive 3D Q-BITS member network"
    >
      <div className="members-3d-canvas absolute inset-0 z-0 h-full w-full bg-[#06070c]">
        <Canvas
          className="h-full w-full"
          resize={{ scroll: false, debounce: 0 }}
          camera={{ position: [0, 0.75, 24], fov: 40, near: 0.1, far: 100 }}
          dpr={reducedQuality ? [1, 1] : [1, 1.2]}
          gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.04;
            gl.outputColorSpace = THREE.SRGBColorSpace;
            gl.setClearColor("#06070c", 1);
          }}
        >
          <TreeScene
            tree={tree}
            activeDomain={activeDomain}
            onDomainSelect={focusDomain}
            onMemberSelect={setSelectedMember}
            focusRequest={focusRequest}
            reducedQuality={reducedQuality}
          />
        </Canvas>
      </div>

      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_50%_42%,transparent_25%,rgba(1,2,6,0.2)_64%,rgba(1,2,6,0.82)_100%),radial-gradient(circle_at_50%_0%,rgba(245,89,10,0.12),transparent_36%),radial-gradient(circle_at_50%_72%,rgba(34,211,238,0.07),transparent_48%)]" />

      {showInstructions && (
        <div className="pointer-events-auto absolute left-4 top-4 z-10 max-w-[18rem] rounded-xl border border-white/10 bg-[#090A10]/72 px-3.5 py-3 shadow-[0_12px_35px_rgba(0,0,0,0.42)] backdrop-blur-md sm:left-6 sm:top-6">
          <button
            type="button"
            onClick={() => setShowInstructions(false)}
            className="absolute right-2.5 top-2.5 rounded-full px-1.5 py-0.5 font-mono text-xs text-stone-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Close how-to-use panel"
          >
            ×
          </button>
          <span className="comic-corner-bracket comic-corner-bracket--tl" aria-hidden="true" />
          <span className="comic-corner-bracket comic-corner-bracket--br" aria-hidden="true" />
          <p className="mb-2 pr-6 font-mono text-sm font-black uppercase tracking-[0.14em] text-white">Our Members</p>
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#FF8A3D]">Q-BITS // neural roster</p>
          <p className="mt-1.5 font-mono text-[10px] leading-relaxed text-stone-400">
            <span className="block">Mouse: Drag to pan · Right-click drag to orbit · Scroll to zoom</span>
            <span className="block">Touch: Two-finger drag to pan · Two-finger twist to rotate · Pinch to zoom</span>
          </p>
          <button type="button" onClick={resetView} className="pointer-events-auto mt-3 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-[#090A10]/85 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-stone-200 shadow-[0_0_20px_rgba(0,0,0,0.38)] backdrop-blur-md transition hover:border-[#F5590A]/80 hover:bg-[#F5590A]/15 hover:text-white">
            <span className="text-[#FF8A3D]" aria-hidden="true">⌁</span>
            Reset view
          </button>
        </div>
      )}

      <div className="pointer-events-none absolute right-4 top-4 z-10 flex flex-col items-end gap-2 sm:right-6 sm:top-6">
        <div className="pointer-events-auto">
          <button type="button" onClick={closeView} className="rounded-l-full border border-r-0 border-[#F5590A]/45 bg-[#08080E]/90 px-3 py-2 font-mono text-[10px] font-black uppercase tracking-wider text-stone-400 backdrop-blur-xl transition hover:text-white">2D</button>
          <button type="button" onClick={() => onViewChange?.("3d")} aria-pressed={view === "3d"} className="rounded-r-full border border-[#F5590A]/60 bg-[#F5590A] px-3 py-2 font-mono text-[10px] font-black uppercase tracking-wider text-[#0A0A0A] shadow-[0_0_20px_rgba(245,89,10,0.45)]">3D</button>
        </div>
      </div>

      <button type="button" onClick={closeView} className="absolute right-4 top-[4.5rem] z-10 rounded-full border border-white/15 bg-[#090A10]/85 px-3 py-1.5 font-mono text-sm text-stone-300 shadow-[0_0_20px_rgba(0,0,0,0.38)] backdrop-blur-md transition hover:border-[#F5590A]/80 hover:bg-[#F5590A]/15 hover:text-white sm:right-6 sm:top-[5rem]" aria-label="Close 3D member view">×</button>

      {activeDomain && (
        <div className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-lg border border-white/10 bg-[#071015]/84 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.08)] backdrop-blur-md sm:bottom-6 sm:left-6">
          Focus: {tree.children.find((domain) => domain.id === activeDomain)?.name}
        </div>
      )}

      <MemberDetailPanel member={selectedMember} onClose={() => setSelectedMember(null)} />
    </section>
  );

  return typeof document === "undefined" ? null : createPortal(scene, document.body);
}
