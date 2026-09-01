"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, staggerContainer, staggerItem, easeOut } from "@/components/MotionPrimitives";
import styles from "./prizes.module.css";

// Counter animation component
function AnimatedCounter({ target, duration = 1600 }) {
  const [count, setCount] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeProgress * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return count.toLocaleString();
}

const podiumPrizes = [
  {
    rank: 2,
    label: "2nd Place",
    amount: 30000,
    note: "Runner-up",
    tier: "second",
  },
  {
    rank: 1,
    label: "1st Place",
    amount: 50000,
    note: "Top of the leaderboard",
    tier: "first",
  },
  {
    rank: 3,
    label: "3rd Place",
    amount: 20000,
    note: "Second runner-up",
    tier: "third",
  },
];

const benefitCards = [
  {
    rank: 1,
    tier: "gold",
    label: "1st Place",
    title: "2-year VIP membership",
    description:
      "Full CodeCrafters access for every member of the winning team — courses, labs and interview prep for two full years.",
  },
  {
    rank: 2,
    tier: "silver",
    label: "2nd Place",
    title: "1-year VIP membership",
    description:
      "Full CodeCrafters access for every member of the runner-up team for twelve months.",
  },
  {
    rank: 3,
    tier: "orange",
    label: "3rd Place",
    title: "6-month VIP membership",
    description:
      "Full CodeCrafters access for every member of the second runner-up team for six months.",
  },
];

export default function PrizesPage() {
  const [expandedBenefit, setExpandedBenefit] = useState(0);
  const canvasRef = useRef(null);
  const partsRef = useRef([]);
  const rafRef = useRef(null);
  const firstPlaceRef = useRef(null);

  // Confetti burst effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      partsRef.current = partsRef.current.filter((p) => p.life > 0);

      for (const p of partsRef.current) {
        p.vy += 0.16;
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.rot += p.vr;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, p.life / p.max);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
        ctx.restore();
      }

      if (partsRef.current.length) {
        rafRef.current = requestAnimationFrame(loop);
      }
    };

    if (partsRef.current.length) {
      rafRef.current = requestAnimationFrame(loop);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const burst = (x, y, n = 70) => {
    const colors = ["#F5590A", "#FFCF5C", "#FFB066", "#F2F2F2"];
    for (let i = 0; i < n; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 7 + 2;
      partsRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        s: Math.random() * 6 + 3,
        color: colors[i % colors.length],
        life: 70 + Math.random() * 40,
        max: 110,
        rot: Math.random() * 6,
        vr: (Math.random() - 0.5) * 0.3,
      });
    }
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        const loop = () => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          partsRef.current = partsRef.current.filter((p) => p.life > 0);
          for (const p of partsRef.current) {
            p.vy += 0.16;
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            p.rot += p.vr;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.globalAlpha = Math.max(0, p.life / p.max);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
            ctx.restore();
          }
          if (partsRef.current.length) rafRef.current = requestAnimationFrame(loop);
          else rafRef.current = null;
        };
        loop();
      });
    }
  };

  const handlePodiumClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    burst(rect.left + rect.width / 2, rect.top + 40, 50);
  };

  useEffect(() => {
    const handleFirstPlaceView = () => {
      if (firstPlaceRef.current) {
        const rect = firstPlaceRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          setTimeout(() => burst(rect.left + rect.width / 2, rect.top + 40, 90), 600);
        }
      }
    };

    const timer = setTimeout(handleFirstPlaceView, 1400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-10"
        style={{ width: "100%", height: "100%" }}
      />

      <section id="prizes" className={styles.section}>
        <div className={styles.backgroundGlows} aria-hidden="true">
          <div className={styles.glowOne} />
          <div className={styles.glowTwo} />
        </div>

        <div className={styles.content}>
          {/* Header */}
          <Reveal>
            <div className={styles.header}>
              <p className={styles.eyebrow}>
                <span className={styles.dot} aria-hidden="true" />
                REWARDS & RECOGNITION
              </p>
              <h1 className={styles.title}>
                Prize pool & <em>benefits</em>
              </h1>
              <p className={styles.subtitle}>
                ₹1,05,000 in cash prizes plus exclusive CodeCrafters VIP memberships for all placed teams.
              </p>
            </div>
          </Reveal>

          {/* Podium Section */}
          <div className={styles.podiumSection}>
            <div className={styles.podiumHeader}>
              <h2>Podium prizes</h2>
              <p>Top three teams across all tracks</p>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className={styles.podium}
            >
              {podiumPrizes.map((prize, idx) => (
                <motion.div
                  key={prize.rank}
                  ref={prize.tier === "first" ? firstPlaceRef : null}
                  variants={staggerItem}
                  className={`${styles.podiumCard} ${styles[`tier${prize.tier}`]}`}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  onClick={handlePodiumClick}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    e.currentTarget.style.setProperty("--gx", "50%");
                    e.currentTarget.style.setProperty("--gy", "50%");
                  }}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const px = (e.clientX - rect.left) / rect.width;
                    const py = (e.clientY - rect.top) / rect.height;
                    e.currentTarget.style.setProperty("--gx", px * 100 + "%");
                    e.currentTarget.style.setProperty("--gy", py * 100 + "%");
                  }}
                >
                  {prize.tier === "first" && (
                    <div className={styles.crown} aria-hidden="true">
                      ★
                    </div>
                  )}

                  <div className={styles.rankBadge}>{prize.rank}</div>

                  <h3 className={styles.rankLabel}>{prize.label}</h3>

                  <div className={styles.prizeAmount}>
                    <span className={styles.currency}>₹</span>
                    <span><AnimatedCounter target={prize.amount} duration={1400} /></span>
                  </div>

                  <p className={styles.prizeNote}>{prize.note}</p>

                  <div className={styles.prizeBar} aria-hidden="true" />
                </motion.div>
              ))}
            </motion.div>

            {/* Innovation Award */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2, ease: easeOut }}
              className={styles.innovationCard}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                burst(rect.left + rect.width / 2, rect.top + 40, 36);
              }}
            >
              <div className={styles.innovationIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
                  <circle cx="12" cy="12" r="3.2" />
                </svg>
              </div>
              <div className={styles.innovationContent}>
                <h4 className={styles.innovationTitle}>Innovation Award</h4>
                <p className={styles.innovationDesc}>Best original idea across any track — voted by judges</p>
              </div>
              <div className={styles.innovationAmount}>
                <span className={styles.currency}>₹</span>
                <span><AnimatedCounter target={5000} duration={1400} /></span>
              </div>
            </motion.div>
          </div>

          {/* Winner Benefits Section */}
          <div className={styles.benefitsSection}>
            <div className={styles.benefitsHeader}>
              <h2>Winner benefits</h2>
              <p>CodeCrafters VIP memberships scaled to rank</p>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              className={styles.benefitsList}
            >
              {benefitCards.map((benefit, idx) => (
                <motion.div
                  key={idx}
                  variants={staggerItem}
                  className={`${styles.benefitCard} ${styles[`tier${benefit.tier}`]} ${
                    expandedBenefit === idx ? styles.expanded : ""
                  }`}
                  onClick={() => setExpandedBenefit(expandedBenefit === idx ? -1 : idx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setExpandedBenefit(expandedBenefit === idx ? -1 : idx);
                    }
                  }}
                >
                  <div className={styles.benefitHead}>
                    <div className={`${styles.benefitNum} ${styles[`num${benefit.tier}`]}`}>
                      {benefit.rank}
                    </div>
                    <div className={styles.benefitTitleGroup}>
                      <span className={styles.benefitLabel}>{benefit.label}</span>
                      <h4 className={styles.benefitTitle}>{benefit.title}</h4>
                    </div>
                    <div className={styles.benefitChev} aria-hidden="true">
                      ▾
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedBenefit === idx && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{
                          opacity: 1,
                          height: "auto",
                          transition: { height: { duration: 0.3, ease: easeOut }, opacity: { duration: 0.25, delay: 0.05 } },
                        }}
                        exit={{
                          opacity: 0,
                          height: 0,
                          transition: { height: { duration: 0.25, ease: "easeInOut" }, opacity: { duration: 0.15 } },
                        }}
                        className={styles.benefitBody}
                      >
                        <p>{benefit.description}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>

            <p className={styles.benefitsNote}>
              Memberships are awarded per team member · courtesy of <strong>CodeCrafters</strong>
            </p>
            <p className={styles.benefitsNote}>
              Organizers receive 3-month VIP membership · up to five core team members
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
