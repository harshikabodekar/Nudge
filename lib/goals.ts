export interface Goal {
  id: string;
  label: string;
  targetAmount: number;
  monthlyAmount?: number;
  timeframeMonths?: number; // kept for goalFit compat; not set on goals created after Phase 1
  createdAt: number;
  allocation: number; // 0–100, soft % of total portfolio value tracked toward this goal
}

const GOALS_KEY = "nudge_goals_v1";
const ACTIVE_KEY = "nudge_active_goal_v1";
const MILESTONES_KEY = "nudge_milestones_v1";
const LEGACY_KEY = "nudge_goal_v1";

function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function isValidGoal(v: unknown): v is Goal {
  if (!v || typeof v !== "object") return false;
  const g = v as Partial<Goal>;
  if (typeof g.id !== "string" || !g.id) return false;
  if (typeof g.label !== "string" || !g.label.trim()) return false;
  if (typeof g.targetAmount !== "number" || !Number.isFinite(g.targetAmount) || g.targetAmount <= 0) return false;
  if (typeof g.createdAt !== "number" || !Number.isFinite(g.createdAt)) return false;
  if (typeof g.allocation !== "number") return false;
  return true;
}

export function loadGoals(): Goal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GOALS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const valid = parsed.filter(isValidGoal);
        if (valid.length > 0) return valid;
      }
    }
    // Auto-migrate from legacy single-goal key
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const old = JSON.parse(legacy) as Record<string, unknown>;
      if (
        old &&
        typeof old.label === "string" &&
        old.label.trim() &&
        typeof old.targetAmount === "number" &&
        old.targetAmount > 0
      ) {
        const migrated: Goal = {
          id: genId(),
          label: old.label,
          targetAmount: old.targetAmount,
          ...(typeof old.timeframeMonths === "number" ? { timeframeMonths: old.timeframeMonths } : {}),
          createdAt: typeof old.createdAt === "number" ? old.createdAt : Date.now(),
          allocation: 100,
        };
        saveGoals([migrated]);
        return [migrated];
      }
    }
  } catch {
    // ignore
  }
  return [];
}

export function saveGoals(goals: Goal[]): void {
  try {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  } catch {
    // ignore write failures (private browsing / storage full)
  }
}

export function addGoal(draft: Omit<Goal, "id" | "createdAt">): Goal {
  const existing = loadGoals();
  const goal: Goal = { ...draft, id: genId(), createdAt: Date.now() };
  saveGoals([...existing, goal]);
  return goal;
}

export function updateGoal(updated: Goal): void {
  saveGoals(loadGoals().map((g) => (g.id === updated.id ? updated : g)));
}

export function deleteGoal(id: string): void {
  saveGoals(loadGoals().filter((g) => g.id !== id));
}

export function loadActiveGoalId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

export function saveActiveGoalId(id: string | null): void {
  try {
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else localStorage.removeItem(ACTIVE_KEY);
  } catch {
    // ignore
  }
}

export function getSeenMilestones(goalId: string): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MILESTONES_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as Record<string, unknown>;
    return Array.isArray(data[goalId]) ? (data[goalId] as number[]) : [];
  } catch {
    return [];
  }
}

export function markMilestoneSeen(goalId: string, pct: number): void {
  try {
    const raw = localStorage.getItem(MILESTONES_KEY);
    const data: Record<string, number[]> = raw ? JSON.parse(raw) : {};
    const seen = Array.isArray(data[goalId]) ? data[goalId] : [];
    if (!seen.includes(pct)) {
      data[goalId] = [...seen, pct];
      localStorage.setItem(MILESTONES_KEY, JSON.stringify(data));
    }
  } catch {
    // ignore
  }
}

// Binary search for months needed at 12 %/yr compound + monthly contributions.
// FV(n) = pv*(1+r)^n + pmt*((1+r)^n - 1)/r,  r = 0.12/12
// Returns 0 if already reached, null if unreachable within 50 years.
export function monthsToTarget(pv: number, pmt: number, target: number): number | null {
  if (pv >= target) return 0;
  if (pmt <= 0) return null;
  const r = 0.12 / 12;
  const fv = (n: number) => {
    const g = Math.pow(1 + r, n);
    return pv * g + (pmt * (g - 1)) / r;
  };
  if (fv(600) < target) return null;
  let lo = 1,
    hi = 600;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (fv(mid) >= target) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

export function formatProjectionDate(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}
