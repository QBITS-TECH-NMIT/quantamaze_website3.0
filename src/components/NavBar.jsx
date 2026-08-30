"use client";

import { useState, useEffect, useCallback } from "react";
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

  const handleNavigation = useCallback(
    (event, href) => {
      if (event) event.preventDefault();

      if (pathname !== "/") {
        window.location.assign("/" + href);
        return;
      }

      const targetId = href.slice(1);
      if (targetId === "home") {
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
        });
        setActiveSection("home");
        window.history.replaceState(null, "", window.location.pathname);
        window.dispatchEvent(
          new CustomEvent("qam-section-change", { detail: "home" })
        );
        return;
      }

      const section = document.getElementById(targetId);
      if (!section) {
        window.location.assign("/" + href);
        return;
      }

      const navHeight = 70;
      const targetTop =
        section.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
      setActiveSection(targetId);
      window.history.replaceState(null, "", href);
      window.dispatchEvent(
        new CustomEvent("qam-section-change", { detail: targetId })
      );
    },
    [pathname]
  );

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

    let frameId;
    const updateActiveSection = () => {
      frameId = undefined;

      // Only perform scrollspy when on the home page
      if (window.location.pathname !== "/") return;

      const scrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      // 1. Near the top of page is unequivocally Home
      if (scrollY < 180) {
        setActiveSection("home");
        if (window.location.hash) {
          window.history.replaceState(null, "", window.location.pathname);
        }
        window.dispatchEvent(
          new CustomEvent("qam-section-change", { detail: "home" })
        );
        return;
      }

      // 2. Near the bottom of page is Contact
      if (scrollY + clientHeight >= scrollHeight - 60) {
        setActiveSection("contact");
        if (window.location.hash !== "#contact") {
          window.history.replaceState(null, "", "#contact");
        }
        window.dispatchEvent(
          new CustomEvent("qam-section-change", { detail: "contact" })
        );
        return;
      }

      // 3. Determine active section based on viewport visibility
      const sectionIds = [
        "home",
        "about",
        "tracks",
        "timeline",
        "sponsors",
        "contact",
      ];
      const headerOffset = 140;
      let currentSection = "";

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= headerOffset && rect.bottom > headerOffset) {
          currentSection = id;
          break;
        }
      }

      if (!currentSection) {
        const viewportMid = clientHeight * 0.4;
        let minDiff = Infinity;
        for (const id of sectionIds) {
          const el = document.getElementById(id);
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          const diff = Math.abs(rect.top - viewportMid);
          if (diff < minDiff) {
            minDiff = diff;
            currentSection = id;
          }
        }
      }

      if (currentSection) {
        setActiveSection(currentSection);
        const targetHash =
          currentSection === "home" ? "" : `#${currentSection}`;
        if (window.location.hash !== targetHash) {
          window.history.replaceState(
            null,
            "",
            currentSection === "home" ? window.location.pathname : targetHash
          );
        }
        window.dispatchEvent(
          new CustomEvent("qam-section-change", { detail: currentSection })
        );
      }
    };

    const handleSectionScroll = () => {
      if (frameId === undefined) {
        frameId = window.requestAnimationFrame(updateActiveSection);
      }
    };

    // Initial check with a slight delay to let hydration complete
    updateActiveSection();
    const timeoutId = window.setTimeout(updateActiveSection, 150);

    window.addEventListener("scroll", handleSectionScroll, { passive: true });
    window.addEventListener("resize", handleSectionScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("qam-modal-toggle", handleModalToggle);
      window.removeEventListener("scroll", handleSectionScroll);
      window.removeEventListener("resize", handleSectionScroll);
      window.clearTimeout(timeoutId);
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
        backgroundColor: scrolled
          ? "rgba(10, 10, 10, 0.84)"
          : "rgba(10, 10, 10, 0.62)",
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
        <a
          href="#home"
          onClick={(event) => handleNavigation(event, "#home")}
          className="group flex items-center transition-all cursor-pointer"
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
        </a>

        {/* Desktop Nav Links */}
        <nav
          className="hidden items-center gap-1 sm:flex"
          aria-label="Main Navigation"
        >
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.slice(1);

            return (
              <a
                key={link.href}
                href={link.href}
                onClick={(event) => handleNavigation(event, link.href)}
                className={`nav-link relative px-4 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer ${
                  isActive
                    ? "text-[#F5590A]"
                    : "text-stone-300 hover:text-[#FFA94D]"
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
