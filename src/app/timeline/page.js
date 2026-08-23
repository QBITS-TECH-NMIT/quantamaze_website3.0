"use client";

import { useRef } from "react";
import { motion, useScroll } from "framer-motion";
import { Reveal, easeOut } from "@/components/MotionPrimitives";

export default function TimelinePage() {
  const events = [
    { stage: "STAGE 01", title: "Registration", date: "September 7 – 28", active: true },
    { stage: "STAGE 02", title: "Phase 1", date: "September 7 – 28", active: false },
    { stage: "STAGE 03", title: "Phase 1 Results", date: "October 3", active: false },
    { stage: "STAGE 04", title: "Phase 2", date: "October 28 – 30", active: false },
    { stage: "STAGE 05", title: "Final Results", date: "October 30", active: false },
  ];

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "end 0.65"],
  });

  return (
    <div className="relative min-h-screen pt-20 sm:pt-24">
      <section
        id="timeline"
        className="brochure-section timeline-section relative min-h-screen overflow-hidden bg-[#0D0D0D] py-16 text-[#F2F2F2] sm:py-32"
      >
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <p className="section-kicker mb-4">From first commit to final result</p>
            <h1 className="display-heading gradient-text mb-10 text-left text-3xl font-bold sm:mb-24 sm:text-5xl">
              Timeline
            </h1>
          </Reveal>

          <div ref={containerRef} className="relative pl-1 sm:pl-0">
            <div
              aria-hidden
              className="timeline-line absolute bottom-10 left-[1.125rem] top-10 w-[2px] -translate-x-1/2 sm:bottom-12 sm:left-1/2 sm:top-12"
            />

            <motion.div
              style={{ scaleY: scrollYProgress, transformOrigin: "top" }}
              aria-hidden
              className="timeline-progress absolute bottom-10 left-[1.125rem] top-10 w-[2px] -translate-x-1/2 sm:bottom-12 sm:left-1/2 sm:top-12"
            />

            <div className="space-y-8 sm:space-y-16">
              {events.map((event, i) => {
                const isEven = i % 2 === 0;
                return (
                  <div
                    key={event.title}
                    className="relative flex items-center sm:grid sm:grid-cols-[1fr_48px_1fr] sm:items-center sm:gap-6"
                  >
                    {/* Left Column (Desktop: Even items) */}
                    <div className="hidden sm:flex sm:justify-end">
                      {isEven && (
                        <motion.div
                          initial={{ opacity: 0, x: -36 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true, amount: 0.3 }}
                          transition={{ duration: 0.55, delay: i * 0.06, ease: easeOut }}
                          whileHover={{
                            y: -3,
                            borderColor: "rgba(245,89,10,0.6)",
                            boxShadow:
                              "0 12px 36px rgba(0,0,0,0.45), 0 0 24px rgba(245,89,10,0.15)",
                            transition: { duration: 0.2 },
                          }}
                          className={`timeline-card timeline-card-mobile text-right ${
                            event.active
                              ? "border-[#F5590A]/50 bg-[#F5590A]/[0.06] shadow-[0_0_28px_rgba(245,89,10,0.15)]"
                              : ""
                          }`}
                        >
                          <div className="flex items-center justify-end gap-2">
                            {event.active && (
                              <span className="inline-flex items-center rounded-full bg-[#F5590A]/20 px-2 py-0.5 text-[0.6rem] font-bold tracking-wider text-[#FFA94D] uppercase">
                                Active
                              </span>
                            )}
                            <span className="timeline-card-stage">{event.stage}</span>
                          </div>
                          <h3 className="mt-1.5 text-xl font-bold tracking-tight text-[#F2F2F2] sm:text-2xl">
                            {event.title}
                          </h3>
                          <div className="mt-3.5 flex items-center justify-end gap-2 text-sm font-semibold tracking-wide text-[#F5590A]">
                            <span>{event.date}</span>
                            <svg
                              className="h-4 w-4 shrink-0 opacity-85"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                              <line x1="16" x2="16" y1="2" y2="6" />
                              <line x1="8" x2="8" y1="2" y2="6" />
                              <line x1="3" x2="21" y1="10" y2="10" />
                            </svg>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Center Node / Dot */}
                    <div className="absolute left-[1.125rem] z-10 flex -translate-x-1/2 items-center justify-center sm:static sm:left-auto sm:translate-x-0">
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{
                          delay: i * 0.06 + 0.1,
                          type: "spring",
                          stiffness: 380,
                          damping: 18,
                        }}
                        className="relative flex items-center justify-center"
                      >
                        {event.active && (
                          <motion.div
                            animate={{ scale: [1, 1.85, 1], opacity: [0.7, 0, 0.7] }}
                            transition={{
                              duration: 2.2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            className="pointer-events-none absolute h-9 w-9 rounded-full border border-[#F5590A] bg-[#F5590A]/20"
                          />
                        )}
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full border bg-[#0D0D0D] transition-colors ${
                            event.active
                              ? "border-[#F5590A] shadow-[0_0_16px_rgba(245,89,10,0.8)]"
                              : "border-white/20 hover:border-[#F5590A]/70 shadow-[0_0_10px_rgba(0,0,0,0.6)]"
                          }`}
                        >
                          <div
                            className={`h-2.5 w-2.5 rounded-full ${
                              event.active
                                ? "bg-[#FFA94D] shadow-[0_0_8px_#FFA94D]"
                                : "bg-[#F5590A]"
                            }`}
                          />
                        </div>
                      </motion.div>
                    </div>

                    {/* Right Column (Desktop: Odd items; Mobile: All items) */}
                    <div className="w-full pl-[3.25rem] sm:pl-0 sm:flex sm:justify-start">
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.55, delay: i * 0.06, ease: easeOut }}
                        whileHover={{
                          y: -3,
                          borderColor: "rgba(245,89,10,0.6)",
                          boxShadow:
                            "0 12px 36px rgba(0,0,0,0.45), 0 0 24px rgba(245,89,10,0.15)",
                          transition: { duration: 0.2 },
                        }}
                        className={`timeline-card timeline-card-mobile ${isEven ? "sm:hidden" : ""} ${
                          event.active
                            ? "border-[#F5590A]/50 bg-[#F5590A]/[0.06] shadow-[0_0_28px_rgba(245,89,10,0.15)]"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="timeline-card-stage">{event.stage}</span>
                          {event.active && (
                            <span className="inline-flex items-center rounded-full bg-[#F5590A]/20 px-2 py-0.5 text-[0.6rem] font-bold tracking-wider text-[#FFA94D] uppercase">
                              Active
                            </span>
                          )}
                        </div>
                        <h3 className="mt-1.5 text-xl font-bold tracking-tight text-[#F2F2F2] sm:text-2xl">
                          {event.title}
                        </h3>
                        <div className="mt-3.5 flex items-center gap-2 text-sm font-semibold tracking-wide text-[#F5590A]">
                          <svg
                            className="h-4 w-4 shrink-0 opacity-85"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                            <line x1="16" x2="16" y1="2" y2="6" />
                            <line x1="8" x2="8" y1="2" y2="6" />
                            <line x1="3" x2="21" y1="10" y2="10" />
                          </svg>
                          <span>{event.date}</span>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
