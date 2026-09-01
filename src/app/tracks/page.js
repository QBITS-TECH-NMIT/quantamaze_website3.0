"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Reveal, staggerContainer, staggerItem, easeOut } from "@/components/MotionPrimitives";
import TrackModal from "@/components/TrackModal";

const tracks = [
  {
    id: "quantum-machine-learning",
    index: "01",
    code: "QML",
    title: "Quantum Machine Learning (QML)",
    tagline: "Hybrid quantum-classical intelligence for real-world AI workflows.",
    description:
      "This track explores how quantum computing can augment machine learning pipelines, from variational models and feature encoding to optimization problems and quantum-inspired algorithms. Participants will learn to think in terms of data pipelines, model design, and the practical trade-offs between classical and quantum approaches.",
    topics: ["Qiskit", "PennyLane", "Variational Circuits", "Quantum Feature Maps", "Optimization"],
    difficulty: "Intermediate",
    duration: "2-day track",
    mentors: ["Quantum AI Research Leads", "ML Engineering Mentors"],
    icon: "⚛️",
  },
  {
    id: "post-quantum-cryptography",
    index: "02",
    code: "PQC",
    title: "Post-Quantum Cryptography (PQC)",
    tagline: "Build secure systems for a world after Shor's algorithm.",
    description:
      "The quantum era is approaching, and many of today's encryption methods will become vulnerable. This track focuses on quantum-safe cryptographic standards, secure protocol design, algorithm analysis, and practical defense strategies for digital infrastructure and communication systems.",
    topics: ["Kyber", "Dilithium", "Hash-Based Signatures", "Secure Protocols", "Cryptanalysis"],
    difficulty: "Intermediate",
    duration: "2-day track",
    mentors: ["Security Engineers", "Cryptography Researchers"],
    icon: "🔐",
  },
  {
    id: "web3-and-blockchain",
    index: "03",
    code: "WEB3",
    title: "Web3 & Blockchain",
    tagline: "Decentralized systems, smart contracts, and trustless infrastructure.",
    description:
      "From smart contracts to decentralised applications, this track covers the fundamentals and advanced patterns of blockchain ecosystems. Participants will explore protocol design, token mechanics, on-chain logic, and the security and usability challenges that define the next generation of web-native products.",
    topics: ["Solidity", "Smart Contracts", "DeFi", "DApps", "Polygon & Ethereum"],
    difficulty: "Beginner / Intermediate",
    duration: "2-day track",
    mentors: ["Blockchain Builders", "Product & Contracts Mentors"],
    icon: "⛓️",
  },
  {
    id: "generative-ai-and-ml",
    index: "04",
    code: "GENAI",
    title: "Generative AI & ML",
    tagline: "Design intelligent systems that create, reason, and adapt.",
    description:
      "This track brings together modern machine learning and generative AI through practical product thinking. Participants will work with LLMs, retrieval pipelines, fine-tuning workflows, and predictive models to build human-centric AI experiences across text, media, and decision support.",
    topics: ["LLMs", "Prompt Engineering", "Fine-Tuning", "RAG", "Applied ML"],
    difficulty: "Beginner / Intermediate",
    duration: "2-day track",
    mentors: ["AI Engineers", "Data Scientists"],
    icon: "🤖",
  },
];

export default function TracksPage() {
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [selectedTriggerRef, setSelectedTriggerRef] = useState(null);
  const triggerRefs = useRef({});

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
            className="track-fan-grid grid gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6"
          >
            {tracks.map((track) => (
              <motion.button
                key={track.id}
                type="button"
                ref={(element) => {
                  triggerRefs.current[track.id] = element;
                }}
                variants={staggerItem}
                transition={{ duration: 0.5, ease: easeOut }}
                className="track-card-promo"
                onClick={(event) => {
                  setSelectedTrack(track);
                  setSelectedTriggerRef({ current: event.currentTarget });
                }}
                aria-haspopup="dialog"
                aria-expanded={selectedTrack?.id === track.id}
              >
                <div className="track-card-visual">
                  <div className="track-card-logo" aria-hidden="true">{track.icon}</div>
                  <span className="track-card-badge">TRACK // {track.index}</span>
                </div>

                <div className="track-card-summary">
                  <h3>{track.title}</h3>
                  <p>{track.tagline}....</p>
                </div>

                <div className="track-card-overlay">
                  <p className="track-card-overlay-title">{track.title}</p>
                  <p className="track-card-overlay-description">{track.description}</p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      <TrackModal
        track={selectedTrack}
        onClose={() => setSelectedTrack(null)}
        triggerRef={selectedTriggerRef}
      />
    </div>
  );
}
