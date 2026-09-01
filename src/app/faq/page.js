"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, staggerContainer, staggerItem, easeOut } from "@/components/MotionPrimitives";

export default function FAQPage() {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const faqs = [
    {
      question: "What is Quant-A-Maze 3.0?",
      answer:
        "Quant-A-Maze 3.0 is a 36-hour national-level hackathon organized by Q-Bits, the Quantum Technology Club at Nitte (Deemed to be University). It brings together innovators and developers to explore quantum technology, AI, Web3, and post-quantum cryptography.",
    },
    {
      question: "Who can participate in the hackathon?",
      answer:
        "Students from any institution across India can participate in Quant-A-Maze 3.0. Participants can form teams of 2-4 members.",
    },
    {
      question: "What are the different tracks available?",
      answer:
        "Quant-A-Maze 3.0 features multiple problem tracks across different domains including Quantum Computing, AI/ML, Web3, Post-Quantum Cryptography, and more. Each track has unique challenges designed to test different skill sets.",
    },
    {
      question: "When is the hackathon scheduled?",
      answer:
        "Quant-A-Maze 3.0 is scheduled for September 7-8, 2026. The event runs for 36 hours continuously, providing participants with ample time to develop and refine their solutions.",
    },
    {
      question: "What should I bring to the hackathon?",
      answer:
        "Bring your laptop, charging cables, any required hardware, and your enthusiasm! The venue provides high-speed internet connectivity. We'll provide meals and refreshments throughout the event.",
    },
    {
      question: "Can we use pre-built projects or libraries?",
      answer:
        "Yes, you can use existing libraries, frameworks, and open-source tools. However, the core solution and logic must be developed during the hackathon. Using completely pre-made solutions is not allowed.",
    },
    {
      question: "How are winners decided?",
      answer:
        "Winners are selected based on innovation, technical implementation, presentation quality, and how well the solution addresses the problem statement. A panel of expert judges evaluates all submissions.",
    },
  ];

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="relative">
      <section
        id="faq"
        className="brochure-section relative min-h-screen overflow-hidden bg-[#0A0A0A] py-16 text-[#F2F2F2] sm:py-32"
      >
        {/* Ambient background glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-1/4 top-1/3 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(245,89,10,0.08)_0%,transparent_70%)] blur-3xl sm:h-[520px] sm:w-[520px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-10 bottom-1/4 h-[240px] w-[240px] rounded-full bg-[radial-gradient(circle,rgba(255,183,3,0.05)_0%,transparent_70%)] blur-3xl"
        />

        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {/* Header Section */}
          <Reveal>
            <div className="mb-6 inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-[#F5590A]/25 bg-black/50 px-3.5 py-1.5 font-mono text-[0.68rem] tracking-wide text-stone-300 shadow-[0_0_20px_rgba(245,89,10,0.08)] backdrop-blur-md">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#F5590A] shadow-[0_0_8px_#F5590A] animate-pulse" />
              <span>HELP // FREQUENTLY_ASKED_QUESTIONS</span>
            </div>

            <p className="section-kicker mb-3">Quick Answers</p>
            <h1 className="display-heading gradient-text mb-4 text-left text-3xl font-bold sm:text-5xl">
              Frequently Asked Questions
            </h1>
            <p className="mb-12 max-w-2xl text-sm leading-relaxed text-stone-400 sm:mb-16 sm:text-base">
              Got questions about Quant-A-Maze 3.0? Find quick answers regarding participation, tracks, logistics, and rules below.
            </p>
          </Reveal>

          {/* Accordion FAQ List */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="space-y-3.5"
          >
            {faqs.map((faq, index) => {
              const isOpen = expandedIndex === index;
              const formattedIndex = (index + 1).toString().padStart(2, "0");

              return (
                <motion.div
                  key={faq.question}
                  variants={staggerItem}
                  className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                    isOpen
                      ? "border-[#F5590A]/50 bg-gradient-to-r from-[#141210] via-[#101014] to-[#0A0A0A] shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_24px_rgba(245,89,10,0.12)]"
                      : "border-white/[0.08] bg-gradient-to-r from-white/[0.025] to-white/[0.01] hover:border-[#F5590A]/30 hover:bg-white/[0.04] hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
                  }`}
                >
                  {/* Subtle top edge highlight */}
                  {isOpen && (
                    <span
                      className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#F5590A]/70 to-transparent"
                      aria-hidden="true"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => toggleExpand(index)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors sm:p-6"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-3.5 sm:gap-5 min-w-0">
                      <span
                        className={`font-mono text-xs font-bold tracking-wider transition-colors duration-200 shrink-0 ${
                          isOpen ? "text-[#F5590A]" : "text-stone-500 group-hover:text-stone-300"
                        }`}
                      >
                        {formattedIndex}
                      </span>
                      <span
                        className={`text-base font-semibold transition-colors duration-200 sm:text-lg ${
                          isOpen ? "text-[#F2F2F2]" : "text-stone-200 group-hover:text-white"
                        }`}
                      >
                        {faq.question}
                      </span>
                    </div>

                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
                        isOpen
                          ? "border-[#F5590A]/60 bg-[#F5590A]/20 text-[#F5590A] shadow-[0_0_12px_rgba(245,89,10,0.3)] rotate-180"
                          : "border-white/10 bg-white/[0.04] text-stone-400 group-hover:border-white/20 group-hover:text-white"
                      }`}
                      aria-hidden="true"
                    >
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4 transition-transform duration-300"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{
                          opacity: 1,
                          height: "auto",
                          transition: { height: { duration: 0.3, ease: easeOut }, opacity: { duration: 0.25, delay: 0.05 } },
                        }}
                        exit={{
                          opacity: 0,
                          height: 0,
                          transition: { height: { duration: 0.25, ease: "easeInOut" }, opacity: { duration: 0.15 } },
                        }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-white/[0.06] px-5 pt-3 pb-5 sm:px-6 sm:pb-6">
                          <div className="rounded-xl border-l-2 border-[#F5590A]/60 bg-white/[0.02] p-4 pl-4.5 sm:p-5">
                            <p className="text-sm leading-relaxed text-stone-300 sm:text-base">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Footer Contact Prompt */}
          <Reveal delay={0.2}>
            <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.02] via-[#F5590A]/[0.04] to-transparent p-6 text-center sm:mt-16 sm:flex-row sm:p-8 sm:text-left">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#F5590A]">
                  Still have questions?
                </p>
                <p className="mt-1 text-sm font-semibold text-white sm:text-base">
                  Our organizing committee is here to assist you anytime.
                </p>
              </div>
              <a
                href="#footer"
                className="inline-flex min-h-[40px] shrink-0 items-center justify-center gap-2 rounded-lg border border-[#F5590A]/40 bg-[#F5590A]/10 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#FFA94D] transition-all duration-200 hover:border-[#F5590A] hover:bg-[#F5590A]/20 hover:text-white hover:shadow-[0_0_16px_rgba(245,89,10,0.3)] active:scale-95"
              >
                <span>Contact Us Directly</span>
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
