"use client";

import { useState, type ReactNode } from "react";
import { markConceptLearned } from "@/lib/learned";

/**
 * Wraps a term so its plain-language explainer appears instantly on hover
 * (pure CSS — no JS delay) via the .nudge-tooltip rules in globals.css.
 * Touch devices have no hover, so a tap toggles the same bubble via the
 * `open` class instead.
 */
export default function Tooltip({
  label,
  explain,
  children,
  conceptId,
}: {
  label: string;
  explain: string;
  children: ReactNode;
  conceptId?: string;
}) {
  const [open, setOpen] = useState(false);

  const trackLearned = () => {
    if (conceptId) markConceptLearned(conceptId);
  };

  return (
    <span
      className={`nudge-tooltip${open ? " nudge-tooltip--open" : ""}`}
      onClick={() => { trackLearned(); setOpen((o) => !o); }}
      onMouseEnter={trackLearned}
    >
      {children}
      <span className="nudge-tooltip-bubble" role="tooltip">
        <span className="nudge-tooltip-bubble-label">{label}</span>
        <span className="nudge-tooltip-bubble-text">{explain}</span>
      </span>
    </span>
  );
}
