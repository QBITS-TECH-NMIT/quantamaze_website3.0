"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Reveal, staggerContainer, staggerItem, easeOut } from "@/components/MotionPrimitives";

export default function TracksPage() {
  const tracks = [
    {
      index: "01",
      code: "QML",
      title: "Quantum Machine Learning (QML)",
      desc: "Step into the future where quantum computing meets artificial intelligence. Build hybrid quantum-classical models using frameworks like Qiskit, PennyLane, and TensorFlow Quantum.",
      icon: "/track-quantum.svg",
    },
    {
      index: "02",
      code: "PQC",
      title: "Post-Quantum Cryptography (PQC)",
      desc: "The quantum era is coming — are our systems ready? Design quantum-resistant encryption, digital signatures, and secure communication protocols for tomorrow's threats.",
      icon: "/lock.png",
    },
    {
      index: "03",
      code: "WEB3",
      title: "Web3 & Blockchain",
      desc: "Shape the decentralized future. Develop smart contracts, dApps, DeFi platforms, and Web3 innovations using Ethereum, Solidity, Polygon, and IPFS.",
      icon: "/track-web3.svg",
    },
    {
      index: "04",
      code: "GENAI",
      title: "Generative AI & ML",
      desc: "Transform data into intelligent solutions. Build AI copilots, predictive models, and NLP applications using LLMs, TensorFlow, PyTorch, and LangChain.",
      icon: "/track-genai.svg",
    },
  ];

  return (
    <div className="relative min-h-screen pt-20 sm:pt-24">
      <section id="tracks" className="brochure-section relative min-h-screen overflow-hidden bg-[#0A0A0A] py-16 text-[#F2F2F2] sm:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="section-kicker mb-4">Four ways to build the future</p>
            <h1 className="display-heading gradient-text mb-10 text-left text-3xl font-bold sm:mb-16 sm:text-5xl">
              Tracks
            </h1>
          </Reveal>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:gap-8"
          >
            {tracks.map((track) => (
              <motion.div
                key={track.title}
                variants={staggerItem}
                whileHover={{ y: -5, borderColor: "rgba(245,89,10,0.8)" }}
                transition={{ duration: 0.25, ease: easeOut }}
                className="track-card track-card-mobile relative flex flex-col rounded-lg transition-all"
              >
                <span className="tech-crosshair right-3 top-3">+</span>
                <span className="tech-crosshair bottom-3 right-3">+</span>

                <div className="mb-5 flex items-center justify-between sm:mb-8">
                  {track.icon && (
                    <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-white/10 bg-[#17171c] p-2 sm:h-14 sm:w-14">
                      <Image
                        src={track.icon}
                        alt={track.title}
                        width={64}
                        height={64}
                      />
                    </div>
                  )}
                  <span className="rounded border border-[#F5590A]/20 bg-[#F5590A]/10 px-2 py-1 font-mono text-[0.65rem] font-bold tracking-[0.2em] text-[#F5590A] sm:text-xs sm:tracking-[0.25em]">
                    TRACK // {track.index}
                  </span>
                </div>

                <h3 className="mb-2.5 text-lg font-semibold text-[#eeece6] sm:mb-3 sm:text-2xl">
                  {track.title}
                </h3>
                <p className="text-sm leading-relaxed text-stone-400 sm:text-base">
                  {track.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
