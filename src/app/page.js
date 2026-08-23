"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useInView,
  number,
} from "framer-motion";

const TARGET_DATE = new Date("2026-10-28T00:00:00+05:30");

function getTimeLeft() {
  const now = new Date();
  const diff = TARGET_DATE - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds };
}

/* ---------------------------------------------------------
   Shared motion primitives
--------------------------------------------------------- */

const easeOut = [0.16, 1, 0.3, 1];

function Reveal({ children, delay = 0, y = 32, className, once = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.25 }}
      transition={{ duration: 0.7, delay, ease: easeOut }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
};

function Counter({ value, suffix = "", duration = 1400 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let raf;
    let start = null;

    function step(ts) {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * value));
      if (progress < 1) raf = requestAnimationFrame(step);
      else setDisplay(value);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isInView, value, duration]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

/* Flip-style animated digit block for the countdown */
function FlipUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[1em] overflow-hidden text-3xl leading-none sm:text-7xl">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.45, ease: easeOut }}
            className="block leading-none font-mono font-bold text-orange-500"
          >
            {String(value).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-2 text-[10px] uppercase tracking-[0.12em] text-zinc-400 sm:text-base sm:tracking-widest">
        {label}
      </span>
    </div>
  );
}

/* ---------------------------------------------------------
   Scroll progress bar
--------------------------------------------------------- */

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      style={{ scaleX: scrollYProgress }}
      className="fixed top-0 left-0 right-0 h-[3px] origin-left bg-gradient-to-r from-orange-600 via-orange-400 to-yellow-300 z-[60]"
    />
  );
}

/* ---------------------------------------------------------
   NavBar
--------------------------------------------------------- */

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const navPaddingY = useTransform(scrollY, [0, 120], [16, 8]);
  const navBg = useTransform(
    scrollY,
    [0, 120],
    ["rgba(0,0,0,0.30)", "rgba(0,0,0,0.65)"]
  );

  const links = [
    { label: "Home", id: "home" },
    { label: "About", id: "about" },
    { label: "Tracks", id: "tracks" },
    { label: "Timeline", id: "timeline" },
    { label: "Sponsors", id: "sponsors" },
    { label: "Contact", id: "contact" },
  ];

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: easeOut }}
      style={{ backgroundColor: navBg }}
      className="fixed top-4 left-4 right-4 sm:left-10 sm:right-10 z-50 rounded-2xl backdrop-blur-md"
    >
      <motion.div
        style={{ paddingTop: navPaddingY, paddingBottom: navPaddingY }}
        className="flex items-center justify-between px-4 sm:px-8"
      >
        <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.97 }}>
          <Image
            src="/logo.png"
            alt="Q-Bits logo"
            width={140}
            height={48}
            className="h-auto w-28 sm:w-[140px]"
          />
        </motion.div>

        <div className="hidden sm:flex gap-8 text-base font-medium">
          {links.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="relative text-zinc-300 hover:text-orange-500 transition-colors group"
            >
              {link.label}
              <span className="absolute left-0 -bottom-1 h-px w-0 bg-orange-500 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden text-white text-2xl"
          aria-label="Toggle menu"
        >
          <motion.span
            animate={{ rotate: menuOpen ? 90 : 0 }}
            transition={{ duration: 0.25 }}
            className="inline-block"
          >
            {menuOpen ? "✕" : "☰"}
          </motion.span>
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: easeOut }}
            className="sm:hidden overflow-hidden"
          >
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="flex flex-col items-center gap-4 pb-6 pt-2"
            >
              {links.map((link) => (
                <motion.a
                  key={link.id}
                  variants={staggerItem}
                  href={`#${link.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="text-zinc-300 hover:text-orange-500 transition-colors text-lg"
                >
                  {link.label}
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

/* ---------------------------------------------------------
   Home / Hero
--------------------------------------------------------- */

function HomeSection() {
  const [timeLeft, setTimeLeft] = useState(null);
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: real countdown must only be computed client-side to avoid SSR/client time mismatch
    setTimeLeft(getTimeLeft());
    const interval = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  const display = timeLeft ?? { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black px-4 pt-24 text-white sm:px-6"
    >
      <motion.video
        initial={{ scale: 1.15, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.4 }}
        transition={{ duration: 2.2, ease: easeOut }}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/fire-bg.mp4" type="video/mp4" />
      </motion.video>
      <div className="absolute inset-0 bg-black/50" />

      {/* floating ember glows for depth */}
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/5 w-72 h-72 rounded-full bg-orange-600/20 blur-[100px] pointer-events-none"
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-1/5 w-80 h-80 rounded-full bg-yellow-500/10 blur-[110px] pointer-events-none"
      />

      <motion.div
        style={{ y: contentY }}
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="relative flex flex-col items-center"
      >
        <motion.h1
          variants={staggerItem}
          animate={{
            textShadow: [
              "0 0 25px rgba(249,115,22,0.6)",
              "0 0 45px rgba(249,115,22,0.9)",
              "0 0 25px rgba(249,115,22,0.6)",
            ],
          }}
          transition={{
            textShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          }}
          whileHover={{ scale: 1.05 }}
          className="cursor-default text-center text-4xl font-bold tracking-tight text-orange-500 sm:text-8xl"
        >
          QUANT-A-MAZE 3.0
        </motion.h1>

        <motion.p
          variants={staggerItem}
          className="mt-6 text-center text-xl text-zinc-200 sm:text-3xl"
        >
          A 36-Hour National-Level Hackathon
        </motion.p>

        <motion.p
          variants={staggerItem}
          className="mt-3 text-lg sm:text-xl text-zinc-400 text-center"
        >
          Something exciting is coming...
        </motion.p>

        <motion.p
          variants={staggerItem}
          className="mt-6 text-lg sm:text-6xl font-semibold text-orange-400 text-center"
        >
          OCT 28
        </motion.p>

        <motion.p
          variants={staggerItem}
          className="text-base sm:text-lg text-zinc-300 text-center"
        >
          Nitte Meenakshi Institute of Technology, Bangalore
        </motion.p>

        <motion.div
          variants={staggerItem}
          className="mt-12 flex w-full justify-center gap-2 sm:mt-16 sm:gap-12"
        >
          <FlipUnit value={display.days} label="Days" />
          <FlipUnit value={display.hours} label="Hours" />
          <FlipUnit value={display.minutes} label="Minutes" />
          <FlipUnit value={display.seconds} label="Seconds" />
        </motion.div>
      </motion.div>

      <motion.div
        style={{ opacity: scrollHintOpacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-400"
      >
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <motion.svg
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </motion.svg>
      </motion.div>
    </section>
  );
}

/* ---------------------------------------------------------
   About
--------------------------------------------------------- */

function AboutSection() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  const stats = [
    { value: 120, suffix: "+", label: "Participants" },
    { value: 400, suffix: "+", label: "Applications" },
    { value: 100, suffix: "%", label: "Positive Feedback" },
    { value: 10, suffix: "+", label: "Industry Experts" },
  ];

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative flex min-h-screen items-center overflow-hidden bg-black px-4 py-24 text-white sm:px-6 sm:py-32"
    >
      <motion.img
        src="/abt_theme.jpg"
        alt=""
        className="absolute inset-0 w-full h-[120%] -top-[10%] object-cover opacity-30"
        style={{
          y: imgY,
          maskImage: "linear-gradient(to top, transparent, black 40%)",
          WebkitMaskImage: "linear-gradient(to top, transparent, black 40%)",
        }}
      />

      <div className="relative mx-auto max-w-4xl text-center">
        <Reveal>
          <h2 className="mb-8 text-4xl font-bold text-orange-500 sm:mb-10 sm:text-6xl">
            About Us
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="text-lg leading-relaxed text-zinc-300 sm:text-xl">
            Q-Bits is the official Quantum Technology Club of Nitte Meenakshi
            Institute of Technology (NMIT), anchored within the Department of
            Electrical & Electronics Engineering. We provide resources for
            students who are just beginning to explore quantum computing, all
            the way to advanced learners pursuing projects, internships, and
            research. Through hands-on learning and real-world applications,
            Q-Bits bridges the gap between theory and practice — hosting
            hackathons, workshops, expert talks, and industry collaborations
            throughout the year.
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mt-6 text-base leading-relaxed text-zinc-400 sm:text-lg">
            Quant-A-Maze 3.0 is presented in partnership with{" "}
            <span className="text-orange-400 font-medium">
              KwantumG Research Labs
            </span>
            , bringing industry-grade mentorship in quantum computing, quantum
            machine learning, and applied research to every participant.
          </p>
        </Reveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-8 sm:mt-12 sm:gap-x-14"
        >
          {stats.map((s) => (
            <motion.div
              key={s.label}
              variants={staggerItem}
              className="flex flex-col items-center"
            >
              <span className="text-3xl font-bold text-orange-500 sm:text-5xl">
                <Counter value={s.value} suffix={s.suffix} />
              </span>
              <span className="text-base sm:text-lg text-white">
                {s.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------
   Tracks
--------------------------------------------------------- */

function TracksSection() {
  const tracks = [
    {
      title: "Quantum Machine Learning (QML)",
      desc: "Step into the future where quantum computing meets artificial intelligence. Build hybrid quantum-classical models using frameworks like Qiskit, PennyLane, and TensorFlow Quantum.",
      icon: "/track-quantum.svg",
    },
    {
      title: "Post-Quantum Cryptography (PQC)",
      desc: "The quantum era is coming — are our systems ready? Design quantum-resistant encryption, digital signatures, and secure communication protocols for tomorrow's threats.",
      icon: "/lock.png",
    },
    {
      title: "Web3 & Blockchain",
      desc: "Shape the decentralized future. Develop smart contracts, dApps, DeFi platforms, and Web3 innovations using Ethereum, Solidity, Polygon, and IPFS.",
      icon: "/track-web3.svg",
    },
    {
      title: "Generative AI & ML",
      desc: "Transform data into intelligent solutions. Build AI copilots, predictive models, and NLP applications using LLMs, TensorFlow, PyTorch, and LangChain.",
      icon: "/track-genai.svg",
    },
  ];

  return (
    <section id="tracks" className="min-h-screen bg-zinc-950 px-4 py-24 text-white sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="mb-10 text-center text-4xl font-bold text-orange-500 sm:mb-16 sm:text-6xl">
            Tracks
          </h2>
        </Reveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="grid sm:grid-cols-2 gap-8"
        >
          {tracks.map((track) => (
            <motion.div
              key={track.title}
              variants={staggerItem}
              whileHover={{
                y: -8,
                scale: 1.015,
                borderColor: "rgba(249,115,22,0.6)",
                boxShadow: "0 20px 45px -15px rgba(249,115,22,0.35)",
              }}
              transition={{ type: "spring", stiffness: 250, damping: 20 }}
              className="rounded-2xl border border-orange-500/20 bg-black/40 p-6 sm:p-8"
            >
              {track.icon && (
                <motion.div
                  whileHover={{ rotate: 8, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="mb-5 w-16 h-16"
                >
                  <Image
                    src={track.icon}
                    alt={track.title}
                    width={64}
                    height={64}
                  />
                </motion.div>
              )}
              <h3 className="text-2xl font-semibold text-orange-400 mb-3">
                {track.title}
              </h3>
              <p className="text-zinc-400 text-base leading-relaxed">
                {track.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------
   Timeline
--------------------------------------------------------- */

function TimelineSection() {
  const events = [
    { title: "Registration", date: "September 7 – 28" },
    { title: "Phase 1", date: "September 7 – 28" },
    { title: "Phase 1 Results", date: "October 3" },
    { title: "Phase 2", date: "October 28 – 30" },
    { title: "Final Results", date: "October 30" },
  ];

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "end 0.6"],
  });

  return (
    <section id="timeline" className="min-h-screen bg-black px-4 py-24 text-white sm:px-6 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <h2 className="mb-10 text-center text-4xl font-bold text-orange-500 sm:mb-16 sm:text-6xl">
            Timeline
          </h2>
        </Reveal>

        <div ref={containerRef} className="relative">
          <div className="absolute top-2 bottom-15 left-2 w-px bg-orange-500/15" />
          <motion.div
            style={{ scaleY: scrollYProgress, transformOrigin: "top" }}
            className="absolute top-2 bottom-15 left-2 w-px bg-gradient-to-b from-orange-400 via-orange-500 to-yellow-400 shadow-[0_0_8px_rgba(249,115,22,0.6)]"
          />
          <div className="space-y-17">
            {events.map((event, i) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: easeOut }}
                className="relative pl-10"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{
                    delay: i * 0.08 + 0.15,
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                  }}
                  className="absolute left-2 top-2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.8)]"
                />
                <h3 className="text-xl font-semibold text-white sm:text-2xl">
                  {event.title}
                </h3>
                <p className="mt-1 text-base text-zinc-400 sm:text-lg">{event.date}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------
   Sponsors
--------------------------------------------------------- */

function SponsorsSection() {
  const sponsorCardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease: easeOut },
    },
  };

  const sponsors = [
    {
      name: "",
      logo: "",
      details: "",
      href: "",
    },
    {
      name: "",
      logo: "",
      details: "",
      href: "",
    },
    {
      name: "",
      logo: "",
      details: "",
      href: "",
    },
  ];

  return (
    <section
      id="sponsors"
      className="relative overflow-hidden bg-zinc-950 px-4 py-24 text-white sm:px-6 sm:py-32"
    >
      <motion.video
        initial={{ scale: 1.15, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.4 }}
        transition={{ duration: 2.2, ease: easeOut }}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      >
        <source src="/fire-bg.mp4" type="video/mp4" />
      </motion.video>
      <div className="pointer-events-none absolute inset-0 bg-black/60" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />
      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-orange-400">
              Built together
            </p>
            <h2 className="mb-6 text-4xl font-bold text-orange-500 sm:text-6xl">
              Our Sponsors
            </h2>
            <p className="text-base leading-relaxed text-zinc-400 sm:text-xl">
              The people and organizations helping the next generation explore
              what is possible with technology.
            </p>
          </Reveal>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-12 grid gap-5 sm:mt-16 md:grid-cols-3"
        >
          {sponsors.map((sponsor) => {
            const sponsorContent = (
              <>
                <motion.div
                  whileHover={{ scale: 1.025 }}
                  transition={{ duration: 0.25, ease: easeOut }}
                  className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-orange-500/30 bg-black/30 px-6"
                >
                  {sponsor.logo ? (
                    <Image
                      src={sponsor.logo}
                      alt={`${sponsor.name} logo`}
                      width={220}
                      height={96}
                      className="max-h-24 w-auto object-contain"
                    />
                  ) : (
                    <span className="text-center text-sm font-medium uppercase tracking-[0.22em] text-zinc-600">
                      Logo placement
                    </span>
                  )}
                </motion.div>
                <div className="mt-5 sm:mt-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-400">
                    {sponsor.tier}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold text-white sm:text-2xl">
                    {sponsor.name || "Sponsor name"}
                  </h3>
                  <p className="mt-3 min-h-14 text-sm leading-relaxed text-zinc-400">
                    {sponsor.details ||
                      "Add a short introduction, contribution, or website description here."}
                  </p>
                </div>
              </>
            );

            return sponsor.href ? (
              <motion.a
                key={sponsor.tier}
                variants={sponsorCardVariants}
                whileHover={{ y: -4, borderColor: "rgba(249,115,22,0.65)" }}
                whileTap={{ scale: 0.99 }}
                href={sponsor.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-orange-500/20 bg-black/40 p-6 transition-shadow hover:shadow-[0_20px_45px_-20px_rgba(249,115,22,0.6)]"
              >
                {sponsorContent}
              </motion.a>
            ) : (
              <motion.div key={sponsor.tier}
                variants={sponsorCardVariants}
                whileHover={{ y: -4, borderColor: "rgba(249,115,22,0.65)" }}
                className="rounded-2xl border border-orange-500/20 bg-black/40 p-6 transition-shadow hover:shadow-[0_20px_45px_-20px_rgba(249,115,22,0.6)]"
                 >
                {sponsorContent}
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}


/* ---------------------------------------------------------
   Contact
--------------------------------------------------------- */

function ContactSection() {
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
    <section id="contact" className="flex min-h-screen items-center bg-black px-4 py-24 text-white sm:px-6 sm:py-32">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <h2 className="mb-8 text-4xl font-bold text-orange-500 sm:text-6xl">
            Contact Us
          </h2>
        </Reveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          className="flex justify-center gap-8 flex-wrap"
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
              whileHover={{ scale: 1.18, rotate: -6, opacity: 1 }}
              whileTap={{ scale: 0.92 }}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-80"
            >
              <Image src={c.icon} alt={c.label} width={48} height={48} />
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------
   Page
--------------------------------------------------------- */

export default function Home() {
  return (
    <div>
      <ScrollProgress />
      <NavBar />
      <HomeSection />
      <AboutSection />
      <TracksSection />
      <TimelineSection />
      <SponsorsSection />
      <ContactSection />
    </div>
  );
}
