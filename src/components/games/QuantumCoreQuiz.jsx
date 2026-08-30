"use client";

import { useState } from "react";

const QUESTIONS = [
  { question: "What can a qubit do that a classical bit cannot?", options: ["Only be 0", "Only be 1", "Be 0 and 1 at once", "Store letters"], correct: 2 },
  { question: "When a measured qubit settles into one definite value, this is:", options: ["Superposition", "Entanglement", "Measurement collapse", "Tunneling"], correct: 2 },
  { question: "Two qubits linked so measuring one affects the other are:", options: ["Superposed", "Entangled", "Isolated", "Classical"], correct: 1 },
  { question: "If correlated entangled qubits measure one as 0, the other is:", options: ["Unrelated", "Instantly correlated", "Erased", "Always 1"], correct: 1 },
  { question: 'Which notation represents a qubit in the "0" state?', options: ["|0⟩", "0!", "Q-0", "Ø"], correct: 0 },
  { question: "What is unwanted noise that disturbs a qubit's fragile state?", options: ["Amplification", "Superposition", "Decoherence", "Tunneling"], correct: 2 },
];

export default function QuantumCoreQuiz() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [powerupUsed, setPowerupUsed] = useState(false);
  const [eliminated, setEliminated] = useState([]);
  const [selected, setSelected] = useState(null);
  const [finished, setFinished] = useState(false);
  const [won, setWon] = useState(false);

  const question = QUESTIONS[questionIndex];
  const reset = () => {
    setQuestionIndex(0);
    setLives(3);
    setPowerupUsed(false);
    setEliminated([]);
    setSelected(null);
    setFinished(false);
    setWon(false);
  };

  const answer = (index) => {
    if (selected !== null || finished) return;
    setSelected(index);
    if (index !== question.correct) {
      const remainingLives = lives - 1;
      setLives(remainingLives);
      if (remainingLives === 0) {
        setFinished(true);
        setWon(false);
      }
    }
  };

  const next = () => {
    if (selected === null) return;
    if (questionIndex === QUESTIONS.length - 1) {
      setFinished(true);
      setWon(lives > 0);
      return;
    }
    setQuestionIndex((value) => value + 1);
    setSelected(null);
    setEliminated([]);
  };

  const usePowerup = () => {
    if (powerupUsed || selected !== null) return;
    const wrongOptions = question.options.map((_, index) => index).filter((index) => index !== question.correct);
    const removed = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
    setEliminated([removed]);
    setPowerupUsed(true);
  };

  if (finished) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-5 text-center">
        <div className={`flex h-20 w-20 items-center justify-center rounded-full border ${won ? "border-[#ffb347]/60 bg-[#ffb347]/10" : "border-red-300/40 bg-red-300/10"}`}>
          <span className="font-mono text-3xl text-[#ffb347]">{won ? "✓" : "×"}</span>
        </div>
        <div>
          <p className="text-xl font-semibold text-white">{won ? "Core stabilized." : "Core decohered."}</p>
          <p className="mt-2 text-sm text-stone-400">{won ? "Six correct measurements. The system is secure." : "The reactor lost coherence before the final measurement."}</p>
        </div>
        <button type="button" onClick={reset} className="game-primary-button">Restart simulation <span aria-hidden="true">→</span></button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex gap-2" aria-label={`${lives} lives remaining`}>
          {[0, 1, 2].map((life) => <span key={life} className={`h-3 w-3 rounded-full border ${life < lives ? "border-[#ffb347] bg-[#ffb347] shadow-[0_0_10px_rgba(255,179,71,0.7)]" : "border-stone-600 bg-transparent"}`} />)}
        </div>
        <span className="font-mono text-xs uppercase tracking-wider text-stone-400">Sector {questionIndex + 1} / {QUESTIONS.length}</span>
        <button type="button" onClick={usePowerup} disabled={powerupUsed || selected !== null} className="game-ghost-button disabled:cursor-not-allowed disabled:opacity-40">⚡ 50/50</button>
      </div>
      <p className="text-lg font-semibold leading-relaxed text-white sm:text-xl">{question.question}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {question.options.map((option, index) => {
          const isCorrect = selected !== null && index === question.correct;
          const isWrong = selected === index && index !== question.correct;
          return <button key={option} type="button" disabled={selected !== null || eliminated.includes(index)} onClick={() => answer(index)} className={`rounded-xl border px-4 py-3 text-left text-sm transition ${isCorrect ? "border-[#ffb347] bg-[#ffb347]/10 text-[#ffcf8a]" : isWrong ? "border-red-400/70 bg-red-400/10 text-red-200" : eliminated.includes(index) ? "border-white/5 text-stone-600 line-through" : "border-white/10 bg-white/[0.03] text-stone-300 hover:border-[#f5590a]/60 hover:text-white"}`}>{option}</button>;
        })}
      </div>
      {selected !== null && <div className="flex items-center justify-between gap-4"><p className={`text-sm ${selected === question.correct ? "text-[#ffb347]" : "text-red-200"}`}>{selected === question.correct ? "Correct measurement." : "Incorrect measurement. One qubit decohered."}</p><button type="button" onClick={next} className="game-primary-button">{questionIndex === QUESTIONS.length - 1 ? "Finish" : "Next"} <span aria-hidden="true">→</span></button></div>}
    </div>
  );
}
