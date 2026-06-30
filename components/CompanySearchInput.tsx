"use client";

import { useState } from "react";
import { useSymbolSearch } from "@/lib/useSymbolSearch";
import type { SymbolSearchResult } from "@/lib/yahooFinance";

export default function CompanySearchInput({
  query,
  onQueryChange,
  onPick,
  placeholder = "search any company...",
}: {
  query: string;
  onQueryChange: (q: string) => void;
  onPick: (result: SymbolSearchResult) => void;
  placeholder?: string;
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { results, status } = useSymbolSearch(query);

  const closeDropdownSoon = () => {
    setTimeout(() => setDropdownOpen(false), 150);
  };

  const handlePick = (result: SymbolSearchResult) => {
    setDropdownOpen(false);
    onPick(result);
  };

  const showDropdown = dropdownOpen && query.trim().length >= 2;

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "#FFFDF9",
          border: "1.5px solid rgba(120,105,80,.16)",
          borderRadius: 999,
          padding: "6px 8px 6px 20px",
          boxShadow: "0 10px 30px -18px rgba(80,65,40,.4)",
        }}
      >
        <span style={{ fontSize: 18, color: "#B3A998" }}>⌕</span>
        <input
          value={query}
          onChange={(e) => {
            onQueryChange(e.target.value);
            setDropdownOpen(true);
          }}
          onFocus={() => setDropdownOpen(true)}
          onBlur={closeDropdownSoon}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results.length > 0) {
              handlePick(results[0]);
            }
            if (e.key === "Escape") {
              setDropdownOpen(false);
              e.currentTarget.blur();
            }
          }}
          placeholder={placeholder}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "none",
            fontFamily: "var(--font-nunito), sans-serif",
            fontSize: 17,
            fontWeight: 600,
            color: "#36302A",
            padding: "12px 0",
          }}
        />
        <button
          onClick={() => setDropdownOpen(true)}
          style={{
            fontFamily: "var(--font-quicksand), sans-serif",
            fontWeight: 700,
            fontSize: 15,
            color: "#fff",
            background: "var(--accent, #4F9D69)",
            border: "none",
            cursor: "pointer",
            padding: "12px 22px",
            borderRadius: 999,
          }}
        >
          Search
        </button>
      </div>

      {showDropdown && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            zIndex: 20,
            background: "#FFFDF9",
            border: "1px solid rgba(120,105,80,.16)",
            borderRadius: 18,
            boxShadow: "0 18px 40px -20px rgba(80,65,40,.45)",
            overflow: "hidden",
          }}
        >
          {status === "loading" && (
            <div style={{ padding: "14px 18px", fontSize: 14, fontWeight: 600, color: "#9A907E" }}>
              searching…
            </div>
          )}
          {status === "error" && (
            <div style={{ padding: "14px 18px", fontSize: 14, fontWeight: 600, color: "#9A907E" }}>
              search isn&apos;t working right now — try again in a moment.
            </div>
          )}
          {status === "ready" && results.length === 0 && (
            <div style={{ padding: "14px 18px", fontSize: 14, fontWeight: 600, color: "#9A907E" }}>{`no matches for "${query.trim()}" — try a different name.`}</div>
          )}
          {status === "ready" &&
            results.map((result) => (
              <button
                key={result.symbol}
                // Keep the input focused on mousedown (no blur at all for
                // this interaction) so there's no race between the
                // blur-triggered dropdown-close timer and the click that
                // actually picks this result.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handlePick(result)}
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "12px 18px",
                  border: "none",
                  borderBottom: "1px solid rgba(120,105,80,.08)",
                  background: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "var(--font-nunito), sans-serif",
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 15, color: "#36302A" }}>{result.name}</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "#A89E8B", flex: "none" }}>
                  {result.symbol}
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
