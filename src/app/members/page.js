"use client";

import MembersSection from "@/components/MembersSection";

export default function MembersPage() {
  return (
    <div className="relative min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-3 py-16 text-[#F2F2F2] sm:px-6 sm:py-24 lg:px-8">
      {/* Background Quantum Atmospheric Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-1/2 top-0 h-[700px] w-[1100px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[radial-gradient(circle,rgba(245,89,10,0.15)_0%,rgba(255,138,61,0.08)_50%,transparent_70%)] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-0 right-0 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(245,89,10,0.1)_0%,transparent_70%)] blur-3xl"
      />

      {/* Centered Floating Page Panel with Orange Border Glow & Corner Brackets */}
      <div className="relative z-10 mx-auto w-full max-w-[1440px] rounded-3xl border-2 border-[#F5590A]/80 bg-[#0C0C14]/98 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(245,89,10,0.3),0_0_35px_rgba(255,138,61,0.15)] sm:p-10 md:p-14">
        {/* Corner Registration Marks */}
        <span className="comic-corner-bracket comic-corner-bracket--tl" aria-hidden="true" />
        <span className="comic-corner-bracket comic-corner-bracket--tr" aria-hidden="true" />
        <span className="comic-corner-bracket comic-corner-bracket--bl" aria-hidden="true" />
        <span className="comic-corner-bracket comic-corner-bracket--br" aria-hidden="true" />

        <MembersSection showHeader={true} />
      </div>
    </div>
  );
}

