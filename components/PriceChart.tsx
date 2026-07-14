"use client";

import { useEffect, useId, useRef, useState } from "react";
import { markConceptLearned } from "@/lib/learned";
import type { OHLCPoint } from "@/lib/yahooFinance";

type Range = "1mo" | "6mo" | "1y";
type ChartType = "line" | "candle";

const RANGE_CONFIG: Record<Range, { range: string; interval: string; label: string }> = {
  "1mo": { range: "1mo", interval: "1d",  label: "1M" },
  "6mo": { range: "6mo", interval: "1wk", label: "6M" },
  "1y":  { range: "1y",  interval: "1mo", label: "1Y" },
};

// SVG layout constants
const W  = 400;
const H  = 200;
const ML = 52;      // left margin for Y labels
const MR = 12;
const MT = 12;
const MB = 36;      // bottom margin for X labels
const CW = W - ML - MR;   // 336
const CH = H - MT - MB;   // 152

type Effect = "pulse" | "arrow" | "spotlight-body" | "spotlight-wick" | "range-toggle" | "none";

interface SchoolStep {
  title: string;
  body: string;
  chartType: ChartType;
  effect: Effect;
}

const SCHOOL_STEPS: SchoolStep[] = [
  {
    title: "this line is just the price over time",
    body: "each point on the line shows what the stock cost on that date. the line connecting them tells the story of its ups and downs.",
    chartType: "line",
    effect: "pulse",
  },
  {
    title: "up and to the right = growing",
    body: "when the line trends upward over time, the stock has gained value. but past direction doesn't promise future direction.",
    chartType: "line",
    effect: "arrow",
  },
  {
    title: "each candle = one period",
    body: "green: the price closed higher than it opened that period — buyers won. red: it closed lower — sellers won.",
    chartType: "candle",
    effect: "spotlight-body",
  },
  {
    title: "the thin wicks = the full range",
    body: "the thin line above shows the highest price it touched. the one below shows the lowest. the fat body is just open-to-close.",
    chartType: "candle",
    effect: "spotlight-wick",
  },
  {
    title: "zoom out before you judge",
    body: "one month can look scary. one year often shows a clearer picture. context matters more than any single candle.",
    chartType: "line",
    effect: "range-toggle",
  },
  {
    title: "what you should NOT do",
    body: "don't judge a company by one red day. even great companies have rough weeks. what matters is the long-term direction.",
    chartType: "line",
    effect: "none",
  },
];

function fmtPrice(n: number): string {
  return n.toLocaleString("en-IN");
}

function formatYLabel(price: number): string {
  if (price >= 100_000) return `${(price / 100_000).toFixed(1)}L`;
  if (price >= 1_000)   return `${(price / 1_000).toFixed(1)}k`;
  return String(Math.round(price));
}

function formatXLabel(ts: number, range: Range): string {
  const d = new Date(ts * 1000);
  if (range === "1y") return d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

function formatTooltipDate(ts: number, range: Range): string {
  const d = new Date(ts * 1000);
  if (range === "1y") return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function makeSmoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const cx = (p0.x + p1.x) / 2;
    d += ` C ${cx.toFixed(1)} ${p0.y.toFixed(1)}, ${cx.toFixed(1)} ${p1.y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
  }
  return d;
}

interface PriceChartProps {
  symbol: string;
  compact?: boolean;
}

export default function PriceChart({ symbol, compact = false }: PriceChartProps) {
  const uid = useId().replace(/:/g, "");
  const [range, setRange] = useState<Range>(compact ? "1y" : "1y");
  const [chartType, setChartType] = useState<ChartType>("line");
  const [data, setData] = useState<OHLCPoint[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [schoolStep, setSchoolStep] = useState<number | null>(null);
  const [schoolDone, setSchoolDone] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const dataCacheRef = useRef<Partial<Record<Range, OHLCPoint[]>>>({});
  const autoToggleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setSchoolDone(localStorage.getItem("nudge_chart_school_v1") === "done");
    } catch { /* ignore */ }
  }, []);

  // Fetch data whenever symbol or range changes
  useEffect(() => {
    if (!symbol) return;
    const cached = dataCacheRef.current[range];
    if (cached) {
      setData(cached);
      setStatus(cached.length >= 2 ? "ready" : "error");
      setAnimKey(k => k + 1);
      return;
    }
    setStatus("loading");
    const cfg = RANGE_CONFIG[range];
    fetch(`/api/history?symbol=${encodeURIComponent(symbol)}&range=${cfg.range}&interval=${cfg.interval}`)
      .then(r => r.json())
      .then((json: { history?: OHLCPoint[] }) => {
        const pts = json.history ?? [];
        dataCacheRef.current[range] = pts;
        setData(pts);
        setStatus(pts.length >= 2 ? "ready" : "error");
        setAnimKey(k => k + 1);
      })
      .catch(() => {
        dataCacheRef.current[range] = [];
        setData([]);
        setStatus("error");
      });
  }, [symbol, range]);

  // Apply chart type from school step
  useEffect(() => {
    if (schoolStep === null) return;
    setChartType(SCHOOL_STEPS[schoolStep].chartType);
  }, [schoolStep]);

  // Auto-toggle range on school step 4
  useEffect(() => {
    if (schoolStep !== 4) {
      if (autoToggleRef.current) clearInterval(autoToggleRef.current);
      return;
    }
    autoToggleRef.current = setInterval(() => {
      setRange(r => (r === "1mo" ? "1y" : "1mo"));
    }, 2200);
    return () => { if (autoToggleRef.current) clearInterval(autoToggleRef.current); };
  }, [schoolStep]);

  // Body scroll lock while school is open
  useEffect(() => {
    document.body.style.overflow = schoolStep !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [schoolStep]);

  const openSchool = () => {
    setSchoolStep(0);
    setChartType("line");
    setRange("6mo");
    setTimeout(() => {
      wrapRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
  };

  const closeSchool = () => {
    setSchoolStep(null);
    if (autoToggleRef.current) clearInterval(autoToggleRef.current);
  };

  const completeSchool = () => {
    markConceptLearned("charts");
    try { localStorage.setItem("nudge_chart_school_v1", "done"); } catch { /* ignore */ }
    setSchoolDone(true);
    closeSchool();
  };

  const nextStep = () => {
    if (schoolStep === null) return;
    if (schoolStep >= SCHOOL_STEPS.length - 1) completeSchool();
    else setSchoolStep(schoolStep + 1);
  };

  const prevStep = () => {
    if (schoolStep === null || schoolStep === 0) return;
    setSchoolStep(schoolStep - 1);
  };

  // --- SVG coordinate helpers ---
  const closes = data.map(d => d.close);
  const highs  = data.map(d => d.high);
  const lows   = data.map(d => d.low);

  const allValues = chartType === "line" ? closes : [...highs, ...lows];
  const rawMin = allValues.length > 0 ? Math.min(...allValues) : 0;
  const rawMax = allValues.length > 0 ? Math.max(...allValues) : 1;
  const pad = (rawMax - rawMin) * 0.09;
  const domainMin = rawMin - pad;
  const domainMax = rawMax + pad;
  const domainRange = domainMax - domainMin || 1;

  const toY       = (price: number) => MT + CH - ((price - domainMin) / domainRange) * CH;
  const toXLine   = (i: number) => ML + (data.length > 1 ? (i / (data.length - 1)) * CW : CW / 2);
  const toXCandle = (i: number) => ML + (i + 0.5) * (CW / data.length);
  const candleW   = Math.max(2, (CW / Math.max(data.length, 1)) * 0.55);

  // Line path
  const linePts  = data.map((d, i) => ({ x: toXLine(i), y: toY(d.close) }));
  const linePath = makeSmoothPath(linePts);
  const areaPath = linePts.length >= 2
    ? `${linePath} L ${linePts[linePts.length - 1].x.toFixed(1)} ${(MT + CH).toFixed(1)} L ${ML.toFixed(1)} ${(MT + CH).toFixed(1)} Z`
    : "";

  const isUp      = closes.length >= 2 && closes[closes.length - 1] >= closes[0];
  const lineColor = isUp ? "#4F9D69" : "#D17A5A";

  // Axis labels
  const xLabelIndices: number[] = [];
  if (data.length > 0) {
    xLabelIndices.push(0);
    if (data.length >= 4) {
      xLabelIndices.push(Math.floor(data.length / 3));
      xLabelIndices.push(Math.floor((2 * data.length) / 3));
    }
    if (data.length > 1) xLabelIndices.push(data.length - 1);
  }
  const xLabels = [...new Set(xLabelIndices)];
  const yLabelValues = [0, 1, 2, 3].map(i => domainMin + (i / 3) * domainRange);

  // Hover interaction
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current || data.length < 2 || schoolStep !== null) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX  = ((e.clientX - rect.left) / rect.width) * W;
    let idx: number;
    if (chartType === "line") {
      idx = Math.round((svgX - ML) / (CW / (data.length - 1)));
    } else {
      idx = Math.floor((svgX - ML) / (CW / data.length));
    }
    setHoverIdx(Math.max(0, Math.min(data.length - 1, idx)));
  };

  // School helpers
  const isSchoolOpen   = schoolStep !== null;
  const currentEffect  = isSchoolOpen ? SCHOOL_STEPS[schoolStep!].effect : ("none" as Effect);
  const spotlightIdx   = data.length > 1 ? Math.floor(data.length / 2) : 0;
  const spotlightCandle = data[spotlightIdx];

  // Trend arrow coords for step 1
  const arrowSX = ML + CW * 0.13;
  const arrowSY = MT + CH * 0.78;
  const arrowEX = ML + CW * 0.87;
  const arrowEY = MT + CH * 0.18;
  const arrowAngle = Math.atan2(arrowEY - arrowSY, arrowEX - arrowSX);
  const arrowSize  = 11;
  const arrowH1X   = arrowEX - arrowSize * Math.cos(arrowAngle - Math.PI / 5.5);
  const arrowH1Y   = arrowEY - arrowSize * Math.sin(arrowAngle - Math.PI / 5.5);
  const arrowH2X   = arrowEX - arrowSize * Math.cos(arrowAngle + Math.PI / 5.5);
  const arrowH2Y   = arrowEY - arrowSize * Math.sin(arrowAngle + Math.PI / 5.5);

  const hovered     = hoverIdx !== null ? data[hoverIdx] : null;
  const svgH        = compact ? 130 : 200;

  const controlsDisabled = isSchoolOpen && currentEffect !== "range-toggle";

  return (
    <>
      {/* Backdrop */}
      {isSchoolOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(20,15,10,.55)",
            zIndex: 40,
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
          }}
          onClick={closeSchool}
          aria-label="Close chart school"
        />
      )}

      {/* Chart container */}
      <div
        ref={wrapRef}
        style={{
          position: "relative",
          zIndex: isSchoolOpen ? 50 : undefined,
          background: isSchoolOpen ? "#FFFDF9" : "transparent",
          borderRadius: isSchoolOpen ? "calc(var(--radius, 24px) + 4px)" : 0,
          padding: isSchoolOpen ? 16 : 0,
          boxShadow: isSchoolOpen ? "0 28px 70px -20px rgba(20,15,10,.6)" : "none",
          transition: "box-shadow .25s",
        }}
      >
        {/* Controls (hidden in compact or school step that dims them) */}
        {!compact && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              marginBottom: 12,
              flexWrap: "wrap",
              pointerEvents: controlsDisabled ? "none" : "auto",
              opacity: controlsDisabled ? 0.5 : 1,
              transition: "opacity .2s",
            }}
          >
            {/* Chart-type toggle */}
            <div
              style={{
                display: "flex",
                gap: 4,
                background: "#F1ECE1",
                borderRadius: 999,
                padding: 3,
              }}
            >
              {(["line", "candle"] as ChartType[]).map(t => (
                <button
                  key={t}
                  onClick={() => !isSchoolOpen && setChartType(t)}
                  style={{
                    fontFamily: "var(--font-quicksand), sans-serif",
                    fontWeight: 700,
                    fontSize: 13,
                    padding: "5px 12px",
                    borderRadius: 999,
                    border: "none",
                    cursor: isSchoolOpen ? "default" : "pointer",
                    background: chartType === t ? "#FFFDF9" : "transparent",
                    color: chartType === t ? "#2B2620" : "#9A907E",
                    boxShadow: chartType === t ? "0 1px 4px rgba(80,65,40,.12)" : "none",
                    transition: "all .18s",
                  }}
                >
                  {t === "line" ? "line" : "candles"}
                </button>
              ))}
            </div>

            {/* Range buttons */}
            <div
              className={currentEffect === "range-toggle" ? "chart-range-highlight" : ""}
              style={{
                display: "flex",
                gap: 4,
                background: "#F1ECE1",
                borderRadius: 999,
                padding: 3,
              }}
            >
              {(["1mo", "6mo", "1y"] as Range[]).map(r => (
                <button
                  key={r}
                  onClick={() => {
                    if (controlsDisabled) return;
                    setRange(r);
                  }}
                  style={{
                    fontFamily: "var(--font-quicksand), sans-serif",
                    fontWeight: 700,
                    fontSize: 13,
                    padding: "5px 10px",
                    borderRadius: 999,
                    border: "none",
                    cursor: "pointer",
                    background: range === r ? "#FFFDF9" : "transparent",
                    color: range === r ? "#2B2620" : "#9A907E",
                    boxShadow: range === r ? "0 1px 4px rgba(80,65,40,.12)" : "none",
                    transition: "all .18s",
                  }}
                >
                  {RANGE_CONFIG[r].label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Hover tooltip bar */}
        {hovered && !isSchoolOpen && !compact && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
              padding: "7px 12px",
              background: "#2B2620",
              borderRadius: 10,
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-quicksand), sans-serif",
                fontWeight: 700,
                fontSize: 12,
                color: "#9A907E",
              }}
            >
              {formatTooltipDate(hovered.timestamp, range)}
            </span>
            {chartType === "line" ? (
              <span
                style={{
                  fontFamily: "var(--font-quicksand), sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  color: "#FFFDF9",
                }}
              >
                ₹{fmtPrice(Math.round(hovered.close))}
              </span>
            ) : (
              <>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 12.5,
                    color: hovered.close >= hovered.open ? "#6DC38C" : "#E8957A",
                  }}
                >
                  {hovered.close >= hovered.open ? "buyers won" : "sellers won"}
                </span>
                <span style={{ fontSize: 12, color: "#9A907E", fontWeight: 600 }}>
                  {`opened ₹${fmtPrice(Math.round(hovered.open))} · closed ₹${fmtPrice(Math.round(hovered.close))} · high ₹${fmtPrice(Math.round(hovered.high))} · low ₹${fmtPrice(Math.round(hovered.low))}`}
                </span>
              </>
            )}
          </div>
        )}

        {/* SVG chart */}
        <div style={{ position: "relative" }}>
          {status === "loading" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-nunito), sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#B3A998",
                }}
              >
                loading chart…
              </span>
            </div>
          )}
          {status === "error" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-nunito), sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#B3A998",
                }}
              >
                chart unavailable right now
              </span>
            </div>
          )}

          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            style={{
              width: "100%",
              height: svgH,
              display: "block",
              overflow: "visible",
              opacity: status === "ready" ? 1 : 0,
              transition: "opacity .3s",
            }}
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setHoverIdx(null)}
          >
            <defs>
              <linearGradient id={`cGrad-${uid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={lineColor} stopOpacity="0.18" />
                <stop offset="100%" stopColor={lineColor} stopOpacity="0.01" />
              </linearGradient>
              <clipPath id={`cClip-${uid}`}>
                <rect x={ML} y={MT} width={CW} height={CH} />
              </clipPath>
            </defs>

            {/* Y-axis grid + labels */}
            {status === "ready" && yLabelValues.map((price, i) => {
              const y = toY(price);
              if (y < MT - 5 || y > MT + CH + 5) return null;
              return (
                <g key={i}>
                  <line
                    x1={ML} y1={y}
                    x2={ML + CW} y2={y}
                    stroke="rgba(120,105,80,.07)"
                    strokeWidth="1"
                  />
                  <text
                    x={ML - 5}
                    y={y + 4}
                    textAnchor="end"
                    fontSize={9}
                    fontWeight="700"
                    fill="#B3A998"
                    fontFamily="var(--font-quicksand), sans-serif"
                  >
                    {`₹${formatYLabel(price)}`}
                  </text>
                </g>
              );
            })}

            {/* X-axis labels */}
            {status === "ready" && xLabels.map(i => {
              const x = chartType === "line" ? toXLine(i) : toXCandle(i);
              return (
                <text
                  key={i}
                  x={x}
                  y={H - 7}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight="700"
                  fill="#B3A998"
                  fontFamily="var(--font-quicksand), sans-serif"
                >
                  {formatXLabel(data[i].timestamp, range)}
                </text>
              );
            })}

            {/* Line chart */}
            {chartType === "line" && status === "ready" && (
              <g clipPath={`url(#cClip-${uid})`}>
                <path
                  key={`area-${animKey}`}
                  d={areaPath}
                  fill={`url(#cGrad-${uid})`}
                />
                <path
                  key={`line-${animKey}`}
                  d={linePath}
                  fill="none"
                  stroke={lineColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength="100"
                  className={currentEffect === "pulse" ? "chart-school-pulse" : "chart-line-animate"}
                />
              </g>
            )}

            {/* Candle chart */}
            {chartType === "candle" && status === "ready" && data.map((pt, i) => {
              const isGreen  = pt.close >= pt.open;
              const color    = isGreen ? "#4F9D69" : "#D17A5A";
              const bodyTop  = toY(Math.max(pt.open, pt.close));
              const bodyBot  = toY(Math.min(pt.open, pt.close));
              const bodyH    = Math.max(1.5, bodyBot - bodyTop);
              const cx       = toXCandle(i);
              const wickTop  = toY(pt.high);
              const wickBot  = toY(pt.low);
              const isSpot   = i === spotlightIdx;
              const dimmed   =
                (currentEffect === "spotlight-body" || currentEffect === "spotlight-wick") &&
                !isSpot;

              return (
                <g
                  key={`candle-${i}-${animKey}`}
                  className="chart-candle"
                  style={{
                    animationDelay: `${Math.min(i * 0.022, 0.55)}s`,
                    opacity: dimmed ? 0.12 : 1,
                  }}
                >
                  {/* Wick */}
                  <line
                    x1={cx} y1={wickTop}
                    x2={cx} y2={wickBot}
                    stroke={color}
                    strokeWidth="1.5"
                  />
                  {/* Body */}
                  <rect
                    x={cx - candleW / 2}
                    y={bodyTop}
                    width={candleW}
                    height={bodyH}
                    fill={color}
                    rx={1}
                  />
                  {/* Spotlight label — body */}
                  {isSpot && currentEffect === "spotlight-body" && (
                    <text
                      x={cx + candleW / 2 + 5}
                      y={bodyTop + bodyH / 2 + 4}
                      fontSize={8.5}
                      fontWeight="700"
                      fill={color}
                      fontFamily="var(--font-quicksand), sans-serif"
                    >
                      {isGreen ? "closed higher ▲" : "closed lower ▼"}
                    </text>
                  )}
                  {/* Spotlight labels — wicks */}
                  {isSpot && currentEffect === "spotlight-wick" && (
                    <>
                      <text
                        x={cx + candleW / 2 + 5}
                        y={wickTop + 4}
                        fontSize={8.5}
                        fontWeight="700"
                        fill="#7A715F"
                        fontFamily="var(--font-quicksand), sans-serif"
                      >
                        ↑ highest
                      </text>
                      <text
                        x={cx + candleW / 2 + 5}
                        y={wickBot}
                        fontSize={8.5}
                        fontWeight="700"
                        fill="#7A715F"
                        fontFamily="var(--font-quicksand), sans-serif"
                      >
                        ↓ lowest
                      </text>
                    </>
                  )}
                </g>
              );
            })}

            {/* School step 1 — trend arrow overlay */}
            {currentEffect === "arrow" && status === "ready" && (
              <g>
                <line
                  x1={arrowSX} y1={arrowSY}
                  x2={arrowEX} y2={arrowEY}
                  stroke="#4F9D69"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity={0.85}
                />
                <polygon
                  points={`${arrowEX},${arrowEY} ${arrowH1X},${arrowH1Y} ${arrowH2X},${arrowH2Y}`}
                  fill="#4F9D69"
                  opacity={0.85}
                />
                <text
                  x={(arrowSX + arrowEX) / 2 + 12}
                  y={(arrowSY + arrowEY) / 2 - 7}
                  fontSize={9}
                  fontWeight="700"
                  fill="#36774A"
                  fontFamily="var(--font-quicksand), sans-serif"
                >
                  up over time →
                </text>
              </g>
            )}

            {/* Hover crosshair — line chart */}
            {hoverIdx !== null && !isSchoolOpen && status === "ready" && chartType === "line" && (
              <g>
                <line
                  x1={toXLine(hoverIdx)} y1={MT}
                  x2={toXLine(hoverIdx)} y2={MT + CH}
                  stroke="rgba(120,105,80,.3)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={toXLine(hoverIdx)}
                  cy={toY(data[hoverIdx].close)}
                  r={4}
                  fill={lineColor}
                  stroke="#FFFDF9"
                  strokeWidth={2}
                />
              </g>
            )}

            {/* Hover crosshair — candle chart */}
            {hoverIdx !== null && !isSchoolOpen && status === "ready" && chartType === "candle" && (
              <line
                x1={toXCandle(hoverIdx)} y1={MT}
                x2={toXCandle(hoverIdx)} y2={MT + CH}
                stroke="rgba(120,105,80,.25)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            )}

            {/* Spotlight middle candle highlight ring */}
            {(currentEffect === "spotlight-body" || currentEffect === "spotlight-wick") &&
              status === "ready" &&
              spotlightCandle && (
                <rect
                  x={toXCandle(spotlightIdx) - candleW / 2 - 4}
                  y={toY(spotlightCandle.high) - 4}
                  width={candleW + 8}
                  height={toY(spotlightCandle.low) - toY(spotlightCandle.high) + 8}
                  fill="none"
                  stroke="var(--accent, #4F9D69)"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  rx={3}
                  opacity={0.7}
                />
              )}
          </svg>
        </div>

        {/* Chart school trigger button */}
        {!compact && !isSchoolOpen && (
          <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={openSchool}
              style={{
                fontFamily: "var(--font-nunito), sans-serif",
                fontWeight: 700,
                fontSize: 13,
                color: "#7A715F",
                background: "none",
                border: "1px solid rgba(120,105,80,.28)",
                borderRadius: 999,
                cursor: "pointer",
                padding: "6px 14px",
                transition: "border-color .15s",
              }}
            >
              {schoolDone ? "revisit chart school ↗" : "how do i read this? ✨"}
            </button>
          </div>
        )}

        {/* School panel */}
        {isSchoolOpen && (
          <div
            style={{
              marginTop: 14,
              background: "#FFFDF9",
              border: "1px solid rgba(120,105,80,.14)",
              borderRadius: 16,
              padding: "18px 20px",
            }}
          >
            {/* Step title + skip */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 10,
                marginBottom: 9,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-quicksand), sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  color: "#2B2620",
                  lineHeight: 1.35,
                }}
              >
                {SCHOOL_STEPS[schoolStep!].title}
              </div>
              <button
                onClick={closeSchool}
                style={{
                  fontFamily: "var(--font-nunito), sans-serif",
                  fontWeight: 700,
                  fontSize: 12,
                  color: "#9A907E",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px 0",
                  flexShrink: 0,
                }}
              >
                skip ×
              </button>
            </div>

            <p
              style={{
                fontFamily: "var(--font-nunito), sans-serif",
                fontSize: 14.5,
                fontWeight: 500,
                color: "#4A4339",
                lineHeight: 1.55,
                margin: "0 0 16px",
              }}
            >
              {SCHOOL_STEPS[schoolStep!].body}
            </p>

            {/* Progress dots + nav buttons */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 5 }}>
                {SCHOOL_STEPS.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: i === schoolStep ? "var(--accent, #4F9D69)" : "rgba(120,105,80,.2)",
                      transition: "background .2s",
                    }}
                  />
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {schoolStep! > 0 && (
                  <button
                    onClick={prevStep}
                    style={{
                      fontFamily: "var(--font-quicksand), sans-serif",
                      fontWeight: 700,
                      fontSize: 13.5,
                      color: "#7A715F",
                      background: "#F1ECE1",
                      border: "none",
                      cursor: "pointer",
                      padding: "8px 16px",
                      borderRadius: 999,
                    }}
                  >
                    ← back
                  </button>
                )}
                <button
                  onClick={nextStep}
                  style={{
                    fontFamily: "var(--font-quicksand), sans-serif",
                    fontWeight: 700,
                    fontSize: 13.5,
                    color: "#fff",
                    background: "var(--accent, #4F9D69)",
                    border: "none",
                    cursor: "pointer",
                    padding: "8px 18px",
                    borderRadius: 999,
                    boxShadow: "0 6px 16px color-mix(in srgb, var(--accent, #4F9D69) 30%, transparent)",
                  }}
                >
                  {schoolStep === SCHOOL_STEPS.length - 1 ? "got it ✓" : "next →"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
