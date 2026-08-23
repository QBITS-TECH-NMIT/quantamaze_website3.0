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
        className="brochure-section relative flex flex-1 items-center justify-center overflow-hidden bg-[#0A0A0A] py-16 text-[#F2F2F2] sm:py-32"
      >
        <div className="relative mx-auto w-full max-w-3xl text-center">
          <Reveal>
            <div className="mb-4 inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[0.62rem] font-mono tracking-[0.16em] text-stone-400 sm:px-3.5 sm:text-[0.68rem] sm:tracking-[0.2em]">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#F5590A] animate-pulse" />
              <span>STATUS // REGISTRATIONS_OPEN</span>
            </div>

            <p className="section-kicker mb-4 justify-center">Stay connected</p>
            <h1 className="display-heading gradient-text mb-6 text-3xl font-bold sm:mb-8 sm:text-5xl">
              Contact Us
            </h1>
            <p className="mx-auto mb-10 max-w-xl px-1 text-sm leading-relaxed text-stone-400 sm:mb-12 sm:text-base">
              Have questions about Quant-A-Maze 3.0, problem tracks, or team registrations? Connect directly with the Q-Bits organizing team.
            </p>
          </Reveal>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="flex flex-wrap justify-center gap-4 px-1 sm:gap-7"
          >
            {contacts.map((c) => (
              <motion.a
                key={c.label}
                variants={{
                  hidden: { opacity: 0, scale: 0.4, y: 20 },
                  show: {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    transition: { type: "spring", stiffness: 300, damping: 18 },
                  },
                }}
                whileHover={{ scale: 1.08, opacity: 1, borderColor: "rgba(245,89,10,0.8)" }}
                whileTap={{ scale: 0.94 }}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                title={c.label}
                aria-label={c.label}
                className="contact-icon contact-icon-link flex items-center justify-center rounded-full border border-white/15 bg-white/[0.03] opacity-75 backdrop-blur-md transition-all hover:border-[#F5590A] hover:bg-[#F5590A]/10 hover:opacity-100 hover:shadow-[0_0_20px_rgba(245,89,10,0.35)]"
              >
                <Image src={c.icon} alt="" width={48} height={48} className="h-7 w-7 object-contain sm:h-8 sm:w-8" />
              </motion.a>
            ))}
          </motion.div>

          <div className="mt-16 border-t border-white/10 pt-8 text-sm text-stone-500 font-mono sm:mt-20">
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
