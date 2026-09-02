"use client";

import { useRef } from "react";
import { motion, useScroll } from "framer-motion";
import { Reveal, easeOut } from "@/components/MotionPrimitives";

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function TimelineCard({ event, isEven, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: isEven ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className={`timeline-card w-full rounded-2xl border bg-white/[0.03] p-5 backdrop-blur-sm transition-all duration-300 hover:border-[#F5590A]/30 hover:bg-white/[0.05] md:p-8 ${
        event.active
          ? "border-[#F5590A]/40 shadow-[0_0_40px_-10px_rgba(255,107,26,0.3)]"
          : "border-white/10"
      } ${isEven ? "md:text-right" : ""}`}
    >
      <div className={`flex items-center gap-3 ${isEven ? "md:justify-end" : ""}`}>
        <span className="font-mono text-xs uppercase tracking-[0.15em] text-gray-500">
          {event.stage}
        </span>
        {event.active && (
          <span className="inline-flex items-center gap-2 rounded-full border border-[#F5590A]/30 bg-[#F5590A]/15 px-3 py-1 text-xs font-semibold tracking-wide text-[#FFA94D]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#F5590A] shadow-[0_0_8px_#F5590A]" />
            Active
          </span>
        )}
      </div>
      <h3 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
        {event.title}
      </h3>
      <div className={`mt-5 flex items-center gap-2 text-sm font-semibold text-[#FFA94D] ${isEven ? "md:justify-end" : ""}`}>
        <CalendarIcon />
        <span>{event.date}</span>
      </div>
    </motion.div>
  );
}

export default function TimelinePage() {
  const events = [
    { stage: "STAGE 01", title: "Registration Starts", date: "September 7", active: true },
    { stage: "STAGE 02", title: "Phase 1 (PPT Submission)", date: "September 7 – 28", active: false },
    { stage: "STAGE 03", title: "Phase 1 Results", date: "October 3", active: false },
    { stage: "STAGE 04", title: "Phase 2 (@NMIT)", date: "October 28 – 30", active: false },
    { stage: "STAGE 05", title: "Final Results", date: "October 30", active: false },
  ];

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "end 0.65"],
  });

  return (
    <div className="relative">
      <section
        id="timeline"
        className="timeline-section relative min-h-screen overflow-hidden bg-[#0D0D0D] px-6 py-16 text-[#F2F2F2] sm:py-24 md:px-12 lg:px-20 lg:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <p className="section-kicker mb-5 text-xs font-semibold tracking-[0.2em] text-[#F5590A] sm:text-sm">
              From first commit to final result
            </p>
            <h1 className="display-heading gradient-text mb-16 text-left text-5xl font-extrabold tracking-tight md:mb-20 md:text-6xl">
              Timeline
            </h1>
          </Reveal>

          <div ref={containerRef} className="relative">
            <div aria-hidden className="timeline-line absolute bottom-6 left-4 top-6 w-0.5 -translate-x-1/2 md:left-1/2" />
            <motion.div
              style={{ scaleY: scrollYProgress, transformOrigin: "top" }}
              aria-hidden
              className="timeline-progress absolute bottom-6 left-4 top-6 z-[1] w-0.5 -translate-x-1/2 md:left-1/2"
            />

            <ol className="space-y-16 md:space-y-20">
              {events.map((event, index) => {
                const isEven = index % 2 === 0;
                return (
                  <li key={event.title} className="relative grid grid-cols-[2rem_minmax(0,1fr)] items-center md:grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)] md:gap-6">
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.45, delay: index * 0.08, ease: "easeOut" }}
                      style={{ gridRow: 1 }}
                      className="relative z-10 col-start-1 row-start-1 flex self-center items-center justify-center md:col-start-2"
                    >
                      {event.active && (
                        <motion.span
                          animate={{ scale: [1, 1.7, 1], opacity: [0.7, 0, 0.7] }}
                          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                          className="pointer-events-none absolute h-10 w-10 rounded-full border border-[#F5590A]/70"
                        />
                      )}
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full border bg-[#0D0D0D] md:h-7 md:w-7 ${event.active ? "border-[#F5590A] shadow-[0_0_18px_rgba(245,89,10,0.85)]" : "border-white/25 ring-2 ring-[#F5590A]/10"}`}>
                        <span className={`h-2 w-2 rounded-full ${event.active ? "bg-[#FFA94D] shadow-[0_0_8px_#FFA94D]" : "bg-[#F5590A]/70"}`} />
                      </span>
                    </motion.div>

                    <div style={{ gridRow: 1 }} className={`col-start-2 row-start-1 min-w-0 self-center ${isEven ? "md:col-start-1" : "md:col-start-3"}`}>
                      <TimelineCard event={event} isEven={isEven} index={index} />
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}
