const STORAGE_KEY = "nudge_first_trade_done_v1";

export function hasCompletedFirstTrade(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function markFirstTradeComplete(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "true");
  } catch {
    // ignore write failures (private browsing / storage full)
  }
}
