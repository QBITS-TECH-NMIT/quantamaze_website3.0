"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Reveal, staggerContainer, staggerItem, easeOut } from "@/components/MotionPrimitives";

export default function SponsorsPage() {
  const tiers = [
    {
      category: "COMMUNITY SUPPORT",
      name: "Q-Bits Community",
      badge: "Mentorship Network",
      description:
        "Supporting Quant-A-Maze 3.0 through peer mentoring, community-led learning, and technical guidance for participants across the hackathon experience.",
      points: [
        "Hands-on problem-solving mentorship",
        "Peer guidance and learning support",
        "Community-driven technical encouragement",
      ],
      featured: true,
    },
    {
      category: "ACADEMIC HOST & INSTITUTION",
      name: "Department of EEE, Nitte (Deemed to be University)",
      badge: "Host Institution",
      description:
        "Nitte (Deemed to be University) provides state-of-the-art infrastructure, computing labs, and academic anchoring for the 36-hour national-level hackathon.",
      points: [
        "36-hour on-campus lab infrastructure",
        "Faculty advisors & technical backing",
        "National academic outreach network",
      ],
      featured: false,
    },
  ];

  return (
    <div className="relative min-h-screen pt-20 sm:pt-24">
      <section
        id="sponsors"
        className="brochure-section relative min-h-screen overflow-hidden bg-[#0A0A0A] py-16 text-[#F2F2F2] sm:py-32"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute right-4 top-1/4 h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(245,89,10,0.1)_0%,transparent_70%)] blur-3xl sm:right-10 sm:h-[500px] sm:w-[500px]"
        />

        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="section-kicker mb-4">Empowering quantum innovation</p>
            <h1 className="display-heading gradient-text mb-10 text-left text-3xl font-bold sm:mb-14 sm:text-5xl">
              Sponsors &amp; Partners
            </h1>
          </Reveal>

          <section id="partners" aria-labelledby="partners-heading">
            <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
              <div>
                <span className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#F5590A]">
                  Current collaborators
                </span>
                <h2 id="partners-heading" className="mt-2 text-2xl font-bold tracking-tight text-[#F2F2F2] sm:text-4xl">
                  Partners
                </h2>
              </div>
              <span className="hidden font-mono text-xs tracking-[0.18em] text-stone-500 sm:block">02 / 02</span>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              className="grid gap-5 sm:gap-8 lg:grid-cols-2"
            >
              {tiers.map((partner) => (
                <motion.div
                  key={partner.name}
                  variants={staggerItem}
                  whileHover={{ y: -4, borderColor: "rgba(245,89,10,0.75)" }}
                  transition={{ duration: 0.25, ease: easeOut }}
                  className={`relative flex flex-col rounded-xl border p-6 transition-all sm:p-10 ${
                    partner.featured
                      ? "border-[#F5590A]/50 bg-gradient-to-b from-[#16161c] to-[#0d0d10] shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_30px_rgba(245,89,10,0.1)]"
                      : "border-white/10 bg-gradient-to-b from-[#131317] to-[#0A0A0A] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                  }`}
                >
                {/* Corner Crosshairs */}
                <span className="tech-crosshair top-3 right-3">+</span>
                <span className="tech-crosshair bottom-3 right-3">+</span>

                {/* Header row */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <span className="font-mono text-xs font-bold tracking-[0.22em] text-[#F5590A]">
                    {partner.category}
                  </span>
                  <span className="rounded-full border border-[#F5590A]/30 bg-[#F5590A]/10 px-3 py-1 text-xs font-semibold text-[#FFA94D]">
                    {partner.badge}
                  </span>
                </div>

                <h2 className="text-xl font-bold tracking-tight text-[#F2F2F2] sm:text-3xl">
                  {partner.name}
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-stone-300 sm:mt-4 sm:text-base">
                  {partner.description}
                </p>

                {/* Bullets */}
                <div className="mt-8 border-t border-white/10 pt-6">
                  <span className="mb-4 block font-mono text-[0.68rem] font-bold uppercase tracking-[0.2em] text-stone-400">
                    Collaboration Scope
                  </span>
                  <ul className="space-y-3">
                    {partner.points.map((point) => (
                      <li key={point} className="flex items-center gap-3 text-sm text-stone-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#F5590A]" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                </motion.div>
              ))}
            </motion.div>
          </section>

          <section id="sponsor-opportunity" aria-labelledby="sponsors-heading" className="mt-16 border-t border-white/10 pt-12 sm:mt-24 sm:pt-16">
            <div className="mb-6 sm:mb-8">
              <span className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#F5590A]">
                Build the next chapter
              </span>
              <h2 id="sponsors-heading" className="mt-2 text-2xl font-bold tracking-tight text-[#F2F2F2] sm:text-4xl">
                Sponsors
              </h2>
            </div>

            <Reveal delay={0.2}>
              <div className="flex flex-col items-center justify-between gap-6 rounded-xl border border-white/10 bg-gradient-to-r from-white/[0.03] via-[#F5590A]/[0.06] to-transparent p-6 text-center sm:flex-row sm:gap-8 sm:p-12 sm:text-left">
              <div>
                <span className="font-mono text-xs font-bold tracking-[0.25em] text-[#F5590A] uppercase">
                  Partner with Quant-A-Maze 3.0
                </span>
                <h3 className="mt-2 text-xl font-bold text-[#F2F2F2] sm:text-3xl">
                  Interested in Sponsoring or Mentoring?
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-400">
                  Connect your brand with top student builders, quantum researchers, and AI developers across India. Custom sponsorship tiers are available.
                </p>
              </div>

              <Link
                href="#contact"
                className="inline-flex min-h-[44px] w-full shrink-0 items-center justify-center gap-3 rounded-sm bg-[#F5590A] px-7 py-3.5 text-sm font-bold text-[#0A0A0A] transition hover:bg-[#ff7b3f] hover:shadow-[0_0_24px_rgba(245,89,10,0.4)] active:scale-95 sm:w-auto"
              >
                <span>Get in Touch</span>
                <span aria-hidden="true">→</span>
              </Link>
              </div>
            </Reveal>
          </section>
        </div>
      </section>
    </div>
  );
}
