"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/MotionPrimitives";

const gameComponents = {
  maze: dynamic(() => import("@/components/games/MazeRunner"), { ssr: false }),
  coin: dynamic(() => import("@/components/games/QuantumCoinFlip"), { ssr: false }),
  core: dynamic(() => import("@/components/games/QuantumCoreQuiz"), { ssr: false }),
};

const games = [
  {
    id: "maze",
    index: "01",
    title: "Q-Maze Runner",
    eyebrow: "DECOHERENCE RUN",
    description: "Guide a qubit through a generated probability field before the clock collapses.",
    flavor: "Find the path. Preserve coherence.",
  },
  {
    id: "coin",
    index: "02",
    title: "Superposition",
    eyebrow: "OBSERVATION LAB",
    description: "Predict the measured state, or keep the qubit suspended between two realities.",
    flavor: "The answer is both. Until you look.",
  },
  {
    id: "core",
    index: "03",
    title: "Quantum Core",
    eyebrow: "STABILIZATION PROTOCOL",
    description: "Answer quantum questions, protect your lives, and stabilize the reactor before decoherence.",
    flavor: "Six sectors. Three lives. One core.",
  },
];

function GamePreview({ id }) {
  if (id === "maze") {
    return <div className="game-preview game-preview--maze"><span className="game-preview-qubit" /><span className="game-preview-exit" /></div>;
  }
  if (id === "coin") {
    return <div className="game-preview game-preview--coin"><span>Q</span><i /><i /><i /></div>;
  }
  return <div className="game-preview game-preview--core"><span className="game-core-ring" /><span className="game-core-orb">✦</span><b>0</b><b>1</b><b>0</b></div>;
}

export default function GamesSection() {
  const [activeGame, setActiveGame] = useState(null);
  const ActiveGame = activeGame ? gameComponents[activeGame] : null;
  const activeGameData = games.find((game) => game.id === activeGame);

  return (
    <section id="games" className="relative overflow-hidden bg-[#0A0A0A] text-[#F2F2F2]">
      <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
        <div className="pointer-events-none absolute left-1/2 top-24 h-96 w-96 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.13),transparent_70%)] blur-3xl" />
        <Reveal>
          <p className="section-kicker mb-4">A Q-Bits side channel</p>
          <h2 className="display-heading gradient-text max-w-3xl text-4xl font-black sm:text-6xl">Quantum Arcade</h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-stone-400 sm:text-lg">Three small experiments in timing, observation, and coherence. Pick a protocol and see how long you can keep the quantum system stable.</p>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-3 lg:gap-6">
          {games.map((game, index) => (
            <motion.article key={game.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: index * 0.08, duration: 0.5 }} className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111218] transition duration-300 hover:-translate-y-1 hover:border-[#f5590a]/60 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4),0_0_30px_rgba(245,89,10,0.12)]">
              <GamePreview id={game.id} />
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#f5590a]">{game.index} {"//"} {game.eyebrow}</span>
                  <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.8)]" />
                </div>
                <h3 className="mt-4 text-2xl font-bold text-white">{game.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-400">{game.description}</p>
                <p className="mt-4 font-mono text-xs text-[#ffb347]">{game.flavor}</p>
                <button type="button" onClick={() => setActiveGame(game.id)} className="game-primary-button mt-7 w-full justify-center">Launch protocol <span aria-hidden="true">→</span></button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      {ActiveGame && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-md" role="dialog" aria-modal="true" aria-label={`${activeGameData.title} game`} onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveGame(null); }}>
          <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#f5590a]/30 bg-[#0c0e15] p-5 shadow-[0_0_80px_rgba(0,0,0,0.8)] sm:p-8">
            <button type="button" onClick={() => setActiveGame(null)} className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-lg text-stone-400 transition hover:border-[#f5590a]/60 hover:text-white" aria-label="Close game">×</button>
            <p className="section-kicker mb-3 pr-10">{activeGameData.eyebrow}</p>
            <h2 className="display-heading gradient-text pr-10 text-2xl sm:text-4xl">{activeGameData.title}</h2>
            <p className="mt-3 mb-7 max-w-xl text-sm leading-relaxed text-stone-400">{activeGameData.description}</p>
            <ActiveGame />
          </div>
        </div>
      )}
    </section>
  );
}
