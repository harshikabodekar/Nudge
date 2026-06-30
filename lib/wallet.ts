import { companies } from "@/lib/nudge-data";

export interface Holding {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  invested: number;
}

export interface Wallet {
  cash: number;
  holdings: Record<string, Holding>;
}

// v2 = symbol-keyed holdings. v1 (legacy) was keyed by preset array index
// (0/1/2), which could only ever represent the 3 preset companies.
const STORAGE_KEY = "nudge_wallet_v2";
const LEGACY_STORAGE_KEY = "nudge_wallet_v1";
const STARTING_CASH = 10000;

export const EMPTY_WALLET: Wallet = { cash: STARTING_CASH, holdings: {} };

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isValidWallet(value: unknown): value is Wallet {
  if (!value || typeof value !== "object") return false;
  const w = value as { cash?: unknown; holdings?: unknown };
  if (!isFiniteNumber(w.cash)) return false;
  if (!w.holdings || typeof w.holdings !== "object") return false;

  return Object.values(w.holdings as Record<string, unknown>).every((h) => {
    if (!h || typeof h !== "object") return false;
    const holding = h as Partial<Holding>;
    return (
      typeof holding.symbol === "string" &&
      typeof holding.name === "string" &&
      isFiniteNumber(holding.quantity) &&
      isFiniteNumber(holding.avgPrice) &&
      isFiniteNumber(holding.invested)
    );
  });
}

/**
 * Converts the old index-keyed wallet (holdings keyed 0/1/2 by position in
 * the preset companies array) into the new symbol-keyed shape. Returns null
 * if any entry can't be cleanly mapped (unknown index, corrupt entry, etc.)
 * — callers should treat that as "migration failed" and start fresh rather
 * than persist partial or corrupt data.
 */
function migrateLegacyWallet(raw: unknown): Wallet | null {
  if (!raw || typeof raw !== "object") return null;
  const legacy = raw as { cash?: unknown; holdings?: unknown };
  if (!isFiniteNumber(legacy.cash)) return null;
  if (!legacy.holdings || typeof legacy.holdings !== "object") return null;

  const holdings: Record<string, Holding> = {};
  for (const [key, value] of Object.entries(legacy.holdings as Record<string, unknown>)) {
    const idx = Number(key);
    const company = Number.isInteger(idx) ? companies[idx] : undefined;
    if (!company || !value || typeof value !== "object") return null;

    const entry = value as { shares?: unknown; cost?: unknown };
    if (
      !isFiniteNumber(entry.shares) ||
      entry.shares <= 0 ||
      !isFiniteNumber(entry.cost)
    ) {
      return null;
    }

    holdings[company.symbol] = {
      symbol: company.symbol,
      name: company.name,
      quantity: entry.shares,
      avgPrice: entry.cost / entry.shares,
      invested: entry.cost,
    };
  }

  return { cash: legacy.cash, holdings };
}

export function persistWallet(wallet: Wallet): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wallet));
  } catch {
    // ignore write failures (e.g. private browsing / storage full)
  }
}

/**
 * Loads the wallet on startup: prefers the current symbol-keyed format,
 * falls back to migrating the legacy index-keyed one (writing the result
 * back so migration only ever runs once), and resets to a fresh wallet if
 * neither is present or usable. Never throws, never leaves corrupt data
 * in place.
 */
export function loadWallet(): Wallet {
  if (typeof window === "undefined") return EMPTY_WALLET;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isValidWallet(parsed)) return parsed;
    }
  } catch {
    // fall through to legacy migration / fresh wallet
  }

  try {
    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      const migrated = migrateLegacyWallet(JSON.parse(legacyRaw));
      if (migrated) {
        persistWallet(migrated);
        return migrated;
      }
    }
  } catch {
    // fall through to fresh wallet
  }

  return EMPTY_WALLET;
}

export function resetWallet(): Wallet {
  persistWallet(EMPTY_WALLET);
  return EMPTY_WALLET;
}

/**
 * Applies a buy to a wallet and returns the next state. Returns the same
 * wallet reference unchanged if the order can't be filled (quantity < 1,
 * bad price, or insufficient cash) — callers can compare `=== wallet` to
 * detect a no-op.
 */
export function buyShares(
  wallet: Wallet,
  company: { symbol: string; name: string },
  quantity: number,
  price: number
): Wallet {
  if (!Number.isFinite(quantity) || quantity < 1 || !Number.isFinite(price) || price <= 0) {
    return wallet;
  }
  const cost = quantity * price;
  if (wallet.cash < cost) return wallet;

  const existing = wallet.holdings[company.symbol];
  const nextQuantity = (existing?.quantity ?? 0) + quantity;
  const nextInvested = (existing?.invested ?? 0) + cost;

  const holdings: Record<string, Holding> = {
    ...wallet.holdings,
    [company.symbol]: {
      symbol: company.symbol,
      name: company.name,
      quantity: nextQuantity,
      avgPrice: nextInvested / nextQuantity,
      invested: nextInvested,
    },
  };

  return {
    cash: Math.round((wallet.cash - cost) * 100) / 100,
    holdings,
  };
}

/**
 * Applies a sell to a wallet and returns the next state. Returns the same
 * wallet reference unchanged if the order can't be filled (nothing held,
 * quantity < 1, more than currently held, or bad price) — callers can
 * compare `=== wallet` to detect a no-op (e.g. an oversell attempt).
 *
 * Selling reduces the holding's invested (cost-basis) amount proportionally
 * to the quantity sold, keeping avgPrice unchanged for whatever remains —
 * the standard "average cost basis" approach, so partial sells don't distort
 * the average price of the shares still held.
 */
export function sellShares(wallet: Wallet, symbol: string, quantity: number, price: number): Wallet {
  const existing = wallet.holdings[symbol];
  if (
    !existing ||
    !Number.isFinite(quantity) ||
    quantity < 1 ||
    quantity > existing.quantity ||
    !Number.isFinite(price) ||
    price <= 0
  ) {
    return wallet;
  }

  const proceeds = quantity * price;
  const remainingQuantity = existing.quantity - quantity;
  const costBasisSold = existing.avgPrice * quantity;

  const holdings: Record<string, Holding> = { ...wallet.holdings };
  if (remainingQuantity <= 0) {
    delete holdings[symbol];
  } else {
    holdings[symbol] = {
      ...existing,
      quantity: remainingQuantity,
      invested: Math.max(0, existing.invested - costBasisSold),
    };
  }

  return {
    cash: Math.round((wallet.cash + proceeds) * 100) / 100,
    holdings,
  };
}
