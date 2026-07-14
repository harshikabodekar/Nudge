// Compat shim — re-exports from @/lib/goals so existing imports keep working.
// New code should import directly from @/lib/goals.
export type { Goal } from "@/lib/goals";
export { saveGoals, updateGoal, deleteGoal } from "@/lib/goals";

import { loadGoals, deleteGoal } from "@/lib/goals";
import type { Goal } from "@/lib/goals";

export function loadGoal(): Goal | null {
  return loadGoals()[0] ?? null;
}

export function clearGoal(): void {
  const first = loadGoals()[0];
  if (first) deleteGoal(first.id);
}

export function hasGoal(): boolean {
  return loadGoals().length > 0;
}

// saveGoal kept for type-safety; new code uses addGoal from @/lib/goals
export function saveGoal(_goal: unknown): void {
  // no-op — callers have been migrated to addGoal
}
