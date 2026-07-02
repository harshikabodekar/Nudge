import type { Goal } from "@/lib/goal";
import type { Company } from "@/lib/nudge-data";

export type GoalFitVerdict = "good" | "caution" | "risky";

export interface GoalFit {
  verdict: GoalFitVerdict;
  message: string;
}

export function matchGoalToCompany(goal: Goal, company: Company): GoalFit {
  const months = goal.timeframeMonths;
  const { vibe, name } = company;

  if (vibe === "red") {
    if (months && months <= 12) {
      return {
        verdict: "risky",
        message: `${name} has real risk flags right now, and your goal is only ${months} months away. A rough quarter could dent what you've saved.`,
      };
    }
    return {
      verdict: "risky",
      message: `${name} is showing some red flags. Worth understanding the risks before putting money in.`,
    };
  }

  if (vibe === "yellow") {
    if (months && months <= 6) {
      return {
        verdict: "caution",
        message: `${name} has mixed signals. For a goal just ${months} months away, something steadier might be safer.`,
      };
    }
    if (months && months <= 18) {
      return {
        verdict: "caution",
        message: `${name} has mixed signals right now. Worth keeping an eye on before committing real money.`,
      };
    }
    return {
      verdict: "good",
      message: `${name} looks reasonable for a longer-term goal like "${goal.label}" — just watch for the mixed signals.`,
    };
  }

  // vibe === "green"
  if (months && months <= 3) {
    return {
      verdict: "caution",
      message: `${name} is steady, but even stable stocks can dip in 3 months. No guarantees in the short term.`,
    };
  }
  return {
    verdict: "good",
    message: `${name} is one of the more reliable options out there. That lines up well with "${goal.label}".`,
  };
}
