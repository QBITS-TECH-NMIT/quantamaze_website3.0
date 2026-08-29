"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const MembersTree3D = dynamic(() => import("@/components/MembersTree3D"), {
  ssr: false,
  loading: () => <div className="min-h-[580px] rounded-[2rem] border border-white/10 bg-[#06070c] sm:min-h-[680px]" aria-hidden="true" />,
});

// ─────────────────────────────────────────────────────────────────
// MEMBER DATA STRUCTURE
// ─────────────────────────────────────────────────────────────────

export const FACULTY_DATA = [
  { name: "Faculty Name", role: "Faculty Advisor", photo: null, code: "FAC-01" },
  { name: "Faculty Name", role: "Faculty Advisor", photo: null, code: "FAC-02" },
  { name: "Faculty Name", role: "Faculty Advisor", photo: null, code: "FAC-03" },
];

export const DOMAINS_DATA = [
  {
    id: "core",
    index: "01",
    name: "Core",
    tagline: "Executive Leadership & General Club Management",
    members: [
      { name: "Member Name", role: "Domain Head", photo: null, code: "CR-01" },
      { name: "Member Name", role: "Core Member", photo: null, code: "CR-02" },
      { name: "Member Name", role: "Core Member", photo: null, code: "CR-03" },
      { name: "Member Name", role: "Member", photo: null, code: "CR-04" },
    ],
  },
  {
    id: "technical",
    index: "02",
    name: "Technical",
    tagline: "Architecture, Systems & Quantum Computing",
    members: [
      { name: "Member Name", role: "Domain Head", photo: null, code: "TC-01" },
      { name: "Member Name", role: "Core Member", photo: null, code: "TC-02" },
      { name: "Member Name", role: "Core Member", photo: null, code: "TC-03" },
      { name: "Member Name", role: "Member", photo: null, code: "TC-04" },
    ],
  },
  {
    id: "administration",
    index: "03",
    name: "Administration",
    tagline: "Governance, Strategy & Internal Operations",
    members: [
      { name: "Member Name", role: "Domain Head", photo: null, code: "AD-01" },
      { name: "Member Name", role: "Core Member", photo: null, code: "AD-02" },
      { name: "Member Name", role: "Core Member", photo: null, code: "AD-03" },
      { name: "Member Name", role: "Member", photo: null, code: "AD-04" },
    ],
  },
  {
    id: "design",
    index: "04",
    name: "Design",
    tagline: "Visual Identity, UI/UX & Creative Media",
    members: [
      { name: "Member Name", role: "Domain Head", photo: null, code: "DS-01" },
      { name: "Member Name", role: "Core Member", photo: null, code: "DS-02" },
      { name: "Member Name", role: "Core Member", photo: null, code: "DS-03" },
      { name: "Member Name", role: "Member", photo: null, code: "DS-04" },
    ],
  },
  {
    id: "events",
    index: "05",
    name: "Events",
    tagline: "Hackathon Execution, Logistics & Stage Management",
    members: [
      { name: "Member Name", role: "Domain Head", photo: null, code: "EV-01" },
      { name: "Member Name", role: "Core Member", photo: null, code: "EV-02" },
      { name: "Member Name", role: "Core Member", photo: null, code: "EV-03" },
      { name: "Member Name", role: "Member", photo: null, code: "EV-04" },
    ],
  },
  {
    id: "hospitality",
    index: "06",
    name: "Hospitality",
    tagline: "Guest Relations, Accommodations & VIP Care",
    members: [
      { name: "Member Name", role: "Domain Head", photo: null, code: "HS-01" },
      { name: "Member Name", role: "Core Member", photo: null, code: "HS-02" },
      { name: "Member Name", role: "Core Member", photo: null, code: "HS-03" },
      { name: "Member Name", role: "Member", photo: null, code: "HS-04" },
    ],
  },
  {
    id: "marketing-and-sponsorship",
    index: "07",
    name: "Marketing And Sponsorship",
    tagline: "Corporate Partnerships, Outreach & Brand Growth",
    members: [
      { name: "Member Name", role: "Domain Head", photo: null, code: "MK-01" },
      { name: "Member Name", role: "Core Member", photo: null, code: "MK-02" },
      { name: "Member Name", role: "Core Member", photo: null, code: "MK-03" },
      { name: "Member Name", role: "Member", photo: null, code: "MK-04" },
    ],
  },
  {
    id: "operations",
    index: "08",
    name: "Operations",
    tagline: "Resource Planning, Security & Venue Setup",
    members: [
      { name: "Member Name", role: "Domain Head", photo: null, code: "OP-01" },
      { name: "Member Name", role: "Core Member", photo: null, code: "OP-02" },
      { name: "Member Name", role: "Core Member", photo: null, code: "OP-03" },
      { name: "Member Name", role: "Member", photo: null, code: "OP-04" },
    ],
  },
  {
    id: "rnd",
    index: "09",
    name: "R&D",
    tagline: "Quantum Research, Whitepapers & Experimental Circuits",
    members: [
      { name: "Member Name", role: "Domain Head", photo: null, code: "RD-01" },
      { name: "Member Name", role: "Core Member", photo: null, code: "RD-02" },
      { name: "Member Name", role: "Core Member", photo: null, code: "RD-03" },
      { name: "Member Name", role: "Member", photo: null, code: "RD-04" },
    ],
  },
  {
    id: "social-media",
    index: "10",
    name: "Social Media",
    tagline: "Digital Campaigns, Content Creation & Community",
    members: [
      { name: "Member Name", role: "Domain Head", photo: null, code: "SM-01" },
      { name: "Member Name", role: "Core Member", photo: null, code: "SM-02" },
      { name: "Member Name", role: "Core Member", photo: null, code: "SM-03" },
      { name: "Member Name", role: "Member", photo: null, code: "SM-04" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// ANIMATION VARIANTS
// ─────────────────────────────────────────────────────────────────

const easeOut = [0.16, 1, 0.3, 1];

const sectionVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOut },
  },
};

const cardStaggerContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: easeOut },
  },
};

const viewTransitionVariants = {
  hidden: { opacity: 0, scale: 0.98, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: -12,
    transition: { duration: 0.22, ease: "easeIn" },
  },
};

// ─────────────────────────────────────────────────────────────────
// HIGH-IMPACT CIRCULAR AVATAR SILHOUETTE SVG (Large Prominent Head)
// ─────────────────────────────────────────────────────────────────

export function PlaceholderSilhouette({ code = "Q-01" }) {
  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full select-none"
      aria-hidden="true"
    >
      <defs>
        {/* Radial Orange Ambient Glow */}
        <radialGradient id="meshGlowCircle" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="rgba(245, 89, 10, 0.3)" />
          <stop offset="55%" stopColor="rgba(255, 138, 61, 0.12)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>

        {/* Head and Body Gradient */}
        <linearGradient id="avatarBodyGrad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.26)" />
          <stop offset="50%" stopColor="rgba(245, 89, 10, 0.18)" />
          <stop offset="100%" stopColor="rgba(15, 15, 24, 0.85)" />
        </linearGradient>

        {/* Fine Matrix Pattern */}
        <pattern id="avatarGridPattern" width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.75" />
          <circle cx="8" cy="8" r="0.75" fill="rgba(245,89,10,0.25)" />
        </pattern>
      </defs>

      {/* Titanium Dark Background */}
      <circle cx="120" cy="120" r="120" fill="#08080E" />
      <circle cx="120" cy="120" r="120" fill="url(#avatarGridPattern)" />
      <circle cx="120" cy="120" r="120" fill="url(#meshGlowCircle)" />

      {/* Concentric Radar Rings */}
      <circle cx="120" cy="98" r="70" stroke="rgba(245,89,10,0.18)" strokeWidth="1" strokeDasharray="4 4" />
      <circle cx="120" cy="98" r="54" stroke="rgba(255,138,61,0.22)" strokeWidth="1" />

      {/* Significantly Bigger Silhouette Head (Clearly Visible Face Area) */}
      <circle
        cx="120"
        cy="96"
        r="48"
        fill="url(#avatarBodyGrad)"
        stroke="rgba(245,89,10,0.4)"
        strokeWidth="1.75"
      />

      {/* Cybernetic Visor Light Beam */}
      <path d="M 90 94 L 150 94" stroke="#F5590A" strokeWidth="3" strokeLinecap="round" />
      <circle cx="120" cy="94" r="4.5" fill="#FF8A3D" shadow="0 0 8px #FF8A3D" />

      {/* Broad Torso & Shoulders */}
      <path
        d="M 24 240 C 24 175, 70 156, 120 156 C 170 156, 216 175, 216 240 Z"
        fill="url(#avatarBodyGrad)"
        stroke="rgba(245,89,10,0.3)"
        strokeWidth="1.5"
      />

      {/* Cyber Circuit Spine Line */}
      <path d="M 120 156 L 120 230" stroke="rgba(245,89,10,0.5)" strokeWidth="2" strokeDasharray="6 4" />
      <path d="M 85 205 L 120 216 L 155 205" stroke="rgba(255,138,61,0.35)" strokeWidth="1.25" fill="none" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// MEMBER CARD COMPONENT (Larger, Spacious, Big Avatar, High Contrast)
// ─────────────────────────────────────────────────────────────────

export function MemberCard({ member }) {
  return (
    <motion.div
      variants={cardVariants}
      className="group relative flex flex-col items-center justify-between overflow-hidden rounded-3xl border border-white/[0.09] bg-[#090A10]/95 p-6 sm:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.75)] transition-all duration-300 hover:-translate-y-2 hover:border-[#F5590A]/90 hover:shadow-[0_24px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(245,89,10,0.35),0_0_15px_rgba(255,138,61,0.2)]"
    >
      {/* Corner Registration Marks */}
      <span className="comic-corner-bracket comic-corner-bracket--tl" aria-hidden="true" />
      <span className="comic-corner-bracket comic-corner-bracket--tr" aria-hidden="true" />
      <span className="comic-corner-bracket comic-corner-bracket--bl" aria-hidden="true" />
      <span className="comic-corner-bracket comic-corner-bracket--br" aria-hidden="true" />

      {/* Top Header Row: ID Tag & Active Status */}
      <div className="flex w-full items-center justify-between z-10 mb-2">
        <div className="flex items-center gap-1.5 rounded-md border border-white/10 bg-[#08080C]/90 px-3 py-1 backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-[#F5590A] shadow-[0_0_6px_#F5590A] animate-pulse" />
          <span className="font-mono text-xs font-extrabold tracking-wider text-stone-200">
            {member.code || "Q-BIT"}
          </span>
        </div>

        <div className="rounded-md border border-[#F5590A]/40 bg-[#F5590A]/10 px-2.5 py-1 backdrop-blur-md">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#FF8A3D]">
            ACTIVE
          </span>
        </div>
      </div>

      {/* Center: Significantly Bigger Circular Photo / Avatar Area */}
      <div className="relative my-4 flex items-center justify-center">
        {/* Ambient Orange Glow behind circle */}
        <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-[#F5590A]/25 via-[#FF8A3D]/12 to-transparent blur-md group-hover:from-[#F5590A]/45 group-hover:blur-xl transition-all duration-300" />
        
        {/* Rotating Outer Dash Ring */}
        <div className="absolute -inset-2.5 rounded-full border border-[#F5590A]/35 border-dashed animate-[spin_24s_linear_infinite] pointer-events-none group-hover:border-[#F5590A]/70 transition-colors" />

        {/* Circular Avatar Container */}
        <div className="relative h-44 w-44 sm:h-48 sm:w-48 md:h-52 md:w-52 lg:h-56 lg:w-56 overflow-hidden rounded-full border-2 border-[#F5590A]/50 bg-[#08080E] shadow-[0_0_25px_rgba(245,89,10,0.25)] transition-all duration-300 group-hover:border-[#F5590A] group-hover:shadow-[0_0_40px_rgba(245,89,10,0.5)] group-hover:scale-[1.03]">
          {member.photo ? (
            <img
              src={member.photo}
              alt={member.name}
              className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full">
              <PlaceholderSilhouette code={member.code} />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Area: Name and Role clearly visible & well-spaced */}
      <div className="mt-2 flex w-full flex-col items-center text-center z-10">
        <h3 className="text-xl sm:text-2xl font-black leading-snug text-white transition-colors duration-200 group-hover:text-[#FFB703] tracking-tight">
          {member.name}
        </h3>
        
        <div className="mt-3">
          <span className="inline-flex items-center rounded-full bg-[#F5590A]/15 border border-[#F5590A]/40 px-4 py-1 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-[#FF8A3D] shadow-[0_0_12px_rgba(245,89,10,0.25)]">
            {member.role}
          </span>
        </div>
      </div>

      {/* Subtle Inner Glow on Hover */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 shadow-[inset_0_0_0_1.5px_rgba(245,89,10,0.4)]" />
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
// SECTION HEADING COMPONENT
// ─────────────────────────────────────────────────────────────────

export function SectionHeading({ index = null, title, subtitle = null, memberCount = 4 }) {
  return (
    <div className="mb-10 sm:mb-14">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {index && (
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-black tracking-[0.25em] text-[#F5590A]">
                // SECTOR {index}
              </span>
              <span className="h-1 w-1 rounded-full bg-[#FF8A3D]" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-stone-400">
                DOMAIN MODULE
              </span>
            </div>
          )}
          
          <h2 className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl lg:text-5xl">
            {title}
          </h2>
          
          {subtitle && (
            <p className="mt-2 font-mono text-xs text-stone-400 sm:text-sm">
              {subtitle}
            </p>
          )}
        </div>

        {/* Squad Size Pill */}
        <div className="mt-3 sm:mt-0 inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-[#0C0C14] px-4 py-1.5 backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-[#F5590A] shadow-[0_0_8px_#F5590A]" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-stone-300">
            {memberCount} {memberCount === 1 ? "Member" : "Members"}
          </span>
        </div>
      </div>

      {/* Cyber Laser Divider Line */}
      <div className="relative mt-4 flex items-center">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#F5590A] via-[#FF8A3D]/60 to-transparent shadow-[0_0_12px_rgba(245,89,10,0.6)]" />
        <div className="absolute left-0 h-1.5 w-14 bg-white shadow-[0_0_10px_#fff]" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MEMBER GRID (Generous Spacious Columns)
// ─────────────────────────────────────────────────────────────────

export function MemberGrid({ members }) {
  return (
    <motion.div
      variants={cardStaggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.05 }}
      className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 sm:gap-8 lg:gap-10"
    >
      {members.map((member, idx) => (
        <MemberCard key={`${member.name}-${idx}`} member={member} />
      ))}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
// 2D VIEW (11 Stacked Sections in Exact Specified Order)
// ─────────────────────────────────────────────────────────────────

export function View2D({ faculty = FACULTY_DATA, domains = DOMAINS_DATA }) {
  return (
    <div className="space-y-24 sm:space-y-32 lg:space-y-36">
      {/* 1. Faculty Section */}
      <motion.section
        id="section-faculty"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.06 }}
        aria-label="Faculty"
        className="scroll-mt-32"
      >
        <SectionHeading
          index="00"
          title="Faculty"
          subtitle="Mentors, Advisors & Academic Guidance"
          memberCount={faculty.length}
        />
        <MemberGrid members={faculty} />
      </motion.section>

      {/* 2 to 11. 10 Domain Sections in Exact Specified Order */}
      {domains.map((domain) => (
        <motion.section
          key={domain.id}
          id={`section-${domain.id}`}
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.06 }}
          aria-label={domain.name}
          className="scroll-mt-32"
        >
          <SectionHeading
            index={domain.index}
            title={domain.name}
            subtitle={domain.tagline}
            memberCount={domain.members.length}
          />
          <MemberGrid members={domain.members} />
        </motion.section>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// 3D INTERACTIVE NETWORK VIEW
// ─────────────────────────────────────────────────────────────────

export function View3D({ faculty = FACULTY_DATA, domains = DOMAINS_DATA, view, onViewChange }) {
  return (
    <MembersTree3D faculty={faculty} domains={domains} view={view} onViewChange={onViewChange} />
  );
}

// ─────────────────────────────────────────────────────────────────
// 2D / 3D TOGGLE SWITCH
// ─────────────────────────────────────────────────────────────────

export function ViewToggle({ view, onChange }) {
  return (
    <div
      className="inline-flex items-center rounded-full border border-[#F5590A]/35 bg-[#08080E]/90 p-1.5 backdrop-blur-xl shadow-[0_0_25px_rgba(245,89,10,0.18)]"
      role="group"
      aria-label="Select view mode"
    >
      <button
        type="button"
        onClick={() => onChange("2d")}
        aria-pressed={view === "2d"}
        className={`relative flex items-center gap-2 rounded-full px-6 py-2 font-mono text-xs font-black uppercase tracking-wider transition-all duration-300 ${
          view === "2d"
            ? "border border-[#F5590A]/60 bg-gradient-to-r from-[#F5590A] via-[#FF8A3D] to-[#EA580C] text-[#0A0A0A] shadow-[0_0_20px_rgba(245,89,10,0.6)]"
            : "text-stone-400 hover:text-white"
        }`}
      >
        <span>2D Mode</span>
      </button>
      
      <button
        type="button"
        onClick={() => onChange("3d")}
        aria-pressed={view === "3d"}
        className={`relative flex items-center gap-2 rounded-full px-6 py-2 font-mono text-xs font-black uppercase tracking-wider transition-all duration-300 ${
          view === "3d"
            ? "border border-[#F5590A]/60 bg-gradient-to-r from-[#F5590A] via-[#FF8A3D] to-[#EA580C] text-[#0A0A0A] shadow-[0_0_20px_rgba(245,89,10,0.6)]"
            : "text-stone-400 hover:text-white"
        }`}
      >
        <span>3D Mode</span>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// QUICK DOMAIN JUMP NAVIGATOR CHIPS
// ─────────────────────────────────────────────────────────────────

function DomainQuickBar() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="mb-14 overflow-x-auto pb-3 pt-1 scrollbar-none">
      <div className="flex items-center gap-2 min-w-max">
        <span className="font-mono text-[11px] font-black uppercase tracking-wider text-[#F5590A] mr-2">
          QUICK JUMP:
        </span>
        <button
          type="button"
          onClick={() => scrollTo("section-faculty")}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-xs font-semibold text-stone-300 hover:border-[#F5590A] hover:bg-[#F5590A]/10 hover:text-[#FF8A3D] transition-all"
        >
          Faculty
        </button>
        {DOMAINS_DATA.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => scrollTo(`section-${d.id}`)}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-xs font-semibold text-stone-300 hover:border-[#F5590A] hover:bg-[#F5590A]/10 hover:text-[#FF8A3D] transition-all"
          >
            {d.name}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// COMPLETE MEMBERS SECTION COMPONENT
// ─────────────────────────────────────────────────────────────────

export default function MembersSection({ showHeader = true, compact = false }) {
  const [view, setView] = useState("2d");

  return (
    <div className={`relative w-full ${compact ? "py-2" : "py-4"}`}>
      {/* Top Page Header */}
      {showHeader && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="mb-12 sm:mb-16"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#F5590A]/35 bg-[#F5590A]/10 px-3.5 py-1 mb-3.5">
                <span className="h-2 w-2 rounded-full bg-[#F5590A] shadow-[0_0_8px_#F5590A] animate-pulse" />
                <span className="font-mono text-xs font-black uppercase tracking-[0.25em] text-[#FF8A3D]">
                  QUANTUM TECH CLUB
                </span>
              </div>
              <h1 className="text-4xl font-black uppercase tracking-tight text-white sm:text-6xl lg:text-7xl drop-shadow-[0_0_35px_rgba(245,89,10,0.2)]">
                Our Members
              </h1>
              <p className="mt-3 max-w-xl text-sm font-mono text-stone-400 sm:text-base">
                The innovators, researchers, organizers, and creators driving Q-Bits and Quant-A-Maze 3.0.
              </p>
            </div>

            <ViewToggle view={view} onChange={setView} />
          </div>
        </motion.div>
      )}

      {!showHeader && (
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <span className="font-mono text-xs font-black uppercase tracking-[0.25em] text-[#FF8A3D]">
              // TEAM ROSTER
            </span>
            <h2 className="mt-1 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
              Our Members
            </h2>
          </div>
          <ViewToggle view={view} onChange={setView} />
        </div>
      )}

      {/* Quick Domain Navigation Bar */}
      {view === "2d" && !compact && <DomainQuickBar />}

      {/* Smooth Crossfade View Switcher */}
      <AnimatePresence mode="wait">
        {view === "2d" ? (
          <motion.div
            key="view-2d"
            variants={viewTransitionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <View2D />
          </motion.div>
        ) : (
          <View3D key="view-3d" view={view} onViewChange={setView} />
        )}
      </AnimatePresence>
    </div>
  );
}
