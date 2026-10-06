"use client";

import { useEffect, useState } from "react";
import { RESULTS_UNLOCK_AT } from "@/lib/results";

export default function useResultsAvailability(allowPreview = false) {
  const [now, setNow] = useState(null);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    // Remove the preview query override before launch.
    const updateTime = () => {
      setPreview(
        allowPreview &&
          new URLSearchParams(window.location.search).get("preview") === "true"
      );
      setNow(Date.now());
    };
    let intervalId;
    const startInterval = () => {
      updateTime();
      intervalId = window.setInterval(updateTime, 1000);
    };
    const initialUpdate = window.setTimeout(startInterval, 0);
    const handleVisibilityChange = () => {
      if (document.hidden) {
        window.clearInterval(intervalId);
        intervalId = undefined;
      } else {
        window.clearInterval(intervalId);
        startInterval();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearTimeout(initialUpdate);
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [allowPreview]);

  return {
    mounted: now !== null,
    now,
    isLive: now !== null && (preview || now >= Date.parse(RESULTS_UNLOCK_AT)),
  };
}