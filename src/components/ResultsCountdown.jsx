import styles from "@/app/results/results.module.css";

const units = [
  ["days", "Days"],
  ["hours", "Hours"],
  ["minutes", "Minutes"],
  ["seconds", "Seconds"],
];

export default function ResultsCountdown({ remaining, ready }) {
  return (
    <div
      className={styles.countdown}
      aria-label={ready ? "Time remaining until results unlock" : undefined}
      aria-live="off"
    >
      {units.map(([unit, label]) => (
        <div className={styles.countdownUnit} key={unit}>
          <span className={styles.countdownValue}>
            {ready && remaining ? String(remaining[unit]).padStart(2, "0") : "--"}
          </span>
          <span className={styles.countdownLabel}>{label}</span>
        </div>
      ))}
    </div>
  );
}