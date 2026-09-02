"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Counter } from "@/components/MotionPrimitives";
import MembersSection from "@/components/MembersSection";
import { eventAlbums } from "@/lib/eventPhotos";

const AtomModel3D = dynamic(() => import("@/components/AtomModel3D"), {
  ssr: false,
  loading: () => <div className="h-full w-full" aria-hidden="true" />,
});

const InfiniteCanvasView = dynamic(() => import("@/components/InfiniteCanvasView"), {
  ssr: false,
});

const QuantumCubeScene = dynamic(() => import("@/components/QuantumCubeScene"), {
  ssr: false,
  loading: () => <div className="h-[260px] w-full rounded-2xl bg-[#08080C] sm:h-[320px]" />,
});

const easeOut = [0.16, 1, 0.3, 1];

// Interactive 3D Quantum Hero Cube Component with Comic Affordances
function InteractiveHeroCube({ onOpenModal }) {
  const shouldReduceMotion = useReducedMotion();
  const [rotation, setRotation] = useState({ x: -16, y: 32 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, rotX: -16, rotY: 32 });
  const autoAngleRef = useRef(32);
  const inertiaRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef(null);
  const containerRef = useRef(null);
  const calloutRef = useRef(null);
  const [mouseParallax, setMouseParallax] = useState({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const [hasMobileDemoed, setHasMobileDemoed] = useState(false);
  const { scrollYProgress: calloutScrollProgress } = useScroll({
    target: calloutRef,
    offset: ["start 92%", "center 62%"],
  });
  const calloutOpacity = useTransform(calloutScrollProgress, [0, 0.72], [0, 1]);
  const calloutY = useTransform(calloutScrollProgress, [0, 0.72], [30, 0]);
  const calloutScale = useTransform(calloutScrollProgress, [0, 0.72], [0.9, 1]);
  const calloutRotation = useTransform(calloutScrollProgress, [0, 0.72], [0, 0]);

  // Auto-rotation when not dragging
  useEffect(() => {
    if (shouldReduceMotion) return;

    let lastTime = performance.now();
    const loop = (currentTime) => {
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      if (!isDragging) {
        autoAngleRef.current += delta * 18;
        setRotation((prev) => {
          const easedX = prev.x + (mouseParallax.y * 10 - prev.x) * 0.055 + inertiaRef.current.x;
          const easedY = autoAngleRef.current + mouseParallax.x * 18 + inertiaRef.current.y;
          inertiaRef.current.x *= 0.94;
          inertiaRef.current.y *= 0.94;
          if (Math.abs(inertiaRef.current.x) < 0.002) inertiaRef.current.x = 0;
          if (Math.abs(inertiaRef.current.y) < 0.002) inertiaRef.current.y = 0;
          return { x: easedX, y: easedY };
        });
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isDragging, mouseParallax, shouldReduceMotion]);

  // Mobile In-View One-Time Demo Spin
  useEffect(() => {
    if (shouldReduceMotion || hasMobileDemoed) return;
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !hasMobileDemoed) {
          setHasMobileDemoed(true);
          autoAngleRef.current += 90;
          setRotation((prev) => ({ ...prev, y: prev.y + 90 }));
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMobileDemoed, shouldReduceMotion]);

  // Pointer drag event handlers
  const handlePointerDown = useCallback((e) => {
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotX: rotation.x,
      rotY: rotation.y,
    };
    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
  }, [rotation]);

  const handlePointerMove = useCallback((e) => {
    if (isDragging) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMovedRef.current = true;
      }
      const newRotX = Math.max(-60, Math.min(60, dragStartRef.current.rotX - dy * 0.5));
      const newRotY = dragStartRef.current.rotY + dx * 0.5;
      inertiaRef.current = {
        x: (newRotX - rotation.x) * 0.16,
        y: (newRotY - rotation.y) * 0.16,
      };
      setRotation({ x: newRotX, y: newRotY });
      autoAngleRef.current = newRotY;
    } else if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      setMouseParallax({ x: nx, y: ny });
    }
  }, [isDragging, rotation]);

  const handlePointerUp = useCallback((e) => {
    setIsDragging(false);
    if (containerRef.current && containerRef.current.hasPointerCapture(e.pointerId)) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }
    if (!hasMovedRef.current) {
      onOpenModal();
    }
  }, [onOpenModal]);

  const handlePointerLeave = useCallback(() => {
    if (!isDragging) {
      setMouseParallax({ x: 0, y: 0 });
    }
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      className={`hero-3d-stage comic-atom-stage group relative my-6 flex flex-col items-center justify-center p-6 sm:my-8 sm:p-10 select-none ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      role="button"
      tabIndex={0}
      aria-label="Interactive 3D Quantum Atom. Drag to rotate, click to unbox."
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenModal();
        }
      }}
    >
      {/* Continuous Sonar Radar Ping Rings */}
      <div className="comic-sonar-container pointer-events-none" aria-hidden="true">
        <span className="comic-sonar-ring comic-sonar-ring--1" />
        <span className="comic-sonar-ring comic-sonar-ring--2" />
        <span className="comic-sonar-ring comic-sonar-ring--3" />
      </div>

      {/* Ambient background glow behind atom */}
      <div className="hero-atom-glow pointer-events-none" aria-hidden="true" />

      {/* Quantum HUD callout */}
      <motion.div
        ref={calloutRef}
        className="hero-hud-callout"
        style={{
          x: "-50%",
          opacity: shouldReduceMotion ? 1 : calloutOpacity,
          y: shouldReduceMotion ? 0 : calloutY,
          scale: shouldReduceMotion ? 1 : calloutScale,
          rotate: shouldReduceMotion ? 0 : calloutRotation,
        }}
        whileHover={{ x: "-50%", scale: 1.03, rotate: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        aria-hidden="true"
      >
        <span className="hero-hud-core" />
        <span className="hero-hud-label">CLICK TO EXPLORE OUR QUANTUM WORLD</span>
        <span className="hero-hud-tail" aria-hidden="true" />
      </motion.div>

      {/* 3D Atom Viewport */}
      <div className="hero-atom-viewport">
        <AtomModel3D rotation={rotation} shouldReduceMotion={shouldReduceMotion} />
      </div>

      {/* Holographic Pedestal / Technical Indicator */}
      <div className="hero-atom-pedestal mt-6 flex flex-col items-center gap-1.5 pointer-events-none">
        <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] uppercase text-[#f7b46d]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff9b42] shadow-[0_0_10px_rgba(255,155,66,0.9)] animate-ping" />
          <span>INTERACTIVE CORE // 3D DRAG TO ROTATE</span>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#f4c890]">
          Click atom or button to unbox full details
        </span>
      </div>
    </div>
  );
}

export default function AboutPage() {
  const shouldReduceMotion = useReducedMotion();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventsView, setEventsView] = useState("2d");
  const [selectedEventAlbum, setSelectedEventAlbum] = useState(null);
  const [albumPortalTarget, setAlbumPortalTarget] = useState(null);
  const isCubeInView = isModalOpen;
  const cubeContainerRef = useRef(null);

  useEffect(() => {
    setAlbumPortalTarget(document.body);
  }, []);

  useEffect(() => {
    if (!selectedEventAlbum) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setSelectedEventAlbum(null);
    };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedEventAlbum]);

  // Close modal on Escape key & manage body scroll lock + navbar hiding
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("qam-modal-toggle", { detail: { open: isModalOpen } })
    );

    if (isModalOpen || eventsView === "3d") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    if (isModalOpen) {
      const handleKeyDown = (e) => {
        if (e.key === "Escape") setIsModalOpen(false);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isModalOpen, eventsView]);

  const stats = [
    { value: 36, suffix: " Hours", label: "National Hackathon", icon: "clock" },
    { value: 4, suffix: " Tracks", label: "Frontier Domains", icon: "grid" },
    { value: 3, suffix: ".0", label: "Flagship Edition", icon: "spark" },
    { value: 1000, suffix: "+", label: "Hackers & Innovators", icon: "users" },
  ];

  const eventsData = [
    {
      id: "quant-a-maze-2",
      badge: "FLAGSHIP",
      badgeColor: "border-[#F5590A] text-[#F5590A] bg-[#F5590A]/10",
      title: "QUANT-A-MAZE 2.0",
      date: "14-16 November 2024",
      track: "National Hackathon",
      desc: "Quant-A-Maze 2.0 brought students together for a national-level quantum technology hackathon, combining rapid prototyping, problem-solving, and hands-on exploration across emerging computing frontiers.",
      photos: eventAlbums.find((album) => album.eventId === "quant-a-maze-2")?.photos ?? [],
    },
  ];

  const folderCardStyles = {
    closed: "opacity-0 scale-0 translate-y-[20px]",
    open: "opacity-100 scale-100 translate-y-0",
  };

  const modalPages = [
    { id: 0, title: "About", label: "01 // ABOUT", subtitle: "Mission & Tech" },
    { id: 1, title: "Our Events", label: "02 // OUR EVENTS", subtitle: "Hackathons & Talks" },
    { id: 2, title: "Our Members", label: "03 // OUR MEMBERS", subtitle: "Leadership & Team" },
  ];

  const [activeModalPage, setActiveModalPage] = useState(0);
  const [modalDirection, setModalDirection] = useState(0);

  const goToModalPage = useCallback((newPage) => {
    if (newPage < 0 || newPage >= modalPages.length || newPage === activeModalPage) return;
    setModalDirection(newPage > activeModalPage ? 1 : -1);
    setActiveModalPage(newPage);
  }, [activeModalPage, modalPages.length]);

  // Keyboard navigation for Left/Right arrows in modal
  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        goToModalPage(Math.min(modalPages.length - 1, activeModalPage + 1));
      } else if (e.key === "ArrowLeft") {
        goToModalPage(Math.max(0, activeModalPage - 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, activeModalPage, goToModalPage, modalPages.length]);

  function EventArchiveFolderCard({ album, onOpen }) {
    const [isHovered, setIsHovered] = useState(false);
    const previewPhotos = (album?.photos ?? []).slice(0, 5);

    return (
      <div
        className="relative h-[130px] w-[170px] cursor-pointer select-none perspective-[1200px]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
      >
        <div
          className={`relative h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isHovered ? "-rotate-y-[5deg] rotate-x-[10deg]" : ""}`}
          style={{ transformStyle: "preserve-3d" }}
        >
          <svg viewBox="0 0 50 40" className="absolute bottom-0 left-0 h-full w-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]" aria-hidden="true">
            <path d="M0 4C0 1.79 1.79 0 4 0H16.52C17.72 0 18.84.54 19.57 1.47L22.43 5.07C23.16 5.99 24.28 6.53 25.48 6.53H46C48.21 6.53 50 8.32 50 10.53V36C50 38.21 48.21 40 46 40H4C1.79 40 0 38.21 0 36V4Z" fill="#0f4c9a" />
          </svg>

          <div className={`absolute bottom-[-7px] left-0 z-[90] w-full origin-bottom transition-transform duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${isHovered ? "rotate-x-[-50deg]" : ""}`}>
            <svg viewBox="0 0 50 34" className="w-full" aria-hidden="true">
              <path d="M0 4C0 1.79 1.79 0 4 0H46C48.21 0 50 1.79 50 4V30C50 32.21 48.21 34 46 34H4C1.79 34 0 32.21 0 30V4Z" fill="rgba(245, 89, 10, 0.65)" />
            </svg>
          </div>

          <div className={`absolute left-[10%] top-[-40px] z-[20] flex h-[25px] items-center rounded-full border border-white/20 bg-[#F5590A]/90 px-2 transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] ${isHovered ? "top-[-36px] w-[80%] opacity-100" : "w-[30px] opacity-0"}`}>
            <svg viewBox="0 0 24 24" className="h-[12px] w-[12px] shrink-0 stroke-white" fill="none" strokeWidth="3" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className="ml-2 text-[9px] font-bold text-white/90">{album?.eventName ?? "Album"}</span>
          </div>

          <div className={`absolute right-[-75px] top-[-95px] z-[100] flex items-center gap-2 rounded-full bg-[#c9a6ff] px-2 py-1 text-black shadow-[0_10px_20px_rgba(0,0,0,0.3)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isHovered ? "scale-100 translate-y-0 opacity-100" : "scale-0 translate-y-[20px] opacity-0"}`}>
            <span className="relative h-[6px] w-[6px] rounded-full bg-[#34d399] shadow-[0_0_10px_#34d399]">
              <span className="absolute inset-0 rounded-full bg-[#34d399] animate-pulse" />
            </span>
            <span className="font-sans text-[8px] font-extrabold uppercase tracking-[0.04em]">Files</span>
            <span className="font-sans text-[12px] font-black text-white">{String((album?.photos?.length ?? 0)).padStart(2, "0")}</span>
          </div>

          {previewPhotos.map((photo, index) => {
            const transformMap = [
              "translateY(-70px) rotate(-10deg) translateX(-15px) translateZ(20px)",
              "translateY(-55px) rotate(8deg) translateX(18px) translateZ(10px)",
              "translateY(-40px) rotate(-15deg) translateX(-8px)",
              "translateY(-25px) rotate(12deg) translateX(12px)",
              "translateY(-10px) rotate(-5deg)",
            ];
            const backgroundClass = ["bg-[#f59e0b]", "bg-[#f97316]", "bg-[#fb7185]", "bg-[#a78bfa]", "bg-[#22c55e]"];

            return (
              <button
                key={photo.id || `${album?.eventId || "event"}-${index}`}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpen?.(album);
                }}
                className={`absolute left-[10%] z-[0] h-[85px] w-[80%] overflow-hidden rounded-[6px] border border-white/10 bg-[#0f172a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] ${isHovered ? "opacity-100" : "opacity-0"} ${backgroundClass[index] ?? backgroundClass[0]}`}
                style={{ transform: isHovered ? transformMap[index] ?? transformMap[0] : "translate(0,0) rotate(0deg)", transitionDelay: `${index * 40}ms` }}
                aria-label={`Open ${album?.eventName ?? "event"} album`}
              >
                <img src={photo.src} alt={photo.alt || album?.eventName || "Event photo"} className="h-full w-full object-cover" />
                <span className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/30" />
                <span className="absolute bottom-[10px] right-[10px] rounded-[4px] bg-black/55 px-[6px] py-[3px] text-[7px] font-bold text-white/90 backdrop-blur-sm">{index + 1}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => onOpen?.(album)}
            className={`absolute bottom-[-7px] left-0 z-[99] h-[34px] w-full rounded-b-[12px] border border-white/10 bg-transparent transition-all duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
            aria-label={`Open ${album?.eventName ?? "event"} album`}
          />
        </div>
      </div>
    );
  }

  function EventArchiveModal({ album, onClose }) {
    if (!album) return null;

    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm transition-opacity duration-300" onClick={onClose}>
        <div className="relative w-[min(95vw,900px)] max-h-[90vh] flex flex-col rounded-2xl border border-white/10 bg-[#0c0d12] shadow-[0_20px_80px_rgba(0,0,0,0.8)] transition-all duration-300" onClick={(event) => event.stopPropagation()}>
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#F5590A]">Event Album</p>
              <h3 className="mt-1 truncate text-xl font-bold text-white">{album.eventName}</h3>
            </div>
            <button type="button" onClick={onClose} className="ml-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-2xl font-semibold text-white transition hover:border-white/30 hover:bg-white/10 hover:text-[#F5590A]" aria-label="Close album view">×</button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(album.photos ?? []).map((photo) => (
                <div key={photo.id} className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image src={photo.src} alt={photo.alt || album.eventName} fill sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover transition duration-300 group-hover:scale-105" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statIcons = {
    clock: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
    grid: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
    spark: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5" aria-hidden="true">
        <path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z" />
      </svg>
    ),
    users: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  };

  // Page slide animation variants
  const modalPageVariants = {
    enter: (direction) => ({
      x: shouldReduceMotion ? 0 : direction > 0 ? 60 : -60,
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 340, damping: 32 },
        opacity: { duration: 0.28 },
        scale: { duration: 0.28 },
      },
    },
    exit: (direction) => ({
      x: shouldReduceMotion ? 0 : direction < 0 ? 60 : -60,
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 0.98,
      transition: {
        x: { type: "spring", stiffness: 340, damping: 32 },
        opacity: { duration: 0.22 },
        scale: { duration: 0.22 },
      },
    }),
  };

  // Swipe drag end handler
  const handleDragEnd = (e, { offset, velocity }) => {
    const swipeThreshold = 50;
    if (offset.x < -swipeThreshold && activeModalPage < modalPages.length - 1) {
      goToModalPage(activeModalPage + 1);
    } else if (offset.x > swipeThreshold && activeModalPage > 0) {
      goToModalPage(activeModalPage - 1);
    }
  };

  // Unboxing Headline animation variants (Snappy Graphic Novel Timing)
  const headlineWords = ["Unbox", "Our", "Work"];
  const secondaryWords = ["which", "is", "worth", "telling", "about"];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.08,
      },
    },
  };

  const secondaryContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.07,
        delayChildren: shouldReduceMotion ? 0 : 0.52,
      },
    },
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 20 : 50,
      rotateX: shouldReduceMotion ? 0 : -60,
      scale: shouldReduceMotion ? 1 : 0.85,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
      transition: {
        duration: 0.75,
        ease: [0.2, 1.25, 0.4, 1], // snappy comic action timing
      },
    },
  };

  const secondaryWordVariants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 16,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.2, 1.2, 0.4, 1],
      },
    },
  };

  const fadeUpVariant = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 22 },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.2, 1.2, 0.4, 1], delay: shouldReduceMotion ? 0 : delay },
    }),
  };

  return (
    <div className="relative">
      <section
        id="about"
        className="about-unbox-section comic-section-theme relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 py-20 text-[#F2F2F2] sm:px-8 sm:py-28 lg:py-32"
      >
        {/* Halftone Dot Texture Matrix Overlay */}
        <div className="comic-halftone-overlay pointer-events-none" aria-hidden="true" />
        <div className="comic-halftone-amber pointer-events-none" aria-hidden="true" />

        {/* Dynamic Sci-Fi Speed Lines / Action Energy Rays */}
        <div className="comic-speed-lines pointer-events-none" aria-hidden="true">
          <svg viewBox="0 0 1000 1000" className="h-full w-full opacity-40">
            <defs>
              <linearGradient id="speedGradOrange" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF8A3D" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#FF8A3D" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="speedGradAmber" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFB703" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#FFB703" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="speedGradWarm" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F5590A" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#F5590A" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M500 500 L80 120 M500 500 L920 160 M500 500 L940 840 M500 500 L60 860" stroke="url(#speedGradOrange)" strokeWidth="1.5" strokeDasharray="6 12" />
            <path d="M500 500 L240 40 M500 500 L760 50 M500 500 L980 480 M500 500 L20 520" stroke="url(#speedGradAmber)" strokeWidth="1.2" strokeDasharray="8 16" />
            <path d="M500 500 L400 960 M500 500 L620 950 M500 500 L120 340 M500 500 L880 320" stroke="url(#speedGradWarm)" strokeWidth="1.5" strokeDasharray="5 10" />
          </svg>
        </div>

        {/* Layer 1: Background Nebula Gradient Aura */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.18)_0%,rgba(168,85,247,0.12)_45%,transparent_70%)] blur-3xl sm:h-[800px] sm:w-[800px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-10 top-1/4 h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle,rgba(245,89,10,0.12)_0%,transparent_70%)] blur-3xl"
        />

        {/* Layer 2: Midground Drifting Quantum Star Points */}
        <div className="about-midground-stars pointer-events-none" aria-hidden="true">
          <span className="about-star about-star--1" />
          <span className="about-star about-star--2" />
          <span className="about-star about-star--3" />
          <span className="about-star about-star--4" />
        </div>

        {/* Layer 3: Graphic Novel Panel Framed Stage */}
        <div className="comic-panel-frame relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center rounded-3xl p-6 text-center sm:p-10 lg:p-12">
          
          {/* Comic Frame Registration Brackets */}
          <span className="comic-corner-bracket comic-corner-bracket--tl" aria-hidden="true" />
          <span className="comic-corner-bracket comic-corner-bracket--tr" aria-hidden="true" />
          <span className="comic-corner-bracket comic-corner-bracket--bl" aria-hidden="true" />
          <span className="comic-corner-bracket comic-corner-bracket--br" aria-hidden="true" />

          {/* Two-Tier Inked Graphic Novel Headline */}
          <div className="unbox-headline-block my-3 flex flex-col items-center gap-[0.18em] sm:my-4">
            {/* Primary Tier: UNBOX OUR WORK with Inked Shadow */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={containerVariants}
              style={{ perspective: "1000px" }}
              className="flex w-full flex-nowrap justify-center gap-x-2 whitespace-nowrap sm:gap-x-5"
            >
              {headlineWords.map((word) => (
                <motion.span
                  key={word}
                  variants={wordVariants}
                  className="unbox-word comic-headline-word relative inline-block transform-gpu select-none text-[clamp(1.6rem,8vw,6.5rem)] font-black uppercase leading-[0.9] tracking-[-0.04em] text-[#FFFFFF]"
                >
                  {word}
                </motion.span>
              ))}
            </motion.div>

            {/* Secondary Tier: which is worth telling about (Stylish Gradient Shimmer) */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={secondaryContainerVariants}
              className="mt-2 flex flex-wrap justify-center gap-x-[0.35em] gap-y-0 sm:mt-3"
            >
              {secondaryWords.map((word) => (
                <motion.span
                  key={word}
                  variants={secondaryWordVariants}
                  className="unbox-secondary-word inline-block transform-gpu select-none"
                >
                  {word}
                </motion.span>
              ))}
            </motion.div>
          </div>

          {/* Restrained Polish Addition: Quantum Energy Hairline Divider */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            custom={0.25}
            variants={fadeUpVariant}
            className="comic-headline-divider my-4 flex items-center justify-center gap-3 opacity-80"
            aria-hidden="true"
          >
            <span className="comic-divider-line comic-divider-line--left" />
            <span className="comic-divider-node">✦</span>
            <span className="comic-divider-line comic-divider-line--right" />
          </motion.div>

          {/* Sub-line */}
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            custom={0.35}
            variants={fadeUpVariant}
            className="mt-1 max-w-xl text-center text-base leading-relaxed text-slate-300 sm:text-lg md:text-xl"
          >
            Every project, unpacked. Where quantum ambition meets real-world execution.
          </motion.p>

          {/* Interactive 3D Hero Cube with Graphic Novel Affordances */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            custom={0.48}
            variants={fadeUpVariant}
            className="w-full flex justify-center"
          >
            <InteractiveHeroCube onOpenModal={() => setIsModalOpen(true)} />
          </motion.div>

          {/* Graphic Novel Inked CTA Button */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            custom={0.62}
            variants={fadeUpVariant}
            className="relative mt-2 flex flex-col items-center"
          >
            {/* Ambient Glow Ring */}
            <div className="unbox-cta-glow-ring pointer-events-none" aria-hidden="true" />

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="comic-cta-btn unbox-cta-btn group relative z-10 inline-flex items-center gap-3 rounded-xl px-10 py-4 text-sm font-black uppercase tracking-wider text-white shadow-[4px_4px_0px_#000,0_0_30px_rgba(6,182,212,0.4)] transition-all duration-200 hover:shadow-[6px_6px_0px_#000,0_0_45px_rgba(6,182,212,0.6)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] sm:px-12 sm:py-4.5 sm:text-base"
            >
              <span className="relative z-10 flex items-center gap-2.5">
                <span>Open the box</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1.5" aria-hidden="true">
                  →
                </span>
              </span>
              <div className="unbox-cta-sheen" />
            </button>

            <span className="mt-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300">
              Click to view team, mission &amp; interactive simulator
            </span>
          </motion.div>
        </div>

        {/* Spatial 3D Floating Multi-Panel Deck with Quantum Energy Tethers */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="about-modal-overlay fixed inset-0 z-50 flex flex-col justify-between overflow-hidden bg-black/92 p-2 sm:p-4 backdrop-blur-2xl">
              
              {/* Dimmed Backdrop Click Area */}
              <div
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-transparent to-black/80"
                aria-hidden="true"
              />

              {/* Floating close control; no modal top bar is rendered. */}
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="about-modal-close-btn absolute right-4 top-4 z-40 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-[#090912]/70 text-slate-300 backdrop-blur-md transition-all duration-200 hover:border-orange-400 hover:bg-orange-400/10 hover:text-white hover:shadow-[0_0_15px_rgba(245,89,10,0.4)] sm:right-6 sm:top-6 sm:h-9 sm:w-9"
                aria-label="Close panel"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Spatial Middle Stage: Floating Panel Row Carousel + Floating Chevrons */}
              <div className="relative my-auto flex w-full flex-1 items-center justify-center overflow-hidden py-2 sm:py-4">
                
                {/* Floating Left Chevron Button */}
                <button
                  type="button"
                  onClick={() => goToModalPage(activeModalPage - 1)}
                  disabled={activeModalPage === 0}
                  aria-label="Previous panel"
                  className={`absolute left-2 sm:left-6 z-30 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border transition-all duration-300 ${
                    activeModalPage === 0
                      ? "cursor-not-allowed opacity-0 pointer-events-none"
                      : "border-white/20 bg-[#090912]/90 text-white shadow-[0_0_20px_rgba(0,0,0,0.8),0_0_15px_rgba(245,89,10,0.3)] hover:scale-110 hover:border-[#F5590A] hover:bg-[#F5590A]/20 hover:shadow-[0_0_25px_rgba(245,89,10,0.6)]"
                  }`}
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 sm:h-6 sm:w-6">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Floating Right Chevron Button */}
                <button
                  type="button"
                  onClick={() => goToModalPage(activeModalPage + 1)}
                  disabled={activeModalPage === modalPages.length - 1}
                  aria-label="Next panel"
                  className={`absolute right-2 sm:right-6 z-30 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border transition-all duration-300 ${
                    activeModalPage === modalPages.length - 1
                      ? "cursor-not-allowed opacity-0 pointer-events-none"
                      : "border-white/20 bg-[#090912]/90 text-white shadow-[0_0_20px_rgba(0,0,0,0.8),0_0_15px_rgba(245,89,10,0.3)] hover:scale-110 hover:border-[#F5590A] hover:bg-[#F5590A]/20 hover:shadow-[0_0_25px_rgba(245,89,10,0.6)]"
                  }`}
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 sm:h-6 sm:w-6">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Spatial Track: All 3 Floating Panels in a Single Continuous Row */}
                <div className="spatial-track-viewport relative flex w-full items-center justify-center overflow-visible">
                  <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.15}
                    onDragEnd={handleDragEnd}
                    animate={{
                      transform: shouldReduceMotion
                        ? `translateX(${(1 - activeModalPage) * 100}%)`
                        : activeModalPage === 0
                        ? "translateX(calc((var(--panel-std-width) + var(--panel-members-width)) / 2 + var(--spatial-tether-width)))"
                        : activeModalPage === 1
                        ? "translateX(calc((var(--panel-members-width) - var(--panel-std-width)) / 2))"
                        : "translateX(calc(-1 * (var(--panel-std-width) + var(--spatial-tether-width))))",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 280,
                      damping: 28,
                      mass: 0.8,
                    }}
                    className="spatial-panels-row flex items-center cursor-grab active:cursor-grabbing"
                    style={{
                      "--panel-std-width": "min(86vw, 820px)",
                      "--panel-members-width": "min(94vw, 1280px)",
                      "--spatial-tether-width": "clamp(30px, 6vw, 80px)",
                    }}
                  >
                    
                    {/* ================= PANEL 1: ABOUT (100% PRESERVED CONTENT) ================= */}
                    <motion.div
                      onClick={() => activeModalPage !== 0 && goToModalPage(0)}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -14 }}
                      transition={{ duration: 0.46, ease: [0.16, 1, 0.3, 1], delay: 0.04 }}
                      className={`spatial-card-panel shrink-0 relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 bg-[#0C0C14]/98 p-5 text-left transition-all duration-400 sm:p-8 md:p-10 ${
                        activeModalPage === 0
                          ? "spatial-card-panel--active border-[#F5590A]/80 shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(245,89,10,0.3),0_0_35px_rgba(6,182,212,0.15)]"
                          : "spatial-card-panel--inactive border-white/15 shadow-2xl hover:opacity-75 hover:scale-[0.95] cursor-pointer"
                      }`}
                      style={{ width: "var(--panel-std-width)" }}
                    >
                      {/* Top Corner Registration Marks */}
                      <span className="comic-corner-bracket comic-corner-bracket--tl" aria-hidden="true" />
                      <span className="comic-corner-bracket comic-corner-bracket--tr" aria-hidden="true" />

                      <div className="custom-modal-scroll max-h-[calc(78vh-100px)] overflow-y-auto pr-1">
                        <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
                          
                          {/* Left Column: Mission & Narrative */}
                          <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                            className="space-y-5"
                          >
                            <div>
                              <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
                                className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-[#F5590A]"
                              >
                                Department of EEE, NMIT
                              </motion.span>
                              <motion.h4
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.56, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                                className="mt-1 text-2xl font-extrabold text-white sm:text-3xl"
                              >
                                Pioneering Quantum at Scale
                              </motion.h4>
                            </div>

                            <motion.p
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.26 }}
                              className="text-xs leading-relaxed text-slate-300 sm:text-sm"
                            >
                              Q-Bits is the official Quantum Technology Club of Nitte Meenakshi
                              Institute of Technology (NMIT), anchored within the Department of
                              Electrical &amp; Electronics Engineering.
                            </motion.p>

                            <motion.p
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.33 }}
                              className="text-xs leading-relaxed text-slate-300 sm:text-sm"
                            >
                              We provide resources for students from first principles in quantum computing
                              to advanced research, hackathons, and industry breakthroughs. Through
                              hands-on builds, Q-Bits bridges theory and practice alongside research leaders like QpiAI.
                            </motion.p>

                            {/* Feature Pills */}
                            <motion.div
                              initial={{ opacity: 0, y: 14 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.56, ease: [0.16, 1, 0.3, 1], delay: 0.42 }}
                              className="flex flex-wrap gap-2 pt-1"
                            />
                          </motion.div>

                          {/* Right Column: 3D Quantum Cube Interactive Scene */}
                          <div ref={cubeContainerRef} className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#08080C] p-2 shadow-2xl">
                            <div className="absolute left-3 top-3 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-2.5 py-1 font-mono text-[10px] text-slate-300 backdrop-blur-md">
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#F5590A]" />
                              <span>DARE TO CLICK</span>
                            </div>
                            <div className="h-[220px] w-full sm:h-[280px]">
                              {isCubeInView ? <QuantumCubeScene /> : <div className="h-full w-full bg-[#08080C]" />}
                            </div>
                            <div className="mt-1 text-center font-mono text-[10px] text-slate-400">
                              Drag to rotate 3D Quantum Cube in real-time
                            </div>
                          </div>
                        </div>

                        {/* Bottom Stats Grid */}
                        <div className="mt-8 grid grid-cols-2 gap-2.5 border-t border-white/10 pt-6 sm:grid-cols-4 sm:gap-3.5">
                          {stats.map((stat) => (
                            <div
                              key={stat.label}
                              className="flex flex-col items-center rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center transition-all duration-200 hover:border-orange-400/40 hover:bg-white/[0.04]"
                            >
                              <span className="text-orange-400">{statIcons[stat.icon]}</span>
                              <span className="mt-1.5 text-lg font-bold tracking-tight text-white sm:text-xl">
                                <Counter value={stat.value} suffix={stat.suffix} />
                              </span>
                              <span className="mt-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                                {stat.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>

                    {/* ================= QUANTUM ENERGY TETHER 1-2 ================= */}
                    <div
                      className="quantum-tether-container flex shrink-0 items-center justify-center px-1"
                      style={{ width: "var(--spatial-tether-width)" }}
                    >
                      <div className="relative flex w-full items-center justify-center">
                        <span className="font-mono text-[10px] text-[#F5590A] opacity-80">[✦</span>
                        <div className="quantum-tether-beam relative h-[3px] w-full bg-gradient-to-r from-[#F5590A]/50 via-[#FF8A3D]/80 to-[#F5590A]/50 shadow-[0_0_8px_#F5590A]">
                          <div className="quantum-tether-pulse" />
                        </div>
                        <span className="font-mono text-[10px] text-[#F5590A] opacity-80">✦]</span>
                      </div>
                    </div>

                    {/* ================= PANEL 2: OUR EVENTS (NEW) ================= */}
                    <div
                      id="events"
                      onClick={() => activeModalPage !== 1 && goToModalPage(1)}
                      className={`spatial-card-panel shrink-0 relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 bg-[#0C0C14]/98 p-5 text-left transition-all duration-400 sm:p-8 md:p-10 ${
                        activeModalPage === 1
                          ? "spatial-card-panel--active border-[#F5590A]/80 shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(245,89,10,0.3),0_0_35px_rgba(6,182,212,0.15)]"
                          : "spatial-card-panel--inactive border-white/15 shadow-2xl hover:opacity-75 hover:scale-[0.95] cursor-pointer"
                      }`}
                      style={{ width: "var(--panel-std-width)" }}
                    >
                      {/* Top Corner Registration Marks */}
                      <span className="comic-corner-bracket comic-corner-bracket--tl" aria-hidden="true" />
                      <span className="comic-corner-bracket comic-corner-bracket--tr" aria-hidden="true" />

                      <div className="custom-modal-scroll max-h-[calc(78vh-100px)] overflow-y-auto pr-1">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/10 pb-4 mb-6">
                          <div>
                            <span className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-[#F5590A]">
                              Events, Hackathons &amp; Labs
                            </span>
                            <h4 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">
                              Flagship &amp; Community Gatherings
                            </h4>
                          </div>
                          <div className="flex items-center gap-3 self-start sm:self-auto">
                            <span className="font-mono text-[10px] text-slate-400">
                              [Placeholder events — ready for your updates]
                            </span>
                            <div className="events-view-toggle" role="group" aria-label="Events view">
                              <button
                                type="button"
                                className={eventsView === "2d" ? "events-view-toggle__button events-view-toggle__button--active" : "events-view-toggle__button"}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setEventsView("2d");
                                }}
                              >
                                2D
                              </button>
                              <button
                                type="button"
                                className={eventsView === "3d" ? "events-view-toggle__button events-view-toggle__button--active" : "events-view-toggle__button"}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setEventsView("3d");
                                }}
                              >
                                3D
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Featured event card and archive gallery */}
                        <div className="grid gap-5">
                          {eventsData.map((ev) => (
                            <div
                              key={ev.id}
                              className="group relative rounded-2xl border border-white/10 bg-white/[0.025] p-5 backdrop-blur-md transition-all duration-250 hover:border-[#F5590A]/60 hover:bg-white/[0.05] hover:shadow-[0_0_25px_rgba(245,89,10,0.2)] sm:p-6"
                            >
                              <div className="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-start lg:gap-8">
                                <div className="flex flex-col items-start">
                                  <div className="mb-3 flex items-center justify-start gap-2">
                                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF8A3D]">
                                      Event archive // {ev.photos.length} photos
                                    </span>
                                  </div>
                                  <div className="flex justify-start">
                                    <EventArchiveFolderCard
                                      album={eventAlbums.find((album) => album.eventId === ev.id) ?? { eventId: ev.id, eventName: ev.title, photos: ev.photos }}
                                      onOpen={(album) => setSelectedEventAlbum(album)}
                                    />
                                  </div>
                                </div>

                                <div>
                                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                    <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider ${ev.badgeColor}`}>
                                      {ev.badge}
                                    </span>
                                    <span className="font-mono text-[11px] font-semibold text-slate-300">
                                      {ev.date}
                                    </span>
                                  </div>

                                  <h5 className="text-xl font-bold text-white transition-colors group-hover:text-[#F5590A] sm:text-2xl">
                                    {ev.title}
                                  </h5>
                                  <span className="mb-3 mt-1 block font-mono text-xs text-orange-300">
                                    {ev.track}
                                  </span>

                                  <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
                                    {ev.desc}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* ================= QUANTUM ENERGY TETHER 2-3 ================= */}
                    <div
                      className="quantum-tether-container flex shrink-0 items-center justify-center px-1"
                      style={{ width: "var(--spatial-tether-width)" }}
                    >
                      <div className="relative flex w-full items-center justify-center">
                        <span className="font-mono text-[10px] text-[#F5590A] opacity-80">[✦</span>
                        <div className="quantum-tether-beam relative h-[3px] w-full bg-gradient-to-r from-[#F5590A]/50 via-[#FF8A3D]/80 to-[#F5590A]/50 shadow-[0_0_8px_#F5590A]">
                          <div className="quantum-tether-pulse" />
                        </div>
                        <span className="font-mono text-[10px] text-[#F5590A] opacity-80">✦]</span>
                      </div>
                    </div>

                    {/* ================= PANEL 3: OUR MEMBERS (NEW) ================= */}
                    <div
                      onClick={() => activeModalPage !== 2 && goToModalPage(2)}
                      className={`spatial-card-panel shrink-0 relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 bg-[#0C0C14]/98 p-5 text-left transition-all duration-400 sm:p-8 md:p-10 ${
                        activeModalPage === 2
                          ? "spatial-card-panel--active border-[#F5590A]/80 shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(245,89,10,0.3),0_0_35px_rgba(6,182,212,0.15)]"
                          : "spatial-card-panel--inactive border-white/15 shadow-2xl hover:opacity-75 hover:scale-[0.95] cursor-pointer"
                      }`}
                      style={{ width: "var(--panel-members-width)" }}
                    >
                      {/* Top Corner Registration Marks */}
                      <span className="comic-corner-bracket comic-corner-bracket--tl" aria-hidden="true" />
                      <span className="comic-corner-bracket comic-corner-bracket--tr" aria-hidden="true" />

                      <div className="custom-modal-scroll max-h-[calc(84vh-70px)] overflow-y-auto pr-1">
                        <MembersSection showHeader={false} compact={true} />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Fixed Bottom Controls & Footer Action Row */}
              <div className={`about-modal-dock relative z-30 mx-auto mt-2 flex w-[calc(100%-1rem)] ${activeModalPage === 2 ? "max-w-6xl" : "max-w-5xl"} flex-col items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-[#090912]/85 px-3 py-3 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_18px_38px_rgba(0,0,0,0.55)] backdrop-blur-md sm:px-5 sm:py-3.5 transition-all duration-300`}>
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F5590A]/70 to-transparent" />
                <motion.div
                  className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-[#F5590A]/80 to-transparent"
                  initial={false}
                  animate={{ opacity: [0.6, 1, 0.8] }}
                  transition={{ duration: 2.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                />

                <div className="about-modal-dock-inner flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-between">
                  {/* Brand Logo Lockup */}
                  <div className="flex items-center shrink-0">
                    <Image
                      src="/navbar-banner.png"
                      alt="NITTE University and Q-BITS Quantum Tech Club"
                      width={180}
                      height={40}
                      priority
                      className="h-7 w-auto sm:h-8 object-contain brightness-105"
                    />
                  </div>

                  <div className="relative flex w-full max-w-xl items-center justify-center rounded-full border border-white/10 bg-white/[0.025] p-1.5">
                    <motion.div
                      className="absolute inset-y-1.5 left-1.5 rounded-full bg-gradient-to-r from-[#F5590A] via-[#FF8C42] to-[#F5590A] shadow-[0_0_18px_rgba(245,89,10,0.7)]"
                      initial={false}
                      animate={{
                        x: `${activeModalPage * 100}%`,
                        width: `${100 / modalPages.length}%`,
                      }}
                      transition={{ type: "spring", stiffness: 460, damping: 34, mass: 0.7 }}
                      style={{
                        left: "0.375rem",
                        right: "auto",
                        maxWidth: `calc((100% - 0.75rem) / ${modalPages.length})`,
                      }}
                    />
                    <div className="relative z-10 grid w-full grid-cols-3 gap-1">
                      {modalPages.map((page, idx) => (
                        <button
                          key={page.id}
                          type="button"
                          onClick={() => goToModalPage(idx)}
                          className="group relative flex items-center justify-center rounded-full px-3 py-2 text-center focus:outline-none"
                          aria-label={`Jump to ${page.title}`}
                        >
                          {activeModalPage === idx && (
                            <motion.span
                              layoutId="about-active-nav-glow"
                              className="pointer-events-none absolute inset-0 rounded-full bg-[#F5590A]/20 blur-md"
                              transition={{ type: "spring", stiffness: 420, damping: 30 }}
                            />
                          )}
                          <span className={`relative z-10 font-mono text-[10px] font-bold uppercase tracking-[0.12em] transition-all duration-300 ${
                            activeModalPage === idx ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                          }`}>
                            {page.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="about-modal-close-action rounded-xl border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[#F5590A] hover:bg-[#F5590A]/20 hover:shadow-[0_0_14px_rgba(245,89,10,0.4)] active:scale-95 active:shadow-[0_0_20px_rgba(245,89,10,0.35)] sm:px-5 sm:py-2"
                  >
                    Back to Section
                  </button>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </section>
      {eventsView === "3d" && <InfiniteCanvasView onClose={() => setEventsView("2d")} />}
      {albumPortalTarget
        ? createPortal(
            <AnimatePresence>
              {selectedEventAlbum ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-sm overflow-hidden"
                  onClick={() => setSelectedEventAlbum(null)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25 }}
                    className="relative w-[min(90vw,1100px)] max-h-[85vh] flex flex-col rounded-2xl border border-white/10 bg-[#0c0d12] shadow-[0_20px_80px_rgba(0,0,0,0.8)]"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
                      <div className="min-w-0">
                        <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#F5590A]">Event Album</p>
                        <h3 className="mt-1 truncate text-xl font-bold text-white">{selectedEventAlbum.eventName}</h3>
                      </div>
                      <button type="button" onClick={() => setSelectedEventAlbum(null)} className="ml-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-2xl font-semibold text-white transition hover:border-white/30 hover:bg-white/10 hover:text-[#F5590A]" aria-label="Close album view">×</button>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {(selectedEventAlbum.photos ?? []).map((photo) => (
                          <div key={photo.id} className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
                            <div className="relative aspect-[4/3] overflow-hidden">
                              <Image src={photo.src} alt={photo.alt || selectedEventAlbum.eventName} fill sizes="(max-width: 640px) calc(50vw - 24px), (max-width: 1024px) calc(50vw - 28px), calc(33.333vw - 32px)" className="object-cover transition duration-300 group-hover:scale-105" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            albumPortalTarget
          )
        : null}
    </div>
  );
}
