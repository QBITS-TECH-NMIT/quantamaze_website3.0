"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import LoadingScreen from "@/components/LoadingScreen";
import CountdownTimer from "@/components/CountdownTimer";
import { Reveal, staggerContainer, staggerItem, easeOut } from "@/components/MotionPrimitives";
import { motion, useScroll, useTransform } from "framer-motion";

const TARGET_DATE = new Date("2026-10-28T00:00:00+05:30");

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

  const bgParallaxY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const heroTextOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const heroTextScale = useTransform(scrollYProgress, [0, 0.35], [1, 0.96]);

  return (
    <div className="relative min-h-screen">
      {/* Session-gated Powering Core loading screen */}
      <LoadingScreen onComplete={handleLoaderComplete} />

      <main
        aria-hidden={!siteReady}
        className={`transition-[opacity,filter] duration-700 ${
          siteReady ? "hero-powered opacity-100" : "pointer-events-none select-none opacity-0"
        }`}
      >
        <section
          ref={sectionRef}
          id="home"
          className="brochure-section relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-[#0A0A0A] px-5 pt-28 pb-28 text-[#F2F2F2] sm:min-h-screen sm:px-6 sm:pt-32 sm:pb-24"
        >
          {/* Background: parallax video + gradient overlay */}
          <motion.video
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.4 }}
            transition={{ duration: 2.2, ease: easeOut }}
            style={{ y: bgParallaxY }}
            autoPlay
            loop
            muted
            playsInline
            className="pointer-events-none absolute inset-0 h-full w-full object-cover grayscale contrast-125 opacity-35"
          >
            <source src="/fire-bg.mp4" type="video/mp4" />
          </motion.video>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.48),rgba(10,10,10,0.82)_62%,#0A0A0A)]"
          />

          {/* Content column */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="relative z-10 flex w-full flex-col items-center text-center"
          >
            {/* Technical HUD metadata pill */}
            <motion.div
              variants={staggerItem}
              className="hero-edition-pill mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] font-mono text-stone-400 backdrop-blur-md sm:mb-5 sm:gap-2.5"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#F5590A] animate-pulse" />
              <span>EDITION // 3.0</span>
              <span className="text-white/20">|</span>
              <span className="text-center sm:text-left">NMIT_BANGALORE</span>
            </motion.div>

            {/* Layered Title Treatment: "3.0" Background Layer + "QUANT-A-MAZE" Foreground */}
            <motion.div
              variants={staggerItem}
              className="relative my-4 flex w-full max-w-[min(100%,22rem)] flex-col items-center justify-center select-none sm:my-10 sm:max-w-none"
            >
              {/* Layer 1: "3.0" Graphic Backdrop Element */}
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: [0.42, 0.54, 0.42],
                  scale: [1, 1.012, 1],
                }}
                transition={{
                  opacity: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
                  scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                }}
                aria-hidden="true"
                className="hero-backdrop-version pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 select-none text-center font-sans font-black leading-none tracking-tighter"
                style={{
                  color: "rgba(245, 89, 10, 0.22)",
                  filter:
                    "drop-shadow(0 0 18px rgba(245, 89, 10, 0.65)) drop-shadow(0 0 40px rgba(245, 89, 10, 0.35))",
                }}
              >
                3.0
              </motion.span>

              {/* Layer 2: "QUANT-A-MAZE" Foreground Heading */}
              <h1
                className="relative z-10 cursor-default text-center text-[clamp(1.85rem,9.5vw,2.75rem)] font-black uppercase leading-[0.95] tracking-[-0.05em] sm:text-7xl md:text-8xl lg:text-9xl"
                style={{
                  color: "#F5590A",
                  textShadow:
                    "0 0 40px rgba(0, 0, 0, 0.95), 0 4px 20px rgba(0, 0, 0, 0.95), 0 0 10px rgba(0, 0, 0, 0.9)",
                }}
              >
                <span className="sr-only">QUANT-A-MAZE 3.0</span>
                <span aria-hidden="true">QUANT-A-MAZE</span>
              </h1>

              {/* Layer 3: Clean, Independent Horizontal Underline Accent Line */}
              <div
                className="relative z-10 mt-4 shrink-0 sm:mt-6"
                style={{
                  width: "56px",
                  height: "3px",
                  background:
                    "linear-gradient(90deg, transparent, #F5590A 20%, #FFA94D 50%, #F5590A 80%, transparent)",
                  borderRadius: "9999px",
                  boxShadow: "0 0 14px rgba(245, 89, 10, 0.8)",
                }}
              />
            </motion.div>

            <motion.p
              variants={staggerItem}
              className="mt-5 max-w-[18rem] text-center text-lg font-medium leading-snug text-[#eeece6] sm:mt-6 sm:max-w-none sm:text-3xl"
            >
              A 36-Hour National-Level Hackathon
            </motion.p>

            <motion.p
              variants={staggerItem}
              className="mt-2.5 text-center text-sm leading-relaxed text-stone-400 sm:mt-3 sm:text-xl"
            >
              Something exciting is coming...
            </motion.p>

            {/* OCT 28 + venue */}
            <motion.div
              variants={staggerItem}
              style={{ opacity: heroTextOpacity, scale: heroTextScale }}
              className="flex flex-col items-center px-1"
            >
              <p className="mt-5 text-center text-2xl font-semibold tracking-[0.14em] text-[#F5590A] sm:mt-6 sm:text-5xl sm:tracking-[0.18em]">
                OCT 28
              </p>
              <p className="mt-1.5 max-w-[18rem] text-center text-sm leading-relaxed text-stone-300 sm:max-w-none sm:text-lg">
                Nitte Meenakshi Institute of Technology, Bangalore
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
                href="/contact"
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
      </main>
    </div>
  );
}
