"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const easeOut = [0.16, 1, 0.3, 1];

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Tracks", href: "/tracks" },
  { label: "Timeline", href: "/timeline" },
  { label: "Sponsors", href: "/sponsors" },
  { label: "Contact", href: "/contact" },
];

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: easeOut }}
      style={{
        backgroundColor: scrolled ? "rgba(10, 10, 10, 0.84)" : "rgba(10, 10, 10, 0.62)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: scrolled
          ? "0 10px 30px -10px rgba(0, 0, 0, 0.7), 0 0 20px rgba(245, 89, 10, 0.06)"
          : "none",
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
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05, filter: "drop-shadow(0 0 12px rgba(245,89,10,0.5))" }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.2 }}
          >
            <Image
              src="/logo.png"
              alt="Q-Bits logo"
              width={130}
              height={44}
              priority
              className="h-8 w-auto object-contain transition-all duration-200 group-hover:brightness-110 sm:h-9"
            />
          </motion.div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden items-center gap-1 sm:flex" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
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
              </Link>
            );
          })}
        </nav>
      </div>
    </motion.header>
  );
}
