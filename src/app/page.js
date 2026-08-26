"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import LoadingScreen from "@/components/LoadingScreen";
import CountdownTimer from "@/components/CountdownTimer";
import AboutPage from "@/app/about/page";
import TracksPage from "@/app/tracks/page";
import TimelinePage from "@/app/timeline/page";
import SponsorsPage from "@/app/sponsors/page";
import ContactPage from "@/app/contact/page";
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
            {/* Layered Title Treatment: "3.0" Background Layer + "QUANT-A-MAZE" Foreground */}
            <motion.div
              variants={staggerItem}
              className="relative my-5 flex min-h-[11rem] w-full max-w-[min(100%,22rem)] flex-col items-center justify-center select-none sm:my-8 sm:min-h-[15rem] sm:max-w-none lg:min-h-[17rem]"
            >
              {/* Layer 1: "3.0" Graphic Backdrop Element */}
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: [0.78, 1, 0.78],
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  opacity: { duration: 8, repeat: Infinity, ease: "easeInOut" },
                  scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
                }}
                aria-hidden="true"
                className="hero-backdrop-version pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 select-none text-center font-sans font-black leading-none tracking-tighter"
                style={{
                  color: "rgba(245, 89, 10, 0.22)",
                  filter:
                    "drop-shadow(0 0 28px rgba(245, 89, 10, 0.36))",
                  maskImage: "radial-gradient(ellipse at center, black 45%, transparent 92%)",
                  WebkitMaskImage: "radial-gradient(ellipse at center, black 45%, transparent 92%)",
                }}
              >
                3.0
              </motion.span>

              {/* Layer 2: "QUANT-A-MAZE" Foreground Heading */}
              <motion.h1
                variants={titleReveal}
                className="relative z-10 flex cursor-default text-center text-[clamp(3rem,12vw,4.75rem)] font-black uppercase leading-[0.9] tracking-[-0.055em] sm:text-7xl md:text-8xl lg:text-9xl"
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

            {/* Register CTA linking to /contact route */}
            <motion.div variants={staggerItem} className="relative z-20 mt-8 mb-2 sm:mt-10 sm:mb-4">
              <Link
                href="#contact"
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
        <SectionTransition><TimelinePage /></SectionTransition>
        <SectionTransition><SponsorsPage /></SectionTransition>
        <SectionTransition><ContactPage /></SectionTransition>

      </main>
    </div>
  );
}
