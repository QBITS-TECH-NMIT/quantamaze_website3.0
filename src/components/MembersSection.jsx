"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import {
  FACULTY_DATA as GENERATED_FACULTY_DATA,
  LEADERSHIP_DATA as GENERATED_LEADERSHIP_DATA,
  DOMAINS_DATA as GENERATED_DOMAINS_DATA,
} from "@/lib/teamMembers";

const MembersTree3D = dynamic(() => import("@/components/MembersTree3D"), {
  ssr: false,
  loading: () => <div className="min-h-[580px] rounded-[2rem] border border-white/10 bg-[#06070c] sm:min-h-[680px]" aria-hidden="true" />,
});

// ─────────────────────────────────────────────────────────────────
// MEMBER DATA STRUCTURE
// ─────────────────────────────────────────────────────────────────

export const FACULTY_DATA = Array.isArray(GENERATED_FACULTY_DATA) ? GENERATED_FACULTY_DATA : [];

export const LEADERSHIP_DATA = Array.isArray(GENERATED_LEADERSHIP_DATA) && GENERATED_LEADERSHIP_DATA.length
  ? GENERATED_LEADERSHIP_DATA
  : [
      { name: "ML Shikhar", role: "President", photo: null, photoUrl: null, code: "LE-01", isTopLeadership: true },
      { name: "Shreya Rotti", role: "Vice President", photo: null, photoUrl: null, code: "LE-02", isTopLeadership: true },
    ];

export const DOMAINS_DATA = Array.isArray(GENERATED_DOMAINS_DATA) && GENERATED_DOMAINS_DATA.length
  ? GENERATED_DOMAINS_DATA
  : [
  {
    id: "technical",
    index: "01",
    name: "Technical",
    tagline: "Architecture, Systems & Quantum Computing",
    members: [
      { name: "Syed Maaz", role: "Head", photo: null, photoUrl: null, code: "TC-01", isHead: true },
      { name: "Jadyn", role: "Member", photo: null, photoUrl: null, code: "TC-02" },
      { name: "Prisha Ruturaj C", role: "Member", photo: null, photoUrl: null, code: "TC-03" },
      { name: "Vemala Prajwal", role: "Member", photo: null, photoUrl: null, code: "TC-04" },
      { name: "Haripriya Katabathina", role: "Member", photo: null, photoUrl: null, code: "TC-05" },
      { name: "Hiranmayi", role: "Member", photo: null, photoUrl: null, code: "TC-06" },
      { name: "Pranav Rohan", role: "Member", photo: null, photoUrl: null, code: "TC-07" },
      { name: "Farhan Akhtar", role: "Member", photo: null, photoUrl: null, code: "TC-08" },
      { name: "Janvika Malapati", role: "Member", photo: null, photoUrl: null, code: "TC-09" },
      { name: "Arnav Raj Karn", role: "Member", photo: null, photoUrl: null, code: "TC-10" },
    ],
  },
  {
    id: "administration",
    index: "02",
    name: "Administration",
    tagline: "Governance, Strategy & Internal Operations",
    members: [
      { name: "Haseena Tawfeeqa", role: "Head", photo: null, photoUrl: null, code: "AD-01", isHead: true },
      { name: "Raksha P", role: "Member", photo: null, photoUrl: null, code: "AD-02" },
      { name: "Rifa Anjum", role: "Member", photo: null, photoUrl: null, code: "AD-03" },
      { name: "LD Sai Charan", role: "Member", photo: null, photoUrl: null, code: "AD-04", imagePosition: "50% 18%" },
      { name: "Abhianv Deo", role: "Member", photo: null, photoUrl: null, code: "AD-05" },
      { name: "Karthik S Rao", role: "Member", photo: null, photoUrl: null, code: "AD-06" },
      { name: "Keerthana Bhat", role: "Member", photo: null, photoUrl: null, code: "AD-07" },
      { name: "D Ganesh", role: "Member", photo: null, photoUrl: null, code: "AD-08" },

    ],
  },
  {
    id: "design",
    index: "03",
    name: "Design",
    tagline: "Visual Identity, UI/UX & Creative Media",
    members: [
      { name: "Maaz", role: "Head", photo: null, photoUrl: null, code: "DS-01", isHead: true },
      { name: "Vaibhavi", role: "Head", photo: null, photoUrl: null, code: "DS-02", isHead: true },
      { name: "Melisha Dsouza", role: "Member", photo: null, photoUrl: null, code: "DS-03" },
      { name: "Anupriya Kumari", role: "Member", photo: null, photoUrl: null, code: "DS-04" },
      { name: "Swasti Jain", role: "Member", photo: null, photoUrl: null, code: "DS-05" },
      { name: "Shanmukhi Vytlaa", role: "Member", photo: null, photoUrl: null, code: "DS-06" },
      { name: "Dheshna M", role: "Member", photo: null, photoUrl: null, code: "DS-07" },
      { name: "Adhya", role: "Member", photo: null, photoUrl: null, code: "DS-08" },
      { name: "Kulsum", role: "Member", photo: null, photoUrl: null, code: "DS-09" },
      { name: "Arpita Thakur", role: "Member", photo: null, photoUrl: null, code: "DS-10" },
    ],
  },
  {
    id: "events",
    index: "04",
    name: "Events",
    tagline: "Hackathon Execution, Logistics & Stage Management",
    members: [
      { name: "Akshata Choudi", role: "Head", photo: null, photoUrl: null, code: "EV-01", isHead: true },
      { name: "Soham N Jain", role: "Member", photo: null, photoUrl: null, code: "EV-02" },
      { name: "Shreyas S Patil", role: "Member", photo: null, photoUrl: null, code: "EV-03" },
      { name: "Keerthana", role: "Member", photo: null, photoUrl: null, code: "EV-04" },
      { name: "Anya Miryam Camoens", role: "Member", photo: null, photoUrl: null, code: "EV-05" },
      { name: "M Hemanth Reddy", role: "Member", photo: null, photoUrl: null, code: "EV-06" },
      { name: "V Jayanth", role: "Member", photo: null, photoUrl: null, code: "EV-07" },
      { name: "Raksha Jagadeesha", role: "Member", photo: null, photoUrl: null, code: "EV-08" },
    ],
  },
  {
    id: "hospitality",
    index: "05",
    name: "Hospitality",
    tagline: "Guest Relations, Accommodations & VIP Care",
    members: [
      { name: "Deepthi M", role: "Head", photo: null, photoUrl: null, code: "HS-01", isHead: true },
      { name: "Akshay", role: "Member", photo: null, photoUrl: null, code: "HS-02" },
      { name: "Harshith D Raj", role: "Member", photo: null, photoUrl: null, code: "HS-03" },
    ],
  },
  {
    id: "marketing-and-sponsorship",
    index: "06",
    name: "Marketing And Sponsorship",
    tagline: "Corporate Partnerships, Outreach & Brand Growth",
    members: [
      { name: "Kotresh", role: "Head", photo: null, photoUrl: null, code: "MK-01", isHead: true },
      { name: "Rishiman Dadwal", role: "Member", photo: null, photoUrl: null, code: "MK-02" },
      { name: "T Lokeshwar Reddy", role: "Member", photo: null, photoUrl: null, code: "MK-03" },
      { name: "Varsha Sanjay", role: "Member", photo: null, photoUrl: null, code: "MK-04" },
      { name: "Baibhav Kumar", role: "Member", photo: null, photoUrl: null, code: "MK-05" },
      { name: "Ankit", role: "Member", photo: null, photoUrl: null, code: "MK-06" },
      { name: "Veeksha Reddy", role: "Member", photo: null, photoUrl: null, code: "MK-07" },
      { name: "Zainaba", role: "Member", photo: null, photoUrl: null, code: "MK-08" },
    ],
  },
  {
    id: "operations",
    index: "07",
    name: "Operations",
    tagline: "Resource Planning, Security & Venue Setup",
    members: [
      { name: "Vaibhavi L", role: "Head", photo: null, photoUrl: null, code: "OP-01", isHead: true },
      { name: "Dhruvisha", role: "Member", photo: null, photoUrl: null, code: "OP-02" },
      { name: "Sanjana N", role: "Member", photo: null, photoUrl: null, code: "OP-03" },
      { name: "Sri Charan", role: "Member", photo: null, photoUrl: null, code: "OP-04" },
      { name: "Mohammed Sohail Hussain", role: "Member", photo: null, photoUrl: null, code: "OP-05" },
      { name: "Manas Reddy", role: "Member", photo: null, photoUrl: null, code: "OP-06" },
      { name: "Aditi", role: "Member", photo: null, photoUrl: null, code: "OP-07" },
      { name: "Ritik Kumar Tiwary", role: "Member", photo: null, photoUrl: null, code: "OP-08" },
    ],
  },
  {
    id: "rnd",
    index: "08",
    name: "R&D",
    tagline: "Quantum Research, Whitepapers & Experimental Circuits",
    members: [
      { name: "Hari Narayan", role: "Head", photo: null, photoUrl: null, code: "RD-01", isHead: true },
      { name: "Dhruvajyoti Malik", role: "Member", photo: null, photoUrl: null, code: "RD-02" },
      { name: "Hana Fathima Ameen", role: "Member", photo: null, photoUrl: null, code: "RD-04" },
      { name: "Neha", role: "Member", photo: null, photoUrl: null, code: "RD-05" },
      { name: "Sharanya", role: "Member", photo: null, photoUrl: null, code: "RD-06" },
      { name: "Nanditha", role: "Member", photo: null, photoUrl: null, code: "RD-07" },
      { name: "A S Harish", role: "Member", photo: null, photoUrl: null, code: "RD-08" },
      { name: "Shreeya Attri", role: "Member", photo: null, photoUrl: null, code: "RD-09" },
      { name: "Kunal Kulkarni", role: "Member", photo: null, photoUrl: null, code: "RD-10" },
    ],
  },
  {
    id: "social-media",
    index: "09",
    name: "Social Media",
    tagline: "Digital Campaigns, Content Creation & Community",
    members: [
      { name: "Harshitha S", role: "Head", photo: null, photoUrl: null, code: "SM-01", isHead: true },
      { name: "Lingala Hasini Reddy", role: "Member", photo: null, photoUrl: null, code: "SM-02" },
      { name: "Haniel J Josephus", role: "Member", photo: null, photoUrl: null, code: "SM-03" },
      { name: "Varun Sharma", role: "Member", photo: null, photoUrl: null, code: "SM-04" },
      { name: "Tejas S Reddy", role: "Member", photo: null, photoUrl: null, code: "SM-05" },
      { name: "Mradul", role: "Member", photo: null, photoUrl: null, code: "SM-06" },
      { name: "Varsha R", role: "Member", photo: null, photoUrl: null, code: "SM-07" },
      { name: "Gayatri", role: "Member", photo: null, photoUrl: null, code: "SM-08" },
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
// PHOTO PENDING PLACEHOLDER (clean dim circle — shown when no photo matched)
// ─────────────────────────────────────────────────────────────────

export function PlaceholderSilhouette({ code = "Q-01" }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#08080E] select-none" aria-hidden="true">
      {/* Camera / photo icon */}
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 opacity-25">
        <circle cx="24" cy="24" r="23" stroke="rgba(245,89,10,0.5)" strokeWidth="1.5" strokeDasharray="5 3" />
        <path
          d="M17 20h-2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V22a2 2 0 0 0-2-2h-2l-2-3h-8l-2 3Z"
          stroke="rgba(245,89,10,0.6)"
          strokeWidth="1.5"
          fill="none"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="27" r="4" stroke="rgba(245,89,10,0.6)" strokeWidth="1.5" fill="none" />
      </svg>
      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#F5590A]/35">
        Photo Pending
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MEMBER CARD COMPONENT (Larger, Spacious, Big Avatar, High Contrast)
// ─────────────────────────────────────────────────────────────────

export function MemberCard({ member }) {
  const imagePosition =
    member.imagePosition ||
    (member.code === "DS-06"
      ? "50% 42%"
      : member.code === "EV-02"
        ? "38% 68%"
        : member.code === "MK-06"
          ? "50% 55%"
          : member.code === "OP-06"
            ? "50% 40%"
            : member.code === "OP-05"
              ? "50% 35%"
              : member.code === "OP-04"
                ? "50% 75%"
                : member.code === "SM-03"
                  ? "50% 68%"
                  : member.code === "RD-07"
                    ? "50% 68%"
                    : "50% 50%");

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
          {member.photo || member.photoUrl ? (
            <img
              src={member.photo || member.photoUrl}
              alt={member.name}
              style={{
                objectPosition: member.code === "AD-03" ? "52% 22%" : member.code === "DS-06" ? "50% 42%" : member.code === "EV-02" ? "38% 68%" : member.code === "MK-06" ? "50% 55%" : member.code === "OP-06" ? "50% 40%" : member.code === "OP-05" ? "50% 35%" : member.code === "OP-04" ? "50% 75%" : member.code === "SM-03" ? "50% 68%" : member.code === "RD-07" ? "50% 68%" : "50% 35%",
                transform: member.code === "AD-03" ? "translateX(2%) scale(1.18)" : member.code === "EV-02" ? "translateX(18%) scale(1.55)" : member.code === "OP-05" ? "translateY(14%) scale(1.35)" : member.code === "OP-04" ? "translateY(-18%) scale(1.15)" : member.code === "SM-03" ? "translateY(-8%) scale(1.18)" : member.code === "RD-07" ? "translateY(-5%) scale(1.1)" : undefined,
              }}
              className={`h-full w-full bg-[#08080E] object-cover transition-transform duration-500 ${member.code === "EV-02" ? "group-hover:scale-[1.6]" : member.code === "OP-05" ? "group-hover:scale-[1.4]" : member.code === "OP-04" ? "group-hover:scale-[1.2]" : "group-hover:scale-105"}`}
              loading="lazy"
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

export function View2D({ leadership = LEADERSHIP_DATA, faculty = FACULTY_DATA, domains = DOMAINS_DATA }) {
  return (
    <div className="space-y-24 sm:space-y-32 lg:space-y-36">
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

      <motion.section
        id="section-leadership"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.06 }}
        aria-label="Leadership"
        className="scroll-mt-32"
      >
        <SectionHeading
          index="01"
          title="Leadership"
          subtitle="Presidency & Executive Leadership"
          memberCount={leadership.length}
        />
        <MemberGrid members={leadership} />
      </motion.section>

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

export function View3D({ leadership = LEADERSHIP_DATA, faculty = FACULTY_DATA, domains = DOMAINS_DATA, view, onViewChange }) {
  const domainsFor3D = domains.filter((d) => d.id !== "core");
  return (
    <MembersTree3D leadership={leadership} faculty={faculty} domains={domainsFor3D} view={view} onViewChange={onViewChange} />
  );
}

// ─────────────────────────────────────────────────────────────────
// 2D / 3D TOGGLE SWITCH
// ─────────────────────────────────────────────────────────────────

export function ViewToggle({ view, onChange }) {
  return (
    <div
      className="inline-flex w-full max-w-[26rem] items-center gap-1 rounded-full border border-[#F5590A]/35 bg-[#08080E]/90 p-1.5 shadow-[0_0_25px_rgba(245,89,10,0.18)] backdrop-blur-xl sm:w-auto"
      role="group"
      aria-label="Select view mode"
    >
      <button
        type="button"
        onClick={() => onChange("2d")}
        aria-pressed={view === "2d"}
        className={`relative flex flex-1 items-center justify-center rounded-full px-5 py-2.5 font-mono text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 sm:px-8 ${
          view === "2d"
            ? "border border-[#F5590A]/60 bg-gradient-to-r from-[#F5590A] via-[#FF8A3D] to-[#EA580C] text-[#0A0A0A] shadow-[0_0_20px_rgba(245,89,10,0.6)]"
            : "text-stone-400 hover:text-white"
        }`}
      >
        2D Mode
      </button>

      <button
        type="button"
        onClick={() => onChange("3d")}
        aria-pressed={view === "3d"}
        className={`relative flex flex-1 items-center justify-center rounded-full px-5 py-2.5 font-mono text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 sm:px-8 ${
          view === "3d"
            ? "border border-[#F5590A]/60 bg-gradient-to-r from-[#F5590A] via-[#FF8A3D] to-[#EA580C] text-[#0A0A0A] shadow-[0_0_20px_rgba(245,89,10,0.6)]"
            : "text-stone-400 hover:text-white"
        }`}
      >
        3D Mode
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// QUICK DOMAIN JUMP NAVIGATOR CHIPS
// ─────────────────────────────────────────────────────────────────

function DomainQuickBar({ compact = false }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className={`${compact ? "mb-6 sticky top-0 z-20 -mx-1 px-2 pt-1" : "mb-14 pt-1"} overflow-x-auto pb-3 scrollbar-none`}>
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
        <button
          type="button"
          onClick={() => scrollTo("section-leadership")}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-xs font-semibold text-stone-300 hover:border-[#F5590A] hover:bg-[#F5590A]/10 hover:text-[#FF8A3D] transition-all"
        >
          Leadership
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
      {view === "2d" && <DomainQuickBar compact={compact} />}

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
