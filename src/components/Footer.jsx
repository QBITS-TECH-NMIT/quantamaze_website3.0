"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function Footer() {
  const pathname = usePathname();

  const handleLinkClick = (e, href) => {
    if (href.startsWith("#")) {
      if (pathname !== "/") {
        return; // standard Link navigation will route to /#section
      }
      e.preventDefault();
      const targetId = href.slice(1);
      if (targetId === "home") {
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
        });
        window.history.replaceState(null, "", "/");
        return;
      }
      const el = document.getElementById(targetId);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({
          top: Math.max(0, top),
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
        });
        window.history.replaceState(null, "", href);
      }
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  const quickLinks = [
    { label: "Home", href: "/#home" },
    { label: "About", href: "/#about" },
    { label: "Tracks", href: "/#tracks" },
    { label: "Games", href: "/#games" },
    { label: "Timeline", href: "/#timeline" },
    { label: "Sponsors", href: "/#sponsors" },
    { label: "FAQ", href: "/#faq" },
    { label: "Events", href: "/about#events" },
    { label: "Members", href: "/members" },
  ];

  const socialLinks = [
    {
      label: "Instagram",
      href: "https://www.instagram.com/qbits_nmit",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      ),
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/company/qbitsnmit/",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect width="4" height="12" x="2" y="9" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      ),
    },
    {
      label: "Email",
      href: "mailto:qbits@nmit.ac.in",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      ),
    },
    {
      label: "Location",
      href: "https://maps.app.goo.gl/pkDx8uXamDoN21jx7",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
    },
  ];

  return (
    <footer
      id="footer"
      className="relative z-20 border-t border-white/10 bg-[#07070A] text-[#F2F2F2]"
    >
      {/* Top glowing ambient gradient bar */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F5590A]/60 to-transparent"
      />

      {/* Ambient background glow bloblets */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/4 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(245,89,10,0.06)_0%,transparent_70%)] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-10 h-60 w-60 rounded-full bg-[radial-gradient(circle,rgba(255,183,3,0.04)_0%,transparent_70%)] blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        {/* 4-Column Responsive Grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-12">
          
          {/* Column 1: Club Branding (lg: 5 cols) */}
          <div className="flex flex-col lg:col-span-5">
            <Link
              href="/#home"
              onClick={(e) => handleLinkClick(e, "#home")}
              className="inline-flex items-center gap-3 transition-opacity hover:opacity-90"
              aria-label="Q-Bits Home"
            >
              <Image
                src="/navbar-banner.png"
                alt="NITTE University and Q-BITS Quantum Tech Club"
                width={260}
                height={58}
                className="h-10 w-auto object-contain sm:h-11"
              />
            </Link>

            <p className="mt-4 max-w-sm text-xs leading-relaxed text-stone-400 sm:text-sm">
              India&apos;s premier student quantum technology club at Nitte (Deemed to be University). Exploring Quantum Computing, AI, Web3, and Post-Quantum Cryptography.
            </p>

            {/* Social Icons */}
            <div className="mt-6 flex items-center gap-2.5">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-stone-300 transition-all duration-200 hover:border-[#F5590A]/50 hover:bg-[#F5590A]/15 hover:text-[#FFA94D] hover:shadow-[0_0_14px_rgba(245,89,10,0.3)]"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links (lg: 3 cols) */}
          <div className="flex flex-col lg:col-span-3">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#F5590A]">
              {"// Quick Links"}
            </p>
            <ul className="mt-4 space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={(e) => {
                      if (link.href.startsWith("/#")) {
                        handleLinkClick(e, link.href.replace("/", ""));
                      }
                    }}
                    className="group inline-flex items-center gap-2 text-xs font-medium text-stone-400 transition-colors duration-200 hover:text-[#FFA94D] sm:text-sm"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#F5590A]/40 transition-colors group-hover:bg-[#F5590A] group-hover:shadow-[0_0_6px_#F5590A]" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact (lg: 4 cols) */}
          <div className="flex flex-col lg:col-span-4">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#F5590A]">
              {"// Contact Us"}
            </p>

            <div className="mt-4 space-y-3 text-xs sm:text-sm">
              {/* Email */}
              <a
                href="mailto:qbits@nmit.ac.in"
                className="group flex items-center gap-2.5 text-stone-300 transition-colors hover:text-[#FFA94D]"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-[#F5590A] transition-colors group-hover:border-[#F5590A]/40">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <span className="truncate font-mono">qbits@nmit.ac.in</span>
              </a>

              {/* Phone Contacts */}
              <div className="space-y-2 pt-1">
                <a
                  href="tel:+919972013931"
                  className="group flex items-center gap-2.5 text-stone-300 transition-colors hover:text-[#FFA94D]"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-[#F5590A] transition-colors group-hover:border-[#F5590A]/40">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </span>
                  <div>
                    <span className="font-bold text-white">Shikhar: </span>
                    <span className="font-mono text-stone-400">+91 99720 13931</span>
                  </div>
                </a>

                <a
                  href="tel:+919901207409"
                  className="group flex items-center gap-2.5 text-stone-300 transition-colors hover:text-[#FFA94D]"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-[#F5590A] transition-colors group-hover:border-[#F5590A]/40">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </span>
                  <div>
                    <span className="font-bold text-white">Maaz: </span>
                    <span className="font-mono text-stone-400">+91 99012 07409</span>
                  </div>
                </a>
              </div>

              {/* Location */}
              <div className="pt-2 text-xs leading-relaxed text-stone-400">
                <span className="font-semibold text-stone-300">Venue: </span>
                Nitte (Deemed to be University), Yelahanka, Bangalore - 560064
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.08] pt-8 text-xs text-stone-500 sm:flex-row sm:text-sm">
          <p className="font-mono text-center sm:text-left">
            © {new Date().getFullYear()} Q-Bits Quantum Technology Club. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <span className="hidden font-mono text-xs text-stone-500 sm:inline-block">
              Engineered with Quantum Energy
            </span>
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-stone-400 transition-colors hover:text-[#FFA94D]"
              aria-label="Scroll back to top of page"
            >
              <span>Back to Top</span>
              <span className="text-[#F5590A]" aria-hidden="true">↑</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
