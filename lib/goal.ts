export interface Goal {
  label: string;
  targetAmount: number;
  timeframeMonths?: number;
  createdAt: number;
}

const STORAGE_KEY = "nudge_goal_v1";

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isValidGoal(value: unknown): value is Goal {
  if (!value || typeof value !== "object") return false;
  const g = value as Partial<Goal>;
  if (typeof g.label !== "string" || !g.label.trim()) return false;
  if (!isFiniteNumber(g.targetAmount) || g.targetAmount <= 0) return false;
  if (g.timeframeMonths !== undefined && (!isFiniteNumber(g.timeframeMonths) || g.timeframeMonths <= 0)) {
    return false;
  }
  if (!isFiniteNumber(g.createdAt)) return false;
  return true;
}

export function saveGoal(goal: Goal): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goal));
  } catch {
    // ignore write failures (e.g. private browsing / storage full)
  }
}

/**
 * Loads the saved goal, if any. Returns null when nothing's been set yet
 * or the stored data is missing/corrupt. Never throws.
 */
export function loadGoal(): Goal | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (isValidGoal(parsed)) return parsed;
  } catch {
    // fall through to null
  }

  return null;
}

export function clearGoal(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore removal failures
  }
}

export function hasGoal(): boolean {
  return loadGoal() !== null;
}
