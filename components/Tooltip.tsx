"use client";

import { useState, type ReactNode } from "react";

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
}: {
  label: string;
  explain: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className={`nudge-tooltip${open ? " nudge-tooltip--open" : ""}`}
      onClick={() => setOpen((o) => !o)}
    >
      {children}
      <span className="nudge-tooltip-bubble" role="tooltip">
        <span className="nudge-tooltip-bubble-label">{label}</span>
        <span className="nudge-tooltip-bubble-text">{explain}</span>
      </span>
    </span>
  );
}
