"use client";

import { useEffect, useState } from "react";
import { scorePrediction } from "@/lib/quantumCoin.mjs";

export default function QuantumCoinFlip() {
  const [phase, setPhase] = useState("choice");
  const [guess, setGuess] = useState(null);

  useEffect(() => {
    if (phase !== "collapsing") return undefined;
    const timer = window.setTimeout(() => {
      setPhase("result");
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const reset = () => {
    setGuess(null);
    setPhase("choice");
  };

  const choose = (value) => {
    setGuess(value);
    if (value === "split") {
      setPhase("split");
      return;
    }
    setPhase("collapsing");
  };

  if (phase === "split") {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-6 text-center">
        <div className="quantum-superposition-orb relative flex h-44 w-44 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300/10 shadow-[0_0_60px_rgba(34,211,238,0.25)]">
          <div className="absolute h-32 w-32 rounded-full border border-dashed border-[#ffb347]/70" />
          <span className="font-mono text-xl font-bold text-cyan-200">H / T</span>
        </div>
        <div>
          <p className="text-lg font-semibold text-cyan-200">The qubit remains in superposition.</p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-stone-400">No measurement occurred, so the state is undetermined. Both possibilities continue to shimmer together.</p>
        </div>
        <button type="button" onClick={reset} className="game-primary-button">Run again <span aria-hidden="true">→</span></button>
      </div>
    );
  }

  const score = phase === "result" ? scorePrediction(guess) : null;
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center gap-7 text-center">
      <div className={`quantum-coin ${phase === "collapsing" ? "quantum-coin--flipping" : ""} ${phase === "result" ? "quantum-coin--settled quantum-coin--both" : ""}`}>
        <span className="quantum-coin-face quantum-coin-face--front">H</span>
        <span className="quantum-coin-face quantum-coin-face--back">T</span>
        <span className="quantum-coin-face quantum-coin-face--both" aria-label="Both heads and tails">H <i /> T</span>
        {phase === "choice" && <span className="quantum-coin-label">Q</span>}
        {phase === "result" && <span className="quantum-coin-burst" aria-hidden="true" />}
      </div>
      <div>
        <p className="text-lg font-semibold text-white">
          {phase === "choice" && "Predict the measured state."}
          {phase === "collapsing" && "Collapsing the wavefunction..."}
          {phase === "result" && (score === "correct" ? "Correct! A qubit in superposition exists as both states at once." : "Incorrect! Until measured, the qubit isn't just one state — it's both.")}
        </p>
        {phase === "result" && <p className={`mt-2 text-sm ${score === "correct" ? "text-[#ffb347]" : "text-red-200"}`}>{score === "correct" ? "Superposition correctly identified." : `You selected ${guess.toUpperCase()}.`}</p>}
      </div>
      {phase === "choice" && (
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => choose("heads")} className="game-ghost-button">Heads</button>
          <button type="button" onClick={() => choose("tails")} className="game-ghost-button">Tails</button>
          <button type="button" onClick={() => choose("both")} className="game-primary-button">Both</button>
          <button type="button" onClick={() => choose("split")} className="game-ghost-button">Stay in superposition</button>
        </div>
      )}
      {phase === "result" && <button type="button" onClick={reset} className="game-primary-button">Measure again <span aria-hidden="true">→</span></button>}
    </div>
  );
}
