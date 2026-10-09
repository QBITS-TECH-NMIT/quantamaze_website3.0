export const RESULTS_UNLOCK_AT = "2026-10-09T11:00:00+05:30";

export function getResultsCountdown(now) {
  const totalSeconds = Math.max(0, Math.floor((Date.parse(RESULTS_UNLOCK_AT) - now) / 1000));
  return {
    totalSeconds,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}