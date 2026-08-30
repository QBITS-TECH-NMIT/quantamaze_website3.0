"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SIZE = 9;
const DIRECTIONS = {
  up: { dx: 0, dy: -1, wall: "N" },
  down: { dx: 0, dy: 1, wall: "S" },
  left: { dx: -1, dy: 0, wall: "W" },
  right: { dx: 1, dy: 0, wall: "E" },
};

function createMaze() {
  const grid = Array.from({ length: SIZE }, (_, y) =>
    Array.from({ length: SIZE }, (_, x) => ({
      x,
      y,
      walls: { N: true, S: true, E: true, W: true },
      visited: false,
    }))
  );
  const stack = [];
  let current = grid[0][0];
  current.visited = true;
  let visited = 1;

  while (visited < SIZE * SIZE) {
    const neighbors = [];
    if (current.y > 0 && !grid[current.y - 1][current.x].visited) neighbors.push([grid[current.y - 1][current.x], "N", "S"]);
    if (current.y < SIZE - 1 && !grid[current.y + 1][current.x].visited) neighbors.push([grid[current.y + 1][current.x], "S", "N"]);
    if (current.x < SIZE - 1 && !grid[current.y][current.x + 1].visited) neighbors.push([grid[current.y][current.x + 1], "E", "W"]);
    if (current.x > 0 && !grid[current.y][current.x - 1].visited) neighbors.push([grid[current.y][current.x - 1], "W", "E"]);

    if (neighbors.length) {
      const [next, wall, opposite] = neighbors[Math.floor(Math.random() * neighbors.length)];
      current.walls[wall] = false;
      next.walls[opposite] = false;
      next.visited = true;
      stack.push(current);
      current = next;
      visited += 1;
    } else {
      current = stack.pop();
    }
  }

  return grid;
}

export default function MazeRunner() {
  const canvasRef = useRef(null);
  const [maze, setMaze] = useState(() => createMaze());
  const [player, setPlayer] = useState({ x: 0, y: 0 });
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [status, setStatus] = useState("Navigate the probability field to the exit.");
  const [won, setWon] = useState(false);

  const reset = useCallback(() => {
    setMaze(createMaze());
    setPlayer({ x: 0, y: 0 });
    setStartedAt(Date.now());
    setElapsed(0);
    setStatus("Navigate the probability field to the exit.");
    setWon(false);
  }, []);

  const move = useCallback((direction) => {
    if (won) return;
    const { dx, dy, wall } = DIRECTIONS[direction];
    const cell = maze[player.y][player.x];
    if (cell.walls[wall]) return;

    const next = { x: player.x + dx, y: player.y + dy };
    setPlayer(next);
    if (next.x === SIZE - 1 && next.y === SIZE - 1) {
      const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);
      setElapsed(Number(seconds));
      setStatus(`Wavefunction collapsed in ${seconds}s. Excellent run.`);
      setWon(true);
    }
  }, [maze, player, startedAt, won]);

  useEffect(() => {
    if (won) return undefined;
    const timer = window.setInterval(() => setElapsed((Date.now() - startedAt) / 1000), 100);
    return () => window.clearInterval(timer);
  }, [startedAt, won]);

  useEffect(() => {
    const keyMap = { ArrowUp: "up", w: "up", W: "up", ArrowDown: "down", s: "down", S: "down", ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right" };
    const handleKeyDown = (event) => {
      const direction = keyMap[event.key];
      if (!direction) return;
      event.preventDefault();
      move(direction);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [move]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    const cellSize = canvas.width / SIZE;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#0b111b";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = "rgba(135, 206, 235, 0.72)";
    context.lineWidth = 2;
    context.beginPath();
    maze.forEach((row) => row.forEach((cell) => {
      const x = cell.x * cellSize;
      const y = cell.y * cellSize;
      if (cell.walls.N) { context.moveTo(x, y); context.lineTo(x + cellSize, y); }
      if (cell.walls.W) { context.moveTo(x, y); context.lineTo(x, y + cellSize); }
      if (cell.x === SIZE - 1 && cell.walls.E) { context.moveTo(x + cellSize, y); context.lineTo(x + cellSize, y + cellSize); }
      if (cell.y === SIZE - 1 && cell.walls.S) { context.moveTo(x, y + cellSize); context.lineTo(x + cellSize, y + cellSize); }
    }));
    context.stroke();

    context.fillStyle = "rgba(245, 89, 10, 0.2)";
    context.fillRect((SIZE - 1) * cellSize + cellSize * 0.18, (SIZE - 1) * cellSize + cellSize * 0.18, cellSize * 0.64, cellSize * 0.64);
    context.strokeStyle = "#f5590a";
    context.lineWidth = 2;
    context.strokeRect((SIZE - 1) * cellSize + cellSize * 0.24, (SIZE - 1) * cellSize + cellSize * 0.24, cellSize * 0.52, cellSize * 0.52);

    context.beginPath();
    context.fillStyle = "#ffb347";
    context.shadowColor = "#f5590a";
    context.shadowBlur = 16;
    context.arc(player.x * cellSize + cellSize / 2, player.y * cellSize + cellSize / 2, cellSize * 0.25, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;
  }, [maze, player]);

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex w-full max-w-[360px] items-center justify-between gap-3">
        <span className="font-mono text-sm text-[#ffb347]">{elapsed.toFixed(1)}s</span>
        <button type="button" onClick={reset} className="game-ghost-button">New maze</button>
      </div>
      <canvas ref={canvasRef} width={360} height={360} className="aspect-square w-full max-w-[360px] rounded-xl border border-cyan-200/20 bg-[#0b111b]" aria-label="Quantum maze game board" />
      <div className="grid grid-cols-3 gap-2 sm:hidden" aria-label="Maze touch controls">
        <span />
        <button type="button" onClick={() => move("up")} className="game-control-button" aria-label="Move up">↑</button>
        <span />
        <button type="button" onClick={() => move("left")} className="game-control-button" aria-label="Move left">←</button>
        <span />
        <button type="button" onClick={() => move("right")} className="game-control-button" aria-label="Move right">→</button>
        <span />
        <button type="button" onClick={() => move("down")} className="game-control-button" aria-label="Move down">↓</button>
        <span />
      </div>
      <p className={`min-h-6 text-center text-sm ${won ? "text-[#ffb347]" : "text-stone-400"}`}>{status}</p>
    </div>
  );
}
