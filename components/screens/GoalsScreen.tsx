"use client";

import { useState, useEffect } from "react";
import { fmt } from "@/lib/nudge-data";
import {
  type Goal,
  updateGoal,
  deleteGoal,
  getSeenMilestones,
  markMilestoneSeen,
  monthsToTarget,
  formatProjectionDate,
  saveActiveGoalId,
} from "@/lib/goals";

const ACCENT = "#4F9D69";
const MILESTONES = [25, 50, 75, 100];

const inputStyle: React.CSSProperties = {
  width: "100%",
  fontFamily: "var(--font-nunito), sans-serif",
  fontWeight: 600,
  fontSize: 15,
  color: "#36302A",
  background: "#FBF7EF",
  border: "1.5px solid rgba(120,105,80,.16)",
  borderRadius: 12,
  padding: "11px 14px",
  outline: "none",
};

const fieldLabelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-quicksand), sans-serif",
  fontWeight: 700,
  fontSize: 14,
  color: "#2B2620",
  marginBottom: 6,
};

// ── GoalCard ────────────────────────────────────────────────────────────────

function GoalCard({
  goal,
  totalValue,
  isActive,
  isOnly,
  onSetActive,
  onUpdate,
  onDelete,
}: {
  goal: Goal;
  totalValue: number;
  isActive: boolean;
  isOnly: boolean;
  onSetActive: () => void;
  onUpdate: (g: Goal) => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editData, setEditData] = useState<{
    label: string;
    targetAmount: string;
    monthlyAmount: string;
  } | null>(null);
  const [localAllocation, setLocalAllocation] = useState(String(goal.allocation));
  const [animPct, setAnimPct] = useState(0);
  const [newMilestone, setNewMilestone] = useState<number | null>(null);

  // Progress
  const allocatedValue = totalValue * (goal.allocation / 100);
  const pct = Math.min(100, Math.max(0, totalValue > 0 ? (allocatedValue / goal.targetAmount) * 100 : 0));
  const awayAmount = Math.max(0, goal.targetAmount - allocatedValue);
  const reached = allocatedValue >= goal.targetAmount;

  // Animate bar on mount
  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimPct(pct));
    return () => cancelAnimationFrame(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Milestone detection (run once after bar animates)
  useEffect(() => {
    if (pct === 0) return;
    const seen = getSeenMilestones(goal.id);
    for (const m of MILESTONES) {
      if (pct >= m && !seen.includes(m)) {
        markMilestoneSeen(goal.id, m);
        setNewMilestone(m);
        break;
      }
    }
  }, [goal.id, pct]);

  // Projection
  const months =
    goal.monthlyAmount && goal.monthlyAmount > 0
      ? monthsToTarget(allocatedValue, goal.monthlyAmount, goal.targetAmount)
      : null;

  // Timeline guidance
  const guideMonths = months ?? goal.timeframeMonths ?? null;
  const guidance =
    guideMonths !== null
      ? guideMonths < 24
        ? "this is a shorter-horizon goal — big stock swings could hurt here, so steadier picks make sense."
        : "time is on your side. equities historically reward patience on goals that are years away."
      : null;

  const startEdit = () => {
    setConfirmDelete(false);
    setEditData({
      label: goal.label,
      targetAmount: String(goal.targetAmount),
      monthlyAmount: goal.monthlyAmount ? String(goal.monthlyAmount) : "",
    });
  };

  const saveEdit = () => {
    if (!editData) return;
    const labelTrimmed = editData.label.trim();
    const targetNum = Number(editData.targetAmount);
    const monthlyNum = editData.monthlyAmount.trim() ? Number(editData.monthlyAmount) : undefined;
    if (!labelTrimmed || !Number.isFinite(targetNum) || targetNum <= 0) return;
    onUpdate({
      ...goal,
      label: labelTrimmed,
      targetAmount: targetNum,
      monthlyAmount:
        monthlyNum !== undefined && Number.isFinite(monthlyNum) && monthlyNum > 0
          ? monthlyNum
          : undefined,
    });
    setEditData(null);
  };

  const saveAllocation = () => {
    const v = Math.max(0, Math.min(100, Number(localAllocation) || 0));
    setLocalAllocation(String(v));
    if (v !== goal.allocation) {
      onUpdate({ ...goal, allocation: v });
    }
  };

  const cardStyle: React.CSSProperties = {
    background: "#FFFDF9",
    border: isActive
      ? `2px solid color-mix(in srgb, ${ACCENT} 50%, transparent)`
      : "1px solid rgba(120,105,80,.12)",
    borderRadius: "calc(var(--radius, 24px) + 8px)",
    padding: "clamp(20px, 4vw, 28px)",
    boxShadow: "0 18px 50px -34px rgba(80,65,40,.4)",
    marginBottom: 20,
  };

  // ── Edit mode ──────────────────────────────────────────────────────────────
  if (editData !== null) {
    const canSave =
      editData.label.trim().length > 0 &&
      Number.isFinite(Number(editData.targetAmount)) &&
      Number(editData.targetAmount) > 0;

    return (
      <div style={cardStyle}>
        <p
          style={{
            fontFamily: "var(--font-quicksand), sans-serif",
            fontWeight: 700,
            fontSize: 16,
            color: "#2B2620",
            margin: "0 0 18px",
          }}
        >
          Edit goal
        </p>

        <div style={{ marginBottom: 16 }}>
          <label style={fieldLabelStyle}>What are you saving toward?</label>
          <input
            value={editData.label}
            onChange={(e) => setEditData({ ...editData, label: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={fieldLabelStyle}>Target amount (₹)</label>
          <input
            type="number"
            min={1}
            value={editData.targetAmount}
            onChange={(e) => setEditData({ ...editData, targetAmount: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={fieldLabelStyle}>Monthly savings (₹, optional)</label>
          <input
            type="number"
            min={1}
            value={editData.monthlyAmount}
            onChange={(e) => setEditData({ ...editData, monthlyAmount: e.target.value })}
            placeholder="leave blank to remove"
            style={inputStyle}
          />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={saveEdit}
            disabled={!canSave}
            style={{
              flex: 1,
              fontFamily: "var(--font-quicksand), sans-serif",
              fontWeight: 700,
              fontSize: 15,
              color: "#fff",
              background: canSave ? ACCENT : "#C3B9A6",
              border: "none",
              cursor: canSave ? "pointer" : "not-allowed",
              padding: "12px 20px",
              borderRadius: 999,
            }}
          >
            Save
          </button>
          <button
            onClick={() => setEditData(null)}
            style={{
              fontFamily: "var(--font-quicksand), sans-serif",
              fontWeight: 700,
              fontSize: 15,
              color: "#7A715F",
              background: "rgba(120,105,80,.08)",
              border: "none",
              cursor: "pointer",
              padding: "12px 20px",
              borderRadius: 999,
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ── View mode ──────────────────────────────────────────────────────────────
  return (
    <div style={cardStyle}>
      {/* Milestone celebration */}
      {newMilestone !== null && (
        <div
          className="nudge-celeb"
          style={{
            background: "color-mix(in srgb, #4F9D69 14%, #fff)",
            border: "1.5px solid color-mix(in srgb, #4F9D69 30%, transparent)",
            borderRadius: 14,
            padding: "10px 16px",
            marginBottom: 16,
            fontWeight: 700,
            fontSize: 15,
            color: "#2E6B40",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {newMilestone === 100
            ? "🎉 you've reached your goal!"
            : `🎯 ${newMilestone}% milestone reached!`}
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h3
            style={{
              fontFamily: "var(--font-quicksand), sans-serif",
              fontWeight: 700,
              fontSize: 19,
              color: "#2B2620",
              margin: "0 0 3px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {goal.label}
          </h3>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#A89E8B" }}>
            {`₹${fmt(goal.targetAmount)} target`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button
            onClick={startEdit}
            style={{
              fontFamily: "var(--font-quicksand), sans-serif",
              fontWeight: 700,
              fontSize: 13,
              color: "#7A715F",
              background: "rgba(120,105,80,.08)",
              border: "none",
              cursor: "pointer",
              padding: "7px 13px",
              borderRadius: 999,
            }}
          >
            edit
          </button>
          <button
            onClick={() => { setConfirmDelete(true); }}
            style={{
              fontFamily: "var(--font-quicksand), sans-serif",
              fontWeight: 700,
              fontSize: 13,
              color: "#B85C4E",
              background: "rgba(184,92,78,.08)",
              border: "none",
              cursor: "pointer",
              padding: "7px 13px",
              borderRadius: 999,
            }}
          >
            delete
          </button>
        </div>
      </div>

      {/* Inline delete confirm */}
      {confirmDelete && (
        <div
          style={{
            background: "rgba(184,92,78,.07)",
            border: "1.5px solid rgba(184,92,78,.2)",
            borderRadius: 14,
            padding: "14px 16px",
            marginBottom: 16,
          }}
        >
          <p
            style={{
              margin: "0 0 12px",
              fontSize: 14.5,
              fontWeight: 600,
              color: "#7A2B22",
              lineHeight: 1.4,
            }}
          >
            Delete &ldquo;{goal.label}&rdquo;? This can&apos;t be undone.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onDelete}
              style={{
                fontFamily: "var(--font-quicksand), sans-serif",
                fontWeight: 700,
                fontSize: 13.5,
                color: "#fff",
                background: "#B85C4E",
                border: "none",
                cursor: "pointer",
                padding: "9px 16px",
                borderRadius: 999,
              }}
            >
              Yes, delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              style={{
                fontFamily: "var(--font-quicksand), sans-serif",
                fontWeight: 700,
                fontSize: 13.5,
                color: "#7A715F",
                background: "rgba(120,105,80,.10)",
                border: "none",
                cursor: "pointer",
                padding: "9px 16px",
                borderRadius: 999,
              }}
            >
              Keep it
            </button>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div style={{ position: "relative", marginBottom: 6 }}>
        <div
          style={{
            height: 10,
            borderRadius: 999,
            background: "#F1ECE1",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${animPct}%`,
              borderRadius: 999,
              background: reached ? ACCENT : `var(--accent, ${ACCENT})`,
              transition: "width .7s cubic-bezier(.4,0,.2,1)",
            }}
          />
        </div>
        {/* Tick marks at 25 / 50 / 75 */}
        {[25, 50, 75].map((m) => (
          <div
            key={m}
            style={{
              position: "absolute",
              left: `${m}%`,
              top: 0,
              height: 10,
              width: 1.5,
              background: "rgba(255,253,249,.55)",
              transform: "translateX(-50%)",
              pointerEvents: "none",
            }}
          />
        ))}
      </div>

      {/* Milestone labels */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        {MILESTONES.map((m) => (
          <span
            key={m}
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: pct >= m ? ACCENT : "#C3B9A6",
            }}
          >
            {m}%
          </span>
        ))}
      </div>

      {/* Status */}
      <p
        style={{
          margin: "0 0 0",
          fontSize: 15.5,
          fontWeight: 600,
          color: "#4A4339",
          lineHeight: 1.4,
        }}
      >
        {reached
          ? `you've made it! ₹${fmt(Math.round(allocatedValue))} toward ₹${fmt(goal.targetAmount)} 🎉`
          : `₹${fmt(Math.round(awayAmount))} away — you're at ${Math.round(pct)}%`}
      </p>

      {/* Projection */}
      {months !== null && months > 0 && !reached && (
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 13.5,
            fontWeight: 600,
            color: "#6A6155",
            lineHeight: 1.5,
          }}
        >
          {`at ₹${fmt(goal.monthlyAmount!)}/month with typical equity returns, you'd reach this around ${formatProjectionDate(months)} — just an estimate, not a promise.`}
        </p>
      )}

      {/* Guidance */}
      {guidance && !reached && (
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 13,
            fontWeight: 600,
            color: "#9A907E",
            lineHeight: 1.5,
            fontStyle: "italic",
          }}
        >
          {guidance}
        </p>
      )}

      {/* Allocation */}
      <div
        style={{
          marginTop: 16,
          paddingTop: 16,
          borderTop: "1px solid rgba(120,105,80,.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 13.5,
              fontWeight: 600,
              color: "#7A715F",
              flexShrink: 0,
            }}
          >
            Portfolio slice:
          </span>
          <input
            type="number"
            min={0}
            max={100}
            value={localAllocation}
            onChange={(e) => setLocalAllocation(e.target.value)}
            onBlur={saveAllocation}
            style={{
              width: 64,
              fontFamily: "var(--font-nunito), sans-serif",
              fontWeight: 700,
              fontSize: 16,
              color: "#36302A",
              background: "#FBF7EF",
              border: "1.5px solid rgba(120,105,80,.16)",
              borderRadius: 10,
              padding: "6px 10px",
              outline: "none",
              textAlign: "center",
            }}
          />
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "#7A715F" }}>
            % of portfolio
          </span>
        </div>
        <p
          style={{
            margin: "5px 0 0",
            fontSize: 12.5,
            fontWeight: 600,
            color: "#A89E8B",
          }}
        >
          {`tracking ₹${fmt(Math.round(allocatedValue))} of your ₹${fmt(Math.round(totalValue))} portfolio`}
        </p>
      </div>

      {/* Active goal toggle */}
      {isActive ? (
        <div
          style={{
            marginTop: 14,
            display: "flex",
            alignItems: "center",
            gap: 7,
            fontSize: 13.5,
            fontWeight: 700,
            color: ACCENT,
          }}
        >
          <span>✓</span> active focus goal
        </div>
      ) : (
        !isOnly && (
          <button
            onClick={onSetActive}
            style={{
              marginTop: 14,
              fontFamily: "var(--font-quicksand), sans-serif",
              fontWeight: 700,
              fontSize: 13.5,
              color: ACCENT,
              background: `color-mix(in srgb, ${ACCENT} 10%, transparent)`,
              border: `1.5px solid color-mix(in srgb, ${ACCENT} 30%, transparent)`,
              cursor: "pointer",
              padding: "9px 18px",
              borderRadius: 999,
            }}
          >
            make this my focus goal
          </button>
        )
      )}
    </div>
  );
}

// ── GoalsScreen ──────────────────────────────────────────────────────────────

export default function GoalsScreen({
  goals,
  totalValue,
  activeGoalId,
  onGoalsChange,
  onSetActiveGoal,
  onAddGoal,
}: {
  goals: Goal[];
  totalValue: number;
  activeGoalId: string | null;
  onGoalsChange: (goals: Goal[]) => void;
  onSetActiveGoal: (id: string) => void;
  onAddGoal: () => void;
}) {
  const effectiveActiveId = activeGoalId ?? goals[0]?.id ?? null;

  const handleUpdate = (updated: Goal) => {
    updateGoal(updated);
    onGoalsChange(goals.map((g) => (g.id === updated.id ? updated : g)));
  };

  const handleDelete = (id: string) => {
    deleteGoal(id);
    onGoalsChange(goals.filter((g) => g.id !== id));
  };

  const handleSetActive = (id: string) => {
    saveActiveGoalId(id);
    onSetActiveGoal(id);
  };

  return (
    <main
      style={{
        maxWidth: 680,
        margin: "0 auto",
        padding: "clamp(32px, 6vw, 64px) 22px 80px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 28,
          flexWrap: "wrap",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-quicksand), sans-serif",
            fontWeight: 700,
            fontSize: "clamp(24px, 5vw, 32px)",
            color: "#2B2620",
            margin: 0,
          }}
        >
          Your goals
        </h2>
        <button
          onClick={onAddGoal}
          style={{
            fontFamily: "var(--font-quicksand), sans-serif",
            fontWeight: 700,
            fontSize: 14.5,
            color: "#fff",
            background: ACCENT,
            border: "none",
            cursor: "pointer",
            padding: "11px 20px",
            borderRadius: 999,
            boxShadow: `0 8px 20px color-mix(in srgb, ${ACCENT} 30%, transparent)`,
            flexShrink: 0,
          }}
        >
          + Add a goal
        </button>
      </div>

      {/* Portfolio reference */}
      {goals.length > 0 && totalValue > 0 && (
        <p
          style={{
            margin: "0 0 24px",
            fontSize: 14,
            fontWeight: 600,
            color: "#A89E8B",
            lineHeight: 1.5,
          }}
        >
          {`Your practice portfolio is ₹${fmt(Math.round(totalValue))} total. Each goal tracks a slice of that based on the allocation you set.`}
        </p>
      )}

      {/* Empty state */}
      {goals.length === 0 && (
        <div
          style={{
            background: "#FFFDF9",
            border: "1px solid rgba(120,105,80,.12)",
            borderRadius: "calc(var(--radius, 24px) + 8px)",
            padding: "clamp(32px, 6vw, 48px)",
            textAlign: "center",
            boxShadow: "0 18px 50px -34px rgba(80,65,40,.4)",
          }}
        >
          <div
            style={{
              fontSize: 40,
              marginBottom: 14,
            }}
          >
            🎯
          </div>
          <h3
            style={{
              fontFamily: "var(--font-quicksand), sans-serif",
              fontWeight: 700,
              fontSize: 20,
              color: "#2B2620",
              margin: "0 0 10px",
            }}
          >
            No goals yet
          </h3>
          <p
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: "#6A6155",
              lineHeight: 1.6,
              margin: "0 0 24px",
            }}
          >
            A goal helps you understand why you&apos;re investing — and whether the companies you
            pick actually make sense for your timeline.
          </p>
          <button
            onClick={onAddGoal}
            style={{
              fontFamily: "var(--font-quicksand), sans-serif",
              fontWeight: 700,
              fontSize: 16,
              color: "#fff",
              background: ACCENT,
              border: "none",
              cursor: "pointer",
              padding: "14px 28px",
              borderRadius: 999,
              boxShadow: `0 12px 26px color-mix(in srgb, ${ACCENT} 36%, transparent)`,
            }}
          >
            Set my first goal
          </button>
        </div>
      )}

      {/* Goal cards */}
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          totalValue={totalValue}
          isActive={goal.id === effectiveActiveId}
          isOnly={goals.length === 1}
          onSetActive={() => handleSetActive(goal.id)}
          onUpdate={handleUpdate}
          onDelete={() => handleDelete(goal.id)}
        />
      ))}
    </main>
  );
}
