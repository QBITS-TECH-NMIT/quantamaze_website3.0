"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import LoadingScreen from "@/components/LoadingScreen";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useInView,
} from "framer-motion";

const MotionImage = motion(Image);

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
const navLinks = [
  { label: "Home", id: "home" },
  { label: "About", id: "about" },
  { label: "Tracks", id: "tracks" },
  { label: "Timeline", id: "timeline" },
  { label: "Sponsors", id: "sponsors" },
  { label: "Contact", id: "contact" },
];

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
    <div className="countdown-unit flex flex-col items-center py-2 sm:min-w-[112px] sm:px-5">
      <div className="relative h-[1em] sm:h-[1em] overflow-hidden leading-none text-5xl sm:text-7xl">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={false}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.45, ease: easeOut }}
            className="block leading-none font-mono font-medium text-[#F2F2F2]"
          >
            {String(value).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-3 text-[0.65rem] uppercase tracking-[0.18em] text-stone-500 sm:text-xs">
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
      className="fixed left-0 right-0 top-0 z-[60] h-px origin-left bg-[#F5590A]"
    />
  );
}

/* ---------------------------------------------------------
   NavBar
--------------------------------------------------------- */

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const navPaddingY = useTransform(scrollY, [0, 120], [16, 8]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-35% 0px -55%", threshold: 0 }
    );
    navLinks.forEach((link) => {
      const section = document.getElementById(link.id);
      if (section) observer.observe(section);
    });
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: easeOut }}
      style={{
        backgroundColor: scrolled ? "rgba(10,10,10,0.88)" : "rgba(10,10,10,0.18)",
        backdropFilter: scrolled ? "blur(14px)" : "blur(0px)",
      }}
      className="fixed left-0 right-0 top-0 z-50 border-b border-white/10"
    >
      <motion.div
        style={{ paddingTop: navPaddingY, paddingBottom: navPaddingY }}
        className="mx-auto flex max-w-7xl items-center justify-between px-6 sm:px-10"
      >
        <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.97 }}>
          <Image src="/logo.png" alt="Q-Bits logo" width={140} height={48} />
        </motion.div>

        <div className="hidden sm:flex gap-8 text-base font-medium">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={`group relative text-sm transition-colors ${activeSection === link.id ? "text-[#F5590A]" : "text-stone-400 hover:text-[#F2F2F2]"}`}
            >
              {link.label}
              <span className={`absolute -bottom-2 left-0 h-px bg-[#F5590A] transition-all duration-300 ${activeSection === link.id ? "w-full" : "w-0 group-hover:w-full"}`} />
            </a>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-2 text-stone-300 sm:hidden"
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
              {navLinks.map((link) => (
                <motion.a
                  key={link.id}
                  variants={staggerItem}
                  href={`#${link.id}`}
                  onClick={() => setMenuOpen(false)}
                  className={`text-lg transition-colors ${activeSection === link.id ? "text-[#F5590A]" : "text-stone-300 hover:text-[#F2F2F2]"}`}
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
      className="brochure-section relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0A0A0A] px-6 pt-28 text-[#F2F2F2]"
    >
      <motion.video
        initial={{ scale: 1.15, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.4 }}
        transition={{ duration: 2.2, ease: easeOut }}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover grayscale contrast-125 opacity-35"
      >
        <source src="/fire-bg.mp4" type="video/mp4" />
      </motion.video>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.48),rgba(10,10,10,0.82)_62%,#0A0A0A)]" />

      {/* floating ember glows for depth */}
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="hidden"
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        className="hidden"
      />

      <motion.div
        style={{ y: contentY }}
        variants={staggerContainer}
        initial="show"
        animate="show"
        className="relative z-10 flex w-full flex-col items-center opacity-100"
      >
        <motion.h1
          variants={staggerItem}
          className="display-heading gradient-text cursor-default text-center text-5xl font-bold tracking-[-0.06em] sm:text-8xl"
        >
          QUANT-A-MAZE 3.0
        </motion.h1>

        <motion.p
          variants={staggerItem}
          className="mt-6 text-center text-xl font-medium text-[#eeece6] sm:text-3xl"
        >
          A 36-Hour National-Level Hackathon
        </motion.p>

        <motion.p
          variants={staggerItem}
          className="mt-3 text-center text-base text-stone-400 sm:text-xl"
        >
          Something exciting is coming...
        </motion.p>

        <motion.p
          variants={staggerItem}
          className="mt-6 text-center text-3xl font-semibold tracking-[0.18em] text-[#F5590A] sm:text-5xl"
        >
          OCT 28
        </motion.p>

        <motion.p
          variants={staggerItem}
          className="text-center text-base text-stone-300 sm:text-lg"
        >
          Nitte Meenakshi Institute of Technology, Bangalore
        </motion.p>

        <motion.div
          variants={staggerItem}
          className="mt-12 grid grid-cols-2 gap-y-6 sm:mt-16 sm:flex sm:gap-0"
        >
          <FlipUnit value={display.days} label="Days" />
          <FlipUnit value={display.hours} label="Hours" />
          <FlipUnit value={display.minutes} label="Minutes" />
          <FlipUnit value={display.seconds} label="Seconds" />
        </motion.div>
        <motion.a
          variants={staggerItem}
          href="#contact"
          className="mt-10 inline-flex items-center gap-3 rounded-sm bg-[#F5590A] px-7 py-3.5 text-sm font-bold text-[#0A0A0A] transition hover:bg-[#ff7b3f] hover:translate-x-1"
        >
          Register Now <span aria-hidden="true">-&gt;</span>
        </motion.a>
      </motion.div>

      <motion.div
        style={{ opacity: scrollHintOpacity }}
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-stone-500"
      >
        <span className="sr-only">Scroll down</span>
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
  const stats = [
    { value: 36, suffix: " Hours", label: "Event Duration", icon: "clock" },
    { value: 4, suffix: " Tracks", label: "Build Pathways", icon: "grid" },
    { value: 3, suffix: ".0", label: "Current Edition", icon: "spark" },
    { value: 1, suffix: " Partner", label: "Research Partner", icon: "briefcase" },
  ];

  const statIcons = {
    clock: <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2" /></svg>,
    grid: <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></svg>,
    spark: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 1.5 6.5L20 11l-6.5 1.5L12 19l-1.5-6.5L4 11l6.5-1.5L12 3Z" /></svg>,
    briefcase: <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="7.5" width="17" height="12.5" rx="2" /><path d="M8.5 7.5V5.8a1.8 1.8 0 0 1 1.8-1.8h3.4a1.8 1.8 0 0 1 1.8 1.8v1.7M3.5 12.5h17M10 12.5v2h4v-2" /></svg>,
  };

  return (
    <section
      id="about"
      className="brochure-section stats-section relative overflow-hidden bg-[#0D0D0D] px-6 py-28 text-[#F2F2F2] sm:py-40"
    >
      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_0.86fr] lg:gap-24">
        <div>
        <Reveal>
              <p className="section-kicker mb-5">The people behind the signal</p>
              <h2 className="display-heading gradient-text mb-10 text-4xl font-bold sm:text-5xl">About Us</h2>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="max-w-3xl text-lg leading-relaxed text-slate-300 sm:text-xl">
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
          <p className="mt-8 max-w-2xl border-l-2 border-[#F5590A] pl-5 text-base leading-relaxed text-stone-300 sm:text-lg">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#F5590A]">In partnership with</span>
            Quant-A-Maze 3.0 is presented in partnership with{" "}
            <span className="font-medium text-[#F5590A]">
              KwantumG Research Labs
            </span>
            , bringing industry-grade mentorship in quantum computing, quantum
            machine learning, and applied research to every participant.
          </p>
        </Reveal>
        </div>
        <Reveal delay={0.15} y={40} className="about-image-frame">
          <MotionImage src="/abt_theme.jpg" alt="Quantum technology visual for Q-Bits" width={720} height={900} className="h-[390px] w-full object-cover sm:h-[540px]" />
          <span className="about-image-label">Q-BITS / 2026</span>
        </Reveal>
        </div>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          className="mt-20 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={staggerItem} className="about-stat-card">
              <span className="about-stat-icon">{statIcons[stat.icon]}</span>
              <span className="mt-5 text-3xl font-bold tracking-[-0.04em] text-[#F2F2F2] sm:text-4xl">
                <Counter value={stat.value} suffix={stat.suffix} />
              </span>
              <span className="mt-2 text-xs uppercase tracking-[0.14em] text-[#F5590A]">
                {stat.label}
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
    <section id="tracks" className="brochure-section relative min-h-screen overflow-hidden bg-[#0A0A0A] px-6 py-28 text-[#F2F2F2] sm:py-40">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="section-kicker mb-4">Four ways to build the future</p>
          <h2 className="display-heading gradient-text mb-16 text-left text-4xl font-bold sm:text-5xl">
            Tracks
          </h2>
        </Reveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:gap-x-12"
        >
          {tracks.map((track) => (
            <motion.div
              key={track.title}
              variants={staggerItem}
              whileHover={{ y: -4, borderColor: "rgba(245,89,10,0.8)" }}
              transition={{ duration: 0.25, ease: easeOut }}
              className="track-card flex min-h-[310px] flex-col rounded-none p-7 transition-colors sm:p-8"
            >
              {track.icon && (
                <motion.div
                  className="mb-8 flex h-14 w-14 items-center justify-center border border-white/10 bg-[#17171c] p-2"
                >
                  <Image
                    src={track.icon}
                    alt={track.title}
                    width={64}
                    height={64}
                  />
                </motion.div>
              )}
              <h3 className="mb-3 text-xl font-semibold text-[#eeece6] sm:text-2xl">
                {track.title}
              </h3>
              <p className="text-base leading-relaxed text-stone-400">
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
    <section id="timeline" className="brochure-section timeline-section relative min-h-screen overflow-hidden bg-[#0D0D0D] px-6 py-28 text-[#F2F2F2] sm:py-40">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <p className="section-kicker mb-4">From first commit to final result</p>
          <h2 className="display-heading gradient-text mb-16 text-left text-4xl font-bold sm:text-5xl">
            Timeline
          </h2>
        </Reveal>

        <div ref={containerRef} className="relative">
          <div className="timeline-line absolute bottom-16 left-2 top-2 w-px sm:left-1/2" />
          <motion.div
            style={{ scaleY: scrollYProgress, transformOrigin: "top" }}
            className="timeline-progress absolute bottom-16 left-2 top-2 w-px origin-top sm:left-1/2"
          />
          <div className="space-y-16">
            {events.map((event, i) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: easeOut }}
                className={`relative pl-10 sm:grid sm:grid-cols-2 sm:gap-12 sm:pl-0 ${i % 2 === 0 ? "sm:text-right" : "sm:text-left"}`}
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
                  className="timeline-marker absolute left-2 top-2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full sm:left-1/2"
                />
                <h3 className="text-xl font-semibold text-[#eeece6] sm:text-2xl">
                  {event.title}
                </h3>
                <p className="mt-1 text-base text-[#F5590A] sm:text-lg">{event.date}</p>
              </motion.div>
            ))}
          </div>
        </div>
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
    <section id="contact" className="brochure-section relative flex min-h-[70vh] items-center overflow-hidden bg-[#0A0A0A] px-6 py-28 text-[#F2F2F2] sm:py-40">
      <div className="relative mx-auto max-w-2xl text-center">
        <Reveal>
          <p className="section-kicker mb-4">Stay connected</p>
          <h2 className="display-heading gradient-text mb-8 text-4xl font-bold sm:text-5xl">
            Contact Us
          </h2>
        </Reveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          className="flex flex-wrap justify-center gap-4 sm:justify-start sm:gap-6"
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
              whileHover={{ scale: 1.05, opacity: 1 }}
              whileTap={{ scale: 0.96 }}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-icon flex h-14 w-14 items-center justify-center rounded-full border border-white/15 opacity-65 transition hover:border-[#F5590A] hover:opacity-100"
            >
              <Image src={c.icon} alt={c.label} width={48} height={48} />
            </motion.a>
          ))}
        </motion.div>
        <div className="mt-24 border-t border-white/10 pt-6 text-sm text-slate-500">
          <p>Q-Bits, Quantum Technology Club at NMIT Bangalore</p>
          <p className="mt-2">Developed by Q-Bits <span className="mx-2 text-[#F5590A]/60">/</span> Copyright 2026</p>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------
   Page
--------------------------------------------------------- */

export default function Home() {
  const [siteReady, setSiteReady] = useState(false);
  const handleLoaderComplete = useCallback(() => setSiteReady(true), []);

  useEffect(() => {
    const readyTimer = window.setTimeout(() => {
      if (
        window.sessionStorage.getItem("qam_loader_seen") === "true" ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        window.innerWidth < 380
      ) {
        setSiteReady(true);
      }
    }, 0);
    return () => window.clearTimeout(readyTimer);
  }, []);

  return (
    <div>
      {/* Session-gated Powering Core loading screen */}
      <LoadingScreen onComplete={handleLoaderComplete} />
      <ScrollProgress />
      <NavBar />
      <main
        aria-hidden={!siteReady}
        className={`transition-[opacity,filter] duration-700 ${siteReady ? "hero-powered opacity-100" : "pointer-events-none select-none opacity-0"}`}
      >
        <HomeSection />
        <AboutSection />
        <TracksSection />
        <TimelineSection />
        <ContactSection />
      </main>
    </div>
  );
}
