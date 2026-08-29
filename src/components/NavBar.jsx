"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const easeOut = [0.16, 1, 0.3, 1];

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Tracks", href: "#tracks" },
  { label: "Timeline", href: "#timeline" },
  { label: "Sponsors", href: "#sponsors" },
  { label: "Contact", href: "#contact" },
];

export default function NavBar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [modalOpen, setModalOpen] = useState(false);

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
    window.history.replaceState(null, "", href === "#home" ? "/" : href);
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    const handleModalToggle = (event) => {
      if (typeof event.detail?.open === "boolean") {
        setModalOpen(event.detail.open);
      }
    };
    window.addEventListener("qam-modal-toggle", handleModalToggle);

    const sections = navLinks
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
      if (closest) {
        setActiveSection(closest.id);
        const nextUrl = closest.id === "home" ? window.location.pathname : `#${closest.id}`;
        if (window.location.hash !== (closest.id === "home" ? "" : nextUrl)) {
          window.history.replaceState(null, "", nextUrl);
        }
        window.dispatchEvent(
          new CustomEvent("qam-section-change", { detail: closest.id }),
        );
      }
    };
    const handleSectionScroll = () => {
      if (frameId === undefined) frameId = window.requestAnimationFrame(updateActiveSection);
    };
    updateActiveSection();
    window.addEventListener("scroll", handleSectionScroll, { passive: true });
    window.addEventListener("resize", handleSectionScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("qam-modal-toggle", handleModalToggle);
      window.removeEventListener("scroll", handleSectionScroll);
      window.removeEventListener("resize", handleSectionScroll);
      if (frameId !== undefined) window.cancelAnimationFrame(frameId);
    };
  }, []);

  const shouldHideNav = modalOpen || pathname === "/members";

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{
        y: shouldHideNav ? -100 : 0,
        opacity: shouldHideNav ? 0 : 1,
      }}
      transition={{ duration: 0.35, ease: easeOut }}
      style={{
        backgroundColor: scrolled ? "rgba(10, 10, 10, 0.84)" : "rgba(10, 10, 10, 0.62)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: scrolled
          ? "0 10px 30px -10px rgba(0, 0, 0, 0.7), 0 0 20px rgba(245, 89, 10, 0.06)"
          : "none",
        pointerEvents: shouldHideNav ? "none" : "auto",
      }}
      className="fixed left-0 right-0 top-0 z-50 border-b border-white/[0.08] transition-all duration-300"
    >
      {/* Subtle animated traveling glow line along the bottom border */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-[1px] overflow-hidden"
      >
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="h-full w-1/3 bg-gradient-to-r from-transparent via-[#F5590A]/80 to-transparent"
        />
      </div>

      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-4 transition-all duration-300 sm:px-10 ${
          scrolled ? "py-2.5" : "py-3.5 sm:py-4"
        }`}
      >
        {/* Brand Logo Banner */}
        <motion.a
          href="#home"
          whileHover={{ scale: 1.03, filter: "drop-shadow(0 0 14px rgba(245,89,10,0.45))" }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className="group flex items-center transition-all"
          aria-label="Quant-A-Maze 3.0 Home - NITTE and Q-BITS"
        >
          <Image
            src="/navbar-banner.png"
            alt="NITTE University and Q-BITS Quantum Tech Club"
            width={280}
            height={62}
            priority
            className="h-10 w-auto object-contain transition-all duration-200 group-hover:brightness-110 sm:h-12"
          />
        </motion.a>

        {/* Desktop Nav Links */}
        <nav className="hidden items-center gap-1 sm:flex" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.slice(1);

            return (
              <a
                key={link.href}
                href={link.href}
                onClick={(event) => handleNavigation(event, link.href)}
                className={`nav-link relative px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive ? "text-[#F5590A]" : "text-stone-300 hover:text-[#FFA94D]"
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-active-pill"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute -bottom-1 left-3 right-3 h-[2px] rounded-full bg-[#F5590A] shadow-[0_0_10px_#F5590A]"
                  />
                )}
              </a>
            );
          })}
        </nav>
      </div>
    </motion.header>
  );
}
