"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const navItems = [
  {
    label: "Home",
    href: "#home",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: "About",
    href: "#about",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    ),
  },
  {
    label: "Tracks",
    href: "#tracks",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
  },
  {
    label: "Timeline",
    href: "#timeline",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
      </svg>
    ),
  },
  {
    label: "Sponsors",
    href: "#sponsors",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    label: "Contact",
    href: "#contact",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
];

export default function MobileTaskbar() {
  const [activeSection, setActiveSection] = useState("home");

  function handleNavigation(event, href) {
    event.preventDefault();
    const section = document.getElementById(href.slice(1));
    if (!section) {
      window.location.assign(href);
      return;
    }

    section.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
    window.history.replaceState(null, "", href);
  }

  useEffect(() => {
    const sections = navItems
      .map(({ href }) => document.querySelector(href))
      .filter(Boolean);
    let frameId;
    const updateActiveSection = () => {
      frameId = undefined;
      const viewportCenter = window.innerHeight / 2;
      const closest = sections.reduce((current, section) => {
        const rect = section.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - viewportCenter);
        return !current || distance < current.distance ? { id: section.id, distance } : current;
      }, null);
      if (closest) setActiveSection(closest.id);
    };
    const handleScroll = () => {
      if (frameId === undefined) frameId = window.requestAnimationFrame(updateActiveSection);
    };
    updateActiveSection();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (frameId !== undefined) window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="mobile-taskbar fixed bottom-0 left-0 right-0 z-50 px-1.5 sm:hidden"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {navItems.map((item) => {
          const isActive = activeSection === item.href.slice(1);

          return (
            <a
              key={item.href}
              href={item.href}
              onClick={(event) => handleNavigation(event, item.href)}
              aria-current={isActive ? "page" : undefined}
              className={`mobile-taskbar-item ${isActive ? "is-active text-[#F5590A]" : "text-stone-400"}`}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-taskbar-active"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  className="absolute inset-x-0.5 inset-y-0.5 rounded-xl border border-[#F5590A]/25 bg-[#F5590A]/10 shadow-[0_0_16px_rgba(245,89,10,0.2)]"
                />
              )}

              <span
                className={`relative z-10 transition-[filter,color] duration-200 ${
                  isActive ? "drop-shadow-[0_0_8px_rgba(245,89,10,0.65)]" : ""
                }`}
              >
                {item.icon}
              </span>

              <span className="mobile-taskbar-label relative z-10">{item.label}</span>
              <span aria-hidden className="mobile-taskbar-dot" />
            </a>
          );
        })}
      </div>
    </nav>
  );
}
