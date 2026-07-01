export const CONCEPTS = {
  pe:     { label: "P/E ratio",         blurb: "how pricey a stock is vs what it earns" },
  mcap:   { label: "market cap",        blurb: "the total value of the whole company" },
  high:   { label: "52-week high",      blurb: "the highest price this stock hit in a year" },
  low:    { label: "52-week low",       blurb: "the lowest price this stock hit in a year" },
  ltp:    { label: "LTP / live price",  blurb: "the most recent price this stock changed hands at" },
  avgcost:{ label: "avg cost",          blurb: "the average price you paid per share across all your buys" },
  market: { label: "market order",      blurb: "buy or sell right now at the current price" },
  limit:  { label: "limit order",       blurb: "you name the price you're willing to trade at" },
  pnl:    { label: "P&L",              blurb: "profit and loss — how much more or less your shares are worth" },
  qty:    { label: "qty",              blurb: "how many shares you want to buy or sell" },
  share:  { label: "what a share is",   blurb: "a tiny piece of ownership in a company" },
} as const;

export type ConceptId = keyof typeof CONCEPTS;

const VALID_IDS = new Set(Object.keys(CONCEPTS));
const STORAGE_KEY = "nudge_learned_v1";

export function getLearnedConcepts(): ConceptId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is ConceptId => VALID_IDS.has(id));
  } catch {
    return [];
  }
}

export function markConceptLearned(id: string): void {
  if (!VALID_IDS.has(id)) return;
  try {
    const current = getLearnedConcepts();
    if (current.includes(id as ConceptId)) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, id]));
  } catch {
    // ignore write failures
  }
}

export function isConceptLearned(id: string): boolean {
  return getLearnedConcepts().includes(id as ConceptId);
}
