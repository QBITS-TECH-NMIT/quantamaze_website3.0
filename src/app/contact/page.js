"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Reveal, staggerContainer, staggerItem } from "@/components/MotionPrimitives";

export default function ContactPage() {
  const contacts = [
    {
      icon: "/contact-instagram.png",
      href: "https://www.instagram.com/qbits_nmit",
      label: "Instagram",
    },
    {
      icon: "/contact-linkedin.png",
      href: "https://www.linkedin.com/company/qbitsnmit/",
      label: "LinkedIn",
    },
    {
      icon: "/contact-mail.png",
      href: "https://mail.google.com/mail/?view=cm&fs=1&to=qbits@nmit.ac.in",
      label: "Email",
    },
    {
      icon: "/contact-discord.png",
      href: "https://www.discord.com/invite/pJB5zKGPZt",
      label: "Discord",
    },
    {
      icon: "/contact-map.png",
      href: "https://www.google.com/maps/place/Nitte+Meenakshi+Institute+of+Technology/@13.1294627,77.5850839,17z/data=!3m1!4b1!4m6!3m5!1s0x3bae170d10bb559b:0x2bb3892a626cf9ba!8m2!3d13.1294627!4d77.5876588!16zL20vMGcxdG13?entry=ttu&g_ep=EgoyMDI2MDgwNS4xIKXMDSoASAFQAw%3D%3Dhttps://maps.app.goo.gl/pkDx8uXamDoN21jx7",
      label: "Location",
    },
  ];

  return (
    <div className="relative flex min-h-screen flex-col justify-between pt-20 sm:pt-24">
      <section
        id="contact"
        className="brochure-section relative flex flex-1 items-center justify-center overflow-hidden bg-[#0A0A0A] px-6 py-16 text-[#F2F2F2] sm:py-24 md:px-12 lg:py-32"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,107,26,0.08),transparent_70%)]" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
        <div className="relative mx-auto w-full max-w-3xl text-center">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} className="flex flex-col items-center">
            <motion.div variants={staggerItem} className="mb-6 inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-[#F5590A]/20 bg-black/40 px-4 py-2 font-mono text-xs tracking-wide text-stone-300 shadow-[0_0_28px_rgba(245,89,10,0.08)] backdrop-blur-md sm:mb-8 sm:text-sm">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#F5590A] shadow-[0_0_10px_3px_rgba(245,89,10,0.45)] animate-pulse" />
              <span>STATUS // REGISTRATIONS_OPEN</span>
            </motion.div>

            <motion.p variants={staggerItem} className="section-kicker mb-5 justify-center text-xs font-semibold tracking-[0.2em] text-[#F5590A] sm:text-sm">Stay connected</motion.p>
            <motion.h1 variants={staggerItem} className="display-heading gradient-text mb-6 text-5xl font-extrabold tracking-tight drop-shadow-[0_0_30px_rgba(255,107,26,0.3)] sm:mb-8 sm:text-6xl md:text-7xl">
              Contact Us
            </motion.h1>
            <motion.p variants={staggerItem} className="mx-auto mb-10 mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:mb-12 sm:text-base">
              Have questions about Quant-A-Maze 3.0, problem tracks, or team registrations? Connect directly with the Q-Bits organizing team.
            </motion.p>

          <motion.div
            variants={staggerContainer}
            className="flex flex-wrap justify-center gap-5 px-1 sm:gap-6"
          >
            {contacts.map((c) => (
              <motion.a
                key={c.label}
                variants={staggerItem}
                whileHover={{ y: -5, scale: 1.1 }}
                whileTap={{ scale: 0.94 }}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={c.label}
                className="contact-icon contact-icon-link group relative flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-gray-400 opacity-100 backdrop-blur-sm transition-all duration-300 hover:border-[#F5590A]/40 hover:bg-[#F5590A]/10 hover:text-[#FFA94D] hover:shadow-[0_0_20px_rgba(255,107,26,0.3)]"
              >
                <Image src={c.icon} alt="" width={48} height={48} className="h-7 w-7 object-contain opacity-80 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0 sm:h-8 sm:w-8" />
                <motion.span initial={{ opacity: 0, y: 6 }} whileHover={{ opacity: 1, y: 0 }} className="pointer-events-none absolute top-full mt-3 whitespace-nowrap rounded-full border border-white/10 bg-black/70 px-3 py-1 font-mono text-[10px] tracking-wide text-gray-200 opacity-0 backdrop-blur-md">
                  {c.label}
                </motion.span>
              </motion.a>
            ))}
          </motion.div>

          </motion.div>

          <div className="mt-14 border-t border-white/10 pt-8 text-sm font-mono text-stone-500 sm:mt-16">
            <p>Q-Bits, Quantum Technology Club at NMIT Bangalore</p>
            <p className="mt-2 text-xs">
              Developed by Q-Bits <span className="mx-2 text-[#F5590A]/60">/</span> Copyright 2026
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
