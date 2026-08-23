"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Reveal, Counter, staggerContainer, staggerItem, easeOut } from "@/components/MotionPrimitives";

const MotionImage = motion(Image);

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
        className="brochure-section stats-section relative overflow-hidden bg-[#0D0D0D] py-16 text-[#F2F2F2] sm:py-32"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -right-6 top-20 select-none font-mono text-[18vw] font-black tracking-tighter text-white/[0.015] sm:top-16 sm:text-[14vw]"
        >
          Q-BITS
        </span>

        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-1/3 h-[280px] w-[280px] -translate-y-1/4 rounded-full bg-[radial-gradient(circle,rgba(245,89,10,0.13)_0%,rgba(245,89,10,0.03)_50%,transparent_70%)] blur-3xl sm:h-[520px] sm:w-[520px]"
        />

        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.88fr] lg:gap-20">
            {/* Image first on mobile */}
            <div className="relative order-1 lg:order-2">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-3 rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(245,89,10,0.18)_0%,transparent_70%)] blur-2xl sm:-inset-4"
              />

              <div
                aria-hidden
                className="pointer-events-none absolute -left-2 -top-2 z-20 h-4 w-4 border-l-2 border-t-2 border-[#F5590A] sm:h-5 sm:w-5"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-2 -right-2 z-20 h-4 w-4 border-b-2 border-r-2 border-[#F5590A] sm:h-5 sm:w-5"
              />

              <motion.div
                initial={{ opacity: 0, scale: 1.04, y: 24 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.75, ease: easeOut }}
                whileHover={{ scale: 1.015, transition: { duration: 0.25 } }}
                className="about-image-frame relative z-10"
              >
                <div className="absolute left-3.5 top-3.5 z-20 hidden items-center gap-1.5 rounded-full border border-white/15 bg-black/60 px-2.5 py-0.5 text-[0.62rem] font-mono tracking-widest text-stone-300 backdrop-blur-md sm:flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#F5590A]" />
                  <span>LAT // 13.1295° N</span>
                </div>

                <span className="tech-crosshair right-3.5 top-3 z-20">+</span>
                <span className="tech-crosshair bottom-3 right-3.5 z-20">+</span>

                <MotionImage
                  src="/abt_theme.jpg"
                  alt="Quantum technology visual for Q-Bits"
                  width={720}
                  height={900}
                  priority
                  className="h-[260px] w-full object-cover object-[center_28%] sm:h-[540px] sm:object-center"
                />
                <span className="about-image-label">QUANT-A-MAZE 3.0</span>
              </motion.div>
            </div>

            {/* Text column */}
            <div className="order-2 lg:order-1">
              <Reveal>
                <p className="section-kicker mb-4">The people behind the signal</p>
                <h1 className="display-heading gradient-text text-3xl font-bold sm:text-5xl">
                  About Us
                </h1>
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.65, delay: 0.15, ease: easeOut }}
                  className="mb-6 mt-3.5 h-[3px] w-16 origin-left rounded-full bg-gradient-to-r from-[#F5590A] via-[#FFA94D] to-transparent sm:mb-8 sm:w-20"
                />
              </Reveal>

              <Reveal delay={0.1}>
                <div className="relative my-5 border-l-2 border-[#F5590A]/70 pl-5 sm:my-6 sm:pl-7">
                  <p className="max-w-[60ch] text-base font-normal leading-[1.75] text-slate-300 sm:text-xl sm:leading-[1.8]">
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
                </div>
              </Reveal>

              <Reveal delay={0.2}>
                <div className="mt-6 sm:mt-8">
                  <div className="mb-6 h-px w-full max-w-md bg-gradient-to-r from-[#F5590A]/30 via-white/10 to-transparent sm:mb-7" />

                  <span className="mb-3 block font-mono text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#F5590A]">
                    In partnership with
                  </span>

                  <motion.div
                    whileHover={{
                      scale: 1.025,
                      borderColor: "rgba(245,89,10,0.75)",
                      boxShadow: "0 0 25px rgba(245,89,10,0.22), 0 8px 24px rgba(0,0,0,0.5)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="about-partner-pill cursor-pointer"
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

                  <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-stone-400">
                    Bringing industry-grade mentorship in quantum computing, quantum
                    machine learning, and applied research to every participant.
                  </p>
                </div>
              </Reveal>
            </div>
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
