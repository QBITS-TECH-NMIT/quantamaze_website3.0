"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";

export default function TrackModal({ track, onClose, triggerRef }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!track) return;

    const triggerElement = triggerRef?.current;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    const focusableSelector = [
      "button",
      "[href]",
      "input",
      "textarea",
      "select",
      "[tabindex]:not([tabindex='-1'])",
    ].join(", ");

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(dialogRef.current.querySelectorAll(focusableSelector)).filter(
        (element) => !element.disabled && !element.hasAttribute("aria-hidden"),
      );

      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    const focusTarget = dialogRef.current?.querySelector("button, [href], [tabindex]:not([tabindex='-1'])");
    requestAnimationFrame(() => {
      if (focusTarget) focusTarget.focus();
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      document.removeEventListener("keydown", handleKeyDown);

      if (triggerElement) {
        triggerElement.focus();
      }
    };
  }, [track, onClose, triggerRef]);

  return (
    <AnimatePresence>
      {track ? (
        <motion.div
          key={track.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-[6px] sm:p-8"
          style={{
            scrollbarWidth: "thin",
          }}
          onClick={onClose}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="track-modal-title"
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
            tabIndex={-1}
            className="relative w-full max-w-[720px] max-h-[85vh] overflow-y-auto rounded-2xl border border-[#f5590a]/25 bg-[#111318]/95 shadow-[0_28px_90px_rgba(0,0,0,0.72)] sm:rounded-2xl"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(245, 89, 10, 0.6) transparent",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl text-[#f2f2f2] transition hover:border-[#f5590a]/50 hover:text-[#ff8c3a]"
              aria-label="Close track details"
            >
              ×
            </button>

            <div className="p-5 pb-6 sm:p-8 sm:pb-8">
              <div className="mb-5 flex items-center justify-between gap-4 pr-12">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-[#f5590a]/20 bg-[#f5590a]/10 text-lg text-[#ff8c3a]">
                    {track.icon}
                  </div>
                  <span className="rounded border border-[#f5590a]/20 bg-[#f5590a]/10 px-2 py-1 font-mono text-[0.6rem] font-bold tracking-[0.2em] text-[#f5590a] uppercase">
                    {track.code}
                  </span>
                </div>
              </div>

              <p className="section-kicker mb-3">Track detail</p>
              <h2
                id="track-modal-title"
                className="display-heading gradient-text mb-3 text-3xl font-black uppercase leading-tight tracking-[-0.06em] sm:text-4xl"
              >
                {track.title}
              </h2>

              <p className="mb-5 text-base font-medium text-[#f2f2f2]/80 sm:text-lg">
                {track.tagline}
              </p>

              <div className="mb-6 flex flex-wrap gap-2">
                <span className="rounded border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[#d6d1cb]">
                  {track.difficulty}
                </span>
                <span className="rounded border border-[#f5590a]/20 bg-[#f5590a]/10 px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[#ff8c3a]">
                  {track.duration}
                </span>
              </div>

              <p className="mb-6 text-sm leading-7 text-[#d6d1cb] sm:text-[0.98rem]">
                {track.description}
              </p>

              <div className="mb-6">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#f2f2f2]">
                  Skills covered
                </h3>
                <div className="flex flex-wrap gap-2">
                  {track.topics.map((topic) => (
                    <span
                      key={topic}
                      className="rounded-full border border-[#f5590a]/20 bg-[#f5590a]/10 px-3 py-1.5 text-xs text-[#f9cba7]"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {track.mentors && track.mentors.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#f2f2f2]">
                    Mentors
                  </h3>
                  <ul className="space-y-2 text-sm text-[#d6d1cb]">
                    {track.mentors.map((mentor) => (
                      <li key={mentor} className="flex items-center gap-2">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#f5590a]" />
                        {mentor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
