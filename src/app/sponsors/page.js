"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Reveal, staggerContainer, staggerItem, easeOut } from "@/components/MotionPrimitives";
import ElectricBorderCanvas from "@/components/ElectricBorderCanvas";

// ─── Sponsor data (from qbits-quant-a-maze-sponsors.html) ────────────────────

const platinumSponsor = {
  name: "Qpi AI",
  tier: "Platinum Sponsor",
  url: "https://www.qpiai.tech/",
  logo: "/sponsors/qpiai.png",
  logoAlt: "Qpi AI logo",
};

const vcPartners = [
  {
    name: "Growth Sense",
    tier: "VC Partner",
    url: "https://www.growth-sense.com/",
    logo: "/sponsors/growthsense.png",
    logoAlt: "Growth Sense logo",
  },
  {
    name: "Hyderabad Angels",
    tier: "VC Partner",
    url: "https://hyderabadangels.in/",
    logo: "/sponsors/hyderabadangels.png",
    logoAlt: "Hyderabad Angels logo",
  },
];

const inKindSponsor = {
  name: "CodeCrafters",
  tier: "In-Kind Sponsor",
  url: "https://codecrafters.io/",
  logo: "/sponsors/codecrafters.png",
  logoAlt: "CodeCrafters logo",
};

const rewardBreakdown = [
  { place: "1st Place", reward: "2-year VIP membership", note: "per team member" },
  { place: "2nd Place", reward: "1-year VIP membership", note: "per team member" },
  { place: "3rd Place", reward: "6-month VIP membership", note: "per team member" },
  { place: "Organizers", reward: "3-month VIP membership", note: "for up to five core organizers" },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function TierDivider({ label }) {
  return (
    <div className="sponsors-tier-divider flex items-center gap-4 mb-6" aria-hidden="true">
      <span className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#F5590A] shrink-0">
        {label}
      </span>
      <span className="flex-1 h-px bg-gradient-to-r from-[#F5590A]/40 via-white/10 to-transparent" />
    </div>
  );
}

function SponsorLogoTile({ logo, alt, size = "md" }) {
  const heights = { sm: "h-10 sm:h-12", md: "h-12 sm:h-16", lg: "h-14 sm:h-20" };
  return (
    <div className="sponsor-logo-tile relative overflow-hidden rounded-xl bg-white flex items-center justify-center px-5 py-3">
      <Image
        src={logo}
        alt={alt}
        width={200}
        height={80}
        className={`${heights[size]} w-auto max-w-[180px] object-contain transition-transform duration-300 group-hover:scale-105`}
      />
      {/* Sheen sweep on hover */}
      <span className="sponsor-logo-sheen pointer-events-none" aria-hidden="true" />
    </div>
  );
}

function TierBadge({ label, highlight = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-[0.12em] ${
        highlight
          ? "border-[#FFB703]/50 bg-[#FFB703]/10 text-[#FFB703]"
          : "border-[#F5590A]/30 bg-[#F5590A]/10 text-[#FFA94D]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${highlight ? "bg-[#FFB703]" : "bg-[#F5590A]"}`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SponsorsPage() {
  const platinumCardRef = useRef(null);

  return (
    <div className="relative">
      <section
        id="sponsors"
        className="brochure-section relative min-h-screen overflow-hidden bg-[#0A0A0A] py-16 text-[#F2F2F2] sm:py-32"
      >
        {/* Ambient glow blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-4 top-1/4 h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(245,89,10,0.1)_0%,transparent_70%)] blur-3xl sm:right-10 sm:h-[500px] sm:w-[500px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 bottom-1/3 h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,rgba(226,232,240,0.06)_0%,transparent_70%)] blur-3xl"
        />

        <div className="mx-auto max-w-6xl px-4 sm:px-6">

          {/* ── Page header ── */}
          <Reveal>
            <p className="section-kicker mb-4">Powering Quant-A-Maze 3.0</p>
            <h1 className="display-heading gradient-text mb-3 text-left text-3xl font-bold sm:text-5xl">
              Sponsors &amp; Partners
            </h1>
            <p className="mb-12 max-w-xl text-sm leading-relaxed text-stone-400 sm:mb-16 sm:text-base">
              The partners backing India's flagship student quantum hackathon.
            </p>
          </Reveal>

          {/* ════════════════════════════════════════════════════════════
              SECTION 1 — Monetary & VC Sponsors (Platinum + VC in one row)
          ════════════════════════════════════════════════════════════ */}
          <Reveal delay={0.08}>
            <TierDivider label="Monetary & VC Sponsors" />
          </Reveal>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            className="mb-16 sm:mb-24 grid gap-4 sm:gap-5
              grid-cols-1
              sm:grid-cols-[1.35fr_1fr_1fr]
            "
          >
            {/* ── Platinum card — with Animated Silver Electric Border ── */}
            <motion.div
              ref={platinumCardRef}
              variants={staggerItem}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.25, ease: easeOut }}
              className="electric-card-container group relative"
            >
              <div className="electric-inner-container">
                <ElectricBorderCanvas
                  containerRef={platinumCardRef}
                  canvasId="electric-border-canvas-platinum"
                  color="#E2E8F0"
                  borderRadius={24}
                  borderOffset={50}
                  displacement={45}
                  speed={1.4}
                  lineWidth={1.2}
                />
                <div className="glow-layer-1" />
                <div className="glow-layer-2" />
              </div>

              <div className="overlay-1" />
              <div className="overlay-2" />
              <div className="background-glow" />

              <a
                href={platinumSponsor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="electric-content-container p-6 sm:p-8 no-underline"
                aria-label={`Visit ${platinumSponsor.name}`}
              >
                {/* Corner crosshairs */}
                <span className="tech-crosshair top-3 right-3 text-slate-300" aria-hidden="true">+</span>
                <span className="tech-crosshair bottom-3 left-3 text-slate-300" aria-hidden="true">+</span>

                {/* Silver top-edge accent line */}
                <span
                  className="pointer-events-none absolute inset-x-0 top-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-transparent via-[#E2E8F0]/60 to-transparent"
                  aria-hidden="true"
                />

                {/* Header */}
                <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300/40 bg-slate-300/10 px-3 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-[0.12em] text-slate-100 shadow-[0_0_12px_rgba(226,232,240,0.15)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#E2E8F0] shadow-[0_0_8px_#FFFFFF]" aria-hidden="true" />
                    {platinumSponsor.tier}
                  </span>
                  <span className="font-mono text-[0.6rem] tracking-widest text-slate-400 uppercase">01 / 03</span>
                </div>

                {/* Logo */}
                <div className="mb-6 flex-1 flex items-center">
                  <SponsorLogoTile logo={platinumSponsor.logo} alt={platinumSponsor.logoAlt} size="lg" />
                </div>

                {/* Name + arrow */}
                <div className="flex items-end justify-between gap-2 mt-auto">
                  <span className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                    {platinumSponsor.name}
                  </span>
                  <span
                    className="opacity-0 group-hover:opacity-100 translate-x-[-4px] translate-y-[4px] group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-200 text-slate-200 text-lg"
                    aria-hidden="true"
                  >
                    ↗
                  </span>
                </div>
              </a>
            </motion.div>

            {/* ── VC Partner cards ── */}
            {vcPartners.map((vc, i) => (
              <motion.a
                key={vc.name}
                variants={staggerItem}
                href={vc.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -6, borderColor: "rgba(245,89,10,0.7)" }}
                transition={{ duration: 0.25, ease: easeOut }}
                className="group relative flex flex-col rounded-2xl border border-white/12
                  bg-gradient-to-br from-[#131318] via-[#101010] to-[#0A0A0A]
                  p-5 sm:p-7
                  shadow-[0_8px_32px_rgba(0,0,0,0.5)]
                  hover:shadow-[0_14px_44px_rgba(0,0,0,0.65),0_0_22px_rgba(245,89,10,0.15)]
                  transition-shadow duration-300
                  no-underline"
                aria-label={`Visit ${vc.name}`}
              >
                <span className="tech-crosshair top-3 right-3" aria-hidden="true">+</span>
                <span className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-[#F5590A]/30 to-transparent" aria-hidden="true" />

                <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                  <TierBadge label={vc.tier} />
                  <span className="font-mono text-[0.6rem] tracking-widest text-stone-500 uppercase">
                    0{i + 2} / 03
                  </span>
                </div>

                <div className="mb-5 flex-1 flex items-center">
                  <SponsorLogoTile logo={vc.logo} alt={vc.logoAlt} size="md" />
                </div>

                <div className="flex items-end justify-between gap-2 mt-auto">
                  <span className="text-base font-bold tracking-tight text-[#F2F2F2] sm:text-lg">
                    {vc.name}
                  </span>
                  <span
                    className="opacity-0 group-hover:opacity-100 translate-x-[-4px] translate-y-[4px] group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-200 text-[#F5590A]"
                    aria-hidden="true"
                  >
                    ↗
                  </span>
                </div>
              </motion.a>
            ))}
          </motion.div>

          {/* ════════════════════════════════════════════════════════════
              SECTION 2 — In-Kind Sponsor + Reward Breakdown
          ════════════════════════════════════════════════════════════ */}
          <Reveal delay={0.12}>
            <TierDivider label="In-Kind Sponsor" />
          </Reveal>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            className="mb-16 sm:mb-24 grid gap-5 sm:gap-6
              grid-cols-1
              lg:grid-cols-[auto_1fr]
              lg:items-start"
          >
            {/* ── CodeCrafters card ── */}
            <motion.a
              variants={staggerItem}
              href={inKindSponsor.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -6, borderColor: "rgba(245,89,10,0.7)" }}
              transition={{ duration: 0.25, ease: easeOut }}
              className="group relative flex flex-col rounded-2xl border border-[#F5590A]/25
                bg-gradient-to-br from-[#130D0A] via-[#100E0C] to-[#0A0A0A]
                p-6 sm:p-8
                shadow-[0_8px_40px_rgba(0,0,0,0.55),0_0_20px_rgba(245,89,10,0.06)]
                hover:shadow-[0_14px_50px_rgba(0,0,0,0.65),0_0_30px_rgba(245,89,10,0.18)]
                transition-shadow duration-300
                no-underline
                lg:w-72 xl:w-80"
              aria-label={`Visit ${inKindSponsor.name}`}
            >
              <span className="tech-crosshair top-3 right-3" aria-hidden="true">+</span>
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-[#F5590A]/50 to-transparent" aria-hidden="true" />

              <div className="mb-5 flex flex-wrap items-start justify-between gap-2">
                <TierBadge label={inKindSponsor.tier} />
                <span className="font-mono text-[0.6rem] tracking-widest text-stone-500 uppercase">In-Kind</span>
              </div>

              <div className="mb-6 flex items-center">
                <SponsorLogoTile logo={inKindSponsor.logo} alt={inKindSponsor.logoAlt} size="md" />
              </div>

              <div className="flex items-end justify-between gap-2 mt-auto">
                <span className="text-lg font-bold tracking-tight text-[#F2F2F2]">
                  {inKindSponsor.name}
                </span>
                <span
                  className="opacity-0 group-hover:opacity-100 translate-x-[-4px] translate-y-[4px] group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-200 text-[#F5590A]"
                  aria-hidden="true"
                >
                  ↗
                </span>
              </div>
            </motion.a>

            {/* ── Reward breakdown panel ── */}
            <motion.div
              variants={staggerItem}
              className="relative rounded-2xl border border-white/8
                bg-gradient-to-br from-[#0F0F12] to-[#0A0A0A]
                p-6 sm:p-8
                shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
            >
              {/* Decorative accent corners */}
              <span className="tech-crosshair top-3 right-3" aria-hidden="true">+</span>
              <span className="tech-crosshair bottom-3 left-3" aria-hidden="true">+</span>
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent" aria-hidden="true" />

              {/* Header */}
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#F5590A]/30 bg-[#F5590A]/10">
                  <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 text-[#F5590A]" aria-hidden="true">
                    <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm.75 9.5h-1.5v-5h1.5v5Zm0-6.5h-1.5V2.5h1.5V4Z" />
                  </svg>
                </span>
                <div>
                  <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#F5590A]">
                    CodeCrafters · Winner Benefit
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-[#F2F2F2]">VIP Membership Reward Breakdown</p>
                </div>
              </div>

              {/* Reward list */}
              <ol className="space-y-3" aria-label="Prize reward breakdown">
                {rewardBreakdown.map((item, idx) => (
                  <li key={item.place} className="reward-row flex items-center gap-4 rounded-xl border border-white/6 bg-white/[0.025] px-4 py-3 transition-colors duration-200 hover:border-[#F5590A]/25 hover:bg-[#F5590A]/[0.04]">
                    {/* Rank number */}
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-black ${
                        idx === 0
                          ? "bg-[#FFB703]/15 text-[#FFB703] border border-[#FFB703]/30"
                          : idx === 1
                          ? "bg-stone-400/10 text-stone-300 border border-stone-400/20"
                          : idx === 2
                          ? "bg-orange-900/20 text-orange-400 border border-orange-700/30"
                          : "bg-white/5 text-stone-400 border border-white/10"
                      }`}
                      aria-hidden="true"
                    >
                      {idx < 3 ? idx + 1 : "✦"}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-bold uppercase tracking-wider ${
                        idx === 0 ? "text-[#FFB703]" : idx === 1 ? "text-stone-300" : idx === 2 ? "text-orange-400" : "text-[#F5590A]"
                      }`}>
                        {item.place}
                      </p>
                      <p className="text-sm font-semibold text-[#F2F2F2]">{item.reward}</p>
                    </div>

                    <span className="hidden shrink-0 font-mono text-[0.62rem] text-stone-500 sm:block">
                      {item.note}
                    </span>
                  </li>
                ))}
              </ol>

              {/* Note on mobile */}
              <p className="mt-3 text-center font-mono text-[0.6rem] text-stone-500 sm:hidden">
                Memberships awarded per team member (organizers: up to 5)
              </p>
            </motion.div>
          </motion.div>

          {/* ════════════════════════════════════════════════════════════
              CTA — Become a Sponsor (preserved as-is)
          ════════════════════════════════════════════════════════════ */}
          <section
            id="sponsor-opportunity"
            aria-labelledby="sponsors-cta-heading"
            className="border-t border-white/10 pt-12 sm:pt-16"
          >
            <div className="mb-6 sm:mb-8">
              <span className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#F5590A]">
                Build the next chapter
              </span>
              <h2
                id="sponsors-cta-heading"
                className="mt-2 text-2xl font-bold tracking-tight text-[#F2F2F2] sm:text-4xl"
              >
                Become a Sponsor
              </h2>
            </div>

            <Reveal delay={0.2}>
              <div className="flex flex-col items-center justify-between gap-6 rounded-xl border border-white/10 bg-gradient-to-r from-white/[0.03] via-[#F5590A]/[0.06] to-transparent p-6 text-center sm:flex-row sm:gap-8 sm:p-12 sm:text-left">
                <div>
                  <span className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-[#F5590A]">
                    Partner with Quant-A-Maze 3.0
                  </span>
                  <h3 className="mt-2 text-xl font-bold text-[#F2F2F2] sm:text-3xl">
                    Interested in Sponsoring or Mentoring?
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-400">
                    Connect your brand with top student builders, quantum researchers, and AI developers across India.
                    Custom sponsorship tiers are available.
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
