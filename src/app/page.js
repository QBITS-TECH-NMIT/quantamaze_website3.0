"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import LoadingScreen from "@/components/LoadingScreen";
import CountdownTimer from "@/components/CountdownTimer";
import AboutPage from "@/app/about/page";
import TracksPage from "@/app/tracks/page";
import TimelinePage from "@/app/timeline/page";
import SponsorsPage from "@/app/sponsors/page";
import FAQPage from "@/app/faq/page";
import GamesSection from "@/components/GamesSection";
import { Reveal, staggerContainer, staggerItem, easeOut } from "@/components/MotionPrimitives";
import { motion, useScroll, useTransform } from "framer-motion";

const TARGET_DATE = new Date("2026-09-07T00:00:00+05:30");

const titleReveal = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const titleCharacter = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: easeOut } },
};

const sectionReveal = {
  hidden: { opacity: 0, y: 40, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

function SectionTransition({ children }) {
  return (
    <motion.div
      variants={sectionReveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="relative"
    >
      {children}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-px bg-[#F5590A]/35" />
    </motion.div>
  );
}

export default function HomePage() {
  const [siteReady, setSiteReady] = useState(false);
  const handleLoaderComplete = useCallback(() => setSiteReady(true), []);

  useEffect(() => {
    const readyTimer = window.setTimeout(() => {
      if (
        window.sessionStorage.getItem("qam_loader_seen") === "true" ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        window.innerWidth < 380
      ) {
        setSiteReady(true);
      }
    }, 0);
    return () => window.clearTimeout(readyTimer);
  }, []);

  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const heroTextOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const heroTextScale = useTransform(scrollYProgress, [0, 0.35], [1, 0.96]);
  const { scrollYProgress: pageProgress } = useScroll();

  return (
    <div className="relative min-h-screen">
      {/* Session-gated Powering Core loading screen */}
      <LoadingScreen onComplete={handleLoaderComplete} />

      <motion.div
        aria-hidden="true"
        style={{ scaleX: pageProgress, transformOrigin: "0% 50%" }}
        className="fixed left-0 right-0 top-0 z-[60] h-0.5 bg-[#F5590A] shadow-[0_0_12px_rgba(245,89,10,0.8)]"
      />

      <main
        aria-hidden={!siteReady}
        className={`transition-[opacity,filter] duration-700 ${
          siteReady ? "hero-powered opacity-100" : "pointer-events-none select-none opacity-0"
        }`}
      >
        <SectionTransition>
          <section
            ref={sectionRef}
            id="home"
            className="brochure-section home-hero relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-transparent px-5 pt-28 pb-28 text-[#F2F2F2] sm:min-h-screen sm:px-6 sm:pt-32 sm:pb-24"
          >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.18),rgba(10,10,10,0.44)_62%,rgba(10,10,10,0.68))]"
          />
          <div aria-hidden className="pointer-events-none absolute inset-0 quantum-grid opacity-[0.035]" />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(0,0,0,0.3)_100%)]" />

          {/* Content column */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="relative z-10 flex w-full flex-col items-center text-center"
          >
            <motion.div
              variants={staggerItem}
              className="hero-collab-section"
              aria-label="Collaboration: Q-BITS and QpiAI"
            >
              <div className="hero-collab-panel">
                {/* Brand 1: Q-BITS */}
                <div className="hero-collab-brand hero-collab-brand--qbits">
                  <div className="hero-collab-logo-chip hero-collab-logo-chip--qbits">
                    <Image
                      src="/logo.png"
                      alt="Q-BITS Quantum Tech Club logo"
                      width={360}
                      height={100}
                      priority
                      className="hero-collab-img hero-collab-img--qbits"
                    />
                  </div>
                </div>

                {/* Stylish Collaboration Cross */}
                <div className="hero-collab-cross-wrap" aria-hidden="true">
                  <span className="hero-collab-cross-glow" />
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    className="hero-collab-cross-icon"
                  >
                    <path
                      d="M5.5 5.5L14.5 14.5M14.5 5.5L5.5 14.5"
                      stroke="url(#collabCrossGrad)"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="collabCrossGrad" x1="5.5" y1="5.5" x2="14.5" y2="14.5" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FF8A3D" />
                        <stop offset="0.5" stopColor="#FFFFFF" />
                        <stop offset="1" stopColor="#FFB703" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Brand 2: QpiAI */}
                <div className="hero-collab-brand hero-collab-brand--qpiai">
                  <div className="hero-collab-logo-chip hero-collab-logo-chip--qpiai">
                    <Image
                      src="/qpi-logo.avif"
                      alt="QpiAI logo"
                      width={360}
                      height={100}
                      priority
                      className="hero-collab-img hero-collab-img--qpiai"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* "Presents" Accent (Beat 2 in reveal) */}
            <motion.div
              variants={staggerItem}
              className="hero-presents-wrapper"
              aria-label="Presents"
            >
              <span className="hero-presents-line hero-presents-line--left" aria-hidden="true" />
              <span className="hero-presents-text">PRESENTS</span>
              <span className="hero-presents-line hero-presents-line--right" aria-hidden="true" />
            </motion.div>

            {/* Layered Title Treatment: "3.0" Background Layer + "QUANT-A-MAZE" Foreground */}
            <motion.div
              variants={staggerItem}
              className="relative my-5 flex min-h-[11rem] w-full max-w-[min(100%,22rem)] flex-col items-center justify-center select-none sm:my-8 sm:min-h-[15rem] sm:max-w-none lg:min-h-[17rem]"
            >
              {/* Layer 1: "3.0" Graphic Backdrop Element */}
              <motion.span
                initial={{ opacity: 1, scale: 1 }}
                animate={{
                  opacity: [0.88, 1, 0.88],
                  scale: [1, 1.005, 1],
                }}
                transition={{
                  opacity: { duration: 8, repeat: Infinity, ease: "easeInOut" },
                  scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
                }}
                aria-hidden="true"
                className="hero-backdrop-version pointer-events-none absolute left-1/2 top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2 select-none text-center font-black leading-none tracking-tighter"
                style={{
                  maskImage: "radial-gradient(ellipse at center, black 70%, transparent 100%)",
                  WebkitMaskImage: "radial-gradient(ellipse at center, black 70%, transparent 100%)",
                }}
              >
                <svg viewBox="0 0 1000 360" preserveAspectRatio="xMidYMid meet" className="hero-backdrop-version__svg" aria-hidden="true">
                  <defs>
                    <linearGradient id="heroWatermarkStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffb703" />
                      <stop offset="48%" stopColor="#f5590a" />
                      <stop offset="100%" stopColor="#f43f5e" />
                    </linearGradient>
                  </defs>
                  <text
                    x="500"
                    y="294"
                    textAnchor="middle"
                    fontFamily="var(--font-geist-sans), sans-serif"
                    fontSize="380"
                    fontWeight="900"
                    letterSpacing="-14"
                    fill="#180f0c"
                    fillOpacity="0.96"
                    stroke="url(#heroWatermarkStroke)"
                    strokeWidth="8"
                    paintOrder="stroke fill"
                  >
                    3.0
                  </text>
                </svg>
              </motion.span>

              {/* Layer 2: "QUANT-A-MAZE" Foreground Heading */}
              <motion.h1
                variants={titleReveal}
                className="relative z-10 flex w-full cursor-default justify-center text-center text-[clamp(3rem,12vw,4.75rem)] font-black uppercase leading-[0.9] tracking-[-0.055em] sm:text-7xl md:text-8xl lg:text-9xl"
                style={{
                  color: "#F5590A",
                  textShadow:
                    "0 0 40px rgba(245, 89, 10, 0.3), 0 0 40px rgba(0, 0, 0, 0.95), 0 4px 20px rgba(0, 0, 0, 0.95)",
                }}
              >
                <span className="sr-only">QUANT-A-MAZE 3.0</span>
                <span aria-hidden="true" className="flex">
                  {Array.from("QUANT-A-MAZE").map((character, index) => (
                    <motion.span key={`${character}-${index}`} variants={titleCharacter}>
                      {character}
                    </motion.span>
                  ))}
                </span>
              </motion.h1>

            </motion.div>

            <motion.p
              variants={staggerItem}
              className="my-6 max-w-[18rem] text-center text-lg font-semibold leading-snug text-gray-100 sm:my-8 sm:max-w-none sm:text-3xl"
            >
              A 36-Hour National-Level Hackathon
            </motion.p>

            {/* 07 // SEPTEMBER + venue */}
            <motion.div
              variants={staggerItem}
              style={{ opacity: heroTextOpacity, scale: heroTextScale }}
              className="flex flex-col items-center rounded-2xl border border-[#F5590A]/20 bg-white/[0.02] px-6 py-5 shadow-[0_0_35px_rgba(245,89,10,0.08)] backdrop-blur-sm sm:px-8 sm:py-6"
            >
              <p className="text-center font-mono text-2xl font-bold tracking-wider text-[#F5590A] drop-shadow-[0_0_20px_rgba(255,107,26,0.25)] sm:text-4xl md:text-5xl">
                07 <span className="text-[#F5590A]/50">{"//"}</span> SEPTEMBER
              </p>
              <p className="mt-2 flex max-w-[18rem] items-center justify-center gap-2 text-center text-sm leading-relaxed text-gray-300 sm:max-w-none sm:text-base">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[#F5590A]" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" /><circle cx="12" cy="10" r="2.2" /></svg>
                Nitte (Deemed to be University)
              </p>
            </motion.div>

            {/* Countdown timer */}
            <motion.div
              variants={staggerItem}
              className="mt-8 w-full max-w-[900px] sm:mt-10"
            >
              <CountdownTimer
                targetDate={TARGET_DATE}
                label="Launching In"
                accentColor="#f5590a"
              />
            </motion.div>

            {/* Register CTA linking to the global contact footer */}
            <motion.div variants={staggerItem} className="relative z-20 mt-8 mb-2 sm:mt-10 sm:mb-4">
              <Link
                href="#footer"
                className="group relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-3 rounded-sm bg-[#F5590A] px-7 py-3.5 text-sm font-bold text-[#0A0A0A] transition-all hover:bg-[#ff7b3f] hover:shadow-[0_0_30px_rgba(245,89,10,0.45)] active:scale-[0.97] sm:px-8 sm:py-4"
              >
                <span>Register Now</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">
                  →
                </span>
              </Link>
            </motion.div>
          </motion.div>
          </section>
        </SectionTransition>

        <SectionTransition><AboutPage /></SectionTransition>
        <SectionTransition><TracksPage /></SectionTransition>
        <SectionTransition><GamesSection /></SectionTransition>
        <SectionTransition><TimelinePage /></SectionTransition>
        <SectionTransition><SponsorsPage /></SectionTransition>
        <SectionTransition><FAQPage /></SectionTransition>

      </main>
    </div>
  );
}
