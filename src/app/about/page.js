"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Counter, staggerContainer, staggerItem } from "@/components/MotionPrimitives";

const MotionImage = motion(Image);

const aboutReveal = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.12 },
  },
};

const aboutRevealItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function AboutPage() {
  const stats = [
    { value: 36, suffix: " Hours", label: "Event Duration", icon: "clock" },
    { value: 4, suffix: " Tracks", label: "Build Pathways", icon: "grid" },
    { value: 3, suffix: ".0", label: "Current Edition", icon: "spark" },
    { value: 1, suffix: " Partner", label: "Research Partner", icon: "briefcase" },
  ];

  const statIcons = {
    clock: <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2" /></svg>,
    grid:  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></svg>,
    spark: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 1.5 6.5L20 11l-6.5 1.5L12 19l-1.5-6.5L4 11l6.5-1.5L12 3Z" /></svg>,
    briefcase: <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="7.5" width="17" height="12.5" rx="2" /><path d="M8.5 7.5V5.8a1.8 1.8 0 0 1 1.8-1.8h3.4a1.8 1.8 0 0 1 1.8 1.8v1.7M3.5 12.5h17M10 12.5v2h4v-2" /></svg>,
  };

  return (
    <div className="relative min-h-screen pt-20 sm:pt-24">
      <section
        id="about"
        className="stats-section relative mx-auto w-full max-w-7xl overflow-hidden bg-[#0D0D0D] px-6 py-16 text-[#F2F2F2] sm:py-24 md:px-12 lg:px-20 lg:py-32"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute right-6 top-8 select-none font-mono text-[18vw] font-black tracking-tighter text-white/[0.015] sm:right-12 sm:top-8 sm:text-[14vw] lg:right-20"
        >
          Q-BITS
        </span>

        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-1/3 h-[280px] w-[280px] -translate-y-1/4 rounded-full bg-[radial-gradient(circle,rgba(245,89,10,0.13)_0%,rgba(245,89,10,0.03)_50%,transparent_70%)] blur-3xl sm:h-[520px] sm:w-[520px]"
        />

        <div className="relative z-10">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:items-center lg:gap-20">
            <motion.div
              variants={aboutReveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              className="order-1 space-y-6 lg:space-y-8"
            >
              <motion.div variants={aboutRevealItem} className="space-y-5">
                <p className="section-kicker text-xs font-semibold text-[#F5590A] sm:text-sm">
                  The people behind the signal
                </p>
                <h2 className="display-heading gradient-text text-4xl font-extrabold leading-[0.95] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                  About Us
                </h2>
              </motion.div>

              <motion.div variants={aboutRevealItem} className="border-l-2 border-[#F5590A]/70 pl-5 sm:pl-7">
                <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                    Q-Bits is the official Quantum Technology Club of Nitte Meenakshi
                    Institute of Technology (NMIT), anchored within the Department of
                    Electrical &amp; Electronics Engineering. We provide resources for
                    students who are just beginning to explore quantum computing, all
                    the way to advanced learners pursuing projects, internships, and
                    research. Through hands-on learning and real-world applications,
                    Q-Bits bridges the gap between theory and practice — hosting
                    hackathons, workshops, expert talks, and industry collaborations
                    throughout the year.
                </p>
              </motion.div>

              <motion.div variants={aboutRevealItem} className="mt-10 border-t border-white/10 pt-8">
                <span className="mb-4 block font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#F5590A]">
                    In partnership with
                </span>

                <motion.div
                  whileHover={{ scale: 1.025 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 transition-all duration-300 hover:border-[#F5590A]/50 hover:bg-white/10"
                >
                    <span aria-hidden className="about-partner-logo-dot">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m12 3 1.5 6.5L20 11l-6.5 1.5L12 19l-1.5-6.5L4 11l6.5-1.5L12 3Z" />
                      </svg>
                    </span>
                    <span className="text-sm font-semibold tracking-tight text-[#F2F2F2]">
                      KwantumG Research Labs
                    </span>
                </motion.div>

                <p className="mt-4 max-w-xl text-sm leading-relaxed text-stone-400">
                    Bringing industry-grade mentorship in quantum computing, quantum
                    machine learning, and applied research to every participant.
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              whileHover={{ scale: 1.015 }}
              className="group relative order-2 transition-shadow duration-400"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-3 rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(245,89,10,0.18)_0%,transparent_70%)] blur-2xl sm:-inset-4"
              />
              <div className="relative z-10 overflow-hidden rounded-2xl bg-[#0D0D0D] ring-1 ring-[#F5590A]/30 shadow-[0_0_60px_-15px_rgba(255,107,26,0.4)] transition-shadow duration-400 group-hover:shadow-[0_0_70px_-10px_rgba(255,107,26,0.6)]">
                <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 font-mono text-[10px] text-slate-300 backdrop-blur-md sm:text-xs">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#F5590A]" />
                  <span>LAT // 13.1295° N</span>
                </div>
                <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <MotionImage
                  src="/abt_theme.jpg"
                  alt="Quantum technology visual for Q-Bits"
                  width={720}
                  height={900}
                  priority
                  className="h-[300px] w-full object-cover object-[center_28%] sm:h-[540px] sm:object-center"
                />
                <span className="absolute bottom-4 left-4 z-20 rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 font-mono text-[10px] tracking-wider text-slate-200 backdrop-blur-md sm:text-xs">
                  QUANT-A-MAZE 3.0
                </span>
              </div>
            </motion.div>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="mt-14 grid grid-cols-2 gap-3 sm:mt-20 sm:gap-4 lg:grid-cols-4"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={staggerItem}
                whileHover={{
                  y: -5,
                  borderColor: "rgba(245,89,10,0.65)",
                  background:
                    "linear-gradient(145deg, rgba(245,89,10,0.14), rgba(242,242,242,0.035))",
                  transition: { duration: 0.2 },
                }}
                className="about-stat-card"
              >
                <span className="about-stat-icon">{statIcons[stat.icon]}</span>
                <span className="mt-4 text-2xl font-bold tracking-[-0.04em] text-[#F2F2F2] sm:mt-5 sm:text-4xl">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </span>
                <span className="mt-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#F5590A] sm:text-[0.68rem] sm:tracking-[0.18em]">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
