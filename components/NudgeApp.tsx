"use client";

import { useState } from "react";
import NudgeHeader from "@/components/NudgeHeader";
import NudgeFooter from "@/components/NudgeFooter";
import HomeScreen from "@/components/screens/HomeScreen";
import ExploreScreen from "@/components/screens/ExploreScreen";
import AboutScreen from "@/components/screens/AboutScreen";
import TradeScreen from "@/components/screens/TradeScreen";
import DecisionScreen from "@/components/screens/DecisionScreen";
import GoalOnboardingScreen from "@/components/screens/GoalOnboardingScreen";
import GoalsScreen from "@/components/screens/GoalsScreen";
import GuidedJourneyScreen from "@/components/screens/GuidedJourneyScreen";
import GoalBanner from "@/components/GoalBanner";
import type { Screen } from "@/lib/nudge-types";
import { companies } from "@/lib/nudge-data";
import {
  buyShares,
  loadWallet,
  persistWallet,
  resetWallet as resetWalletData,
  sellShares,
} from "@/lib/wallet";
import type { Wallet } from "@/lib/wallet";
import {
  loadGoals,
  saveGoals,
  loadActiveGoalId,
  saveActiveGoalId,
  type Goal,
} from "@/lib/goals";
import { hasCompletedFirstTrade, markFirstTradeComplete } from "@/lib/firstTrade";
import type { SymbolSearchResult } from "@/lib/yahooFinance";

const ACCENT = "#4F9D69";
const RADIUS = 24;

export default function NudgeApp() {
  const [screen, setScreen] = useState<Screen>("home");
  const [companyIdx, setCompanyIdx] = useState(0);
  const [searchedCompany, setSearchedCompany] = useState<SymbolSearchResult | null>(null);
  const [amount, setAmount] = useState(500);
  const [openStat, setOpenStat] = useState<string | null>(null);
  const [walkStep, setWalkStep] = useState(0);
  const [wallet, setWallet] = useState<Wallet>(() => loadWallet());
  const [goals, setGoals] = useState<Goal[]>(() => loadGoals());
  const [activeGoalId, setActiveGoalId] = useState<string | null>(() => loadActiveGoalId());
  const [showGoalCapture, setShowGoalCapture] = useState(false);
  const [goalCaptureSource, setGoalCaptureSource] = useState<"onboard" | "goals">("onboard");
  const [showGuidedJourney, setShowGuidedJourney] = useState(false);
  const [tradePreselect, setTradePreselect] = useState<{ symbol: string; name: string } | null>(
    null
  );

  // Derived: active goal is the explicitly set one, falling back to first goal
  const goal = goals.find((g) => g.id === activeGoalId) ?? goals[0] ?? null;

  const goTo = (next: Screen) => {
    setTradePreselect(null);
    if (next === "explore" && goals.length === 0) {
      setGoalCaptureSource("onboard");
      setShowGoalCapture(true);
      return;
    }
    setScreen(next);
    window.scrollTo(0, 0);
  };

  const handleGoalComplete = (g: Goal) => {
    // addGoal already wrote to localStorage inside GoalOnboardingScreen
    const newGoals = [...goals, g];
    setGoals(newGoals);

    // Auto-set active goal if none selected yet or this is the first goal
    if (!activeGoalId || newGoals.length === 1) {
      setActiveGoalId(g.id);
      saveActiveGoalId(g.id);
    }

    setShowGoalCapture(false);

    if (goalCaptureSource === "goals") {
      setScreen("goals");
      window.scrollTo(0, 0);
      return;
    }

    // Onboarding path
    if (!hasCompletedFirstTrade()) {
      setShowGuidedJourney(true);
    } else {
      setScreen("explore");
    }
    window.scrollTo(0, 0);
  };

  const handleCancelGoalCapture = () => {
    setShowGoalCapture(false);
    setScreen("goals");
    window.scrollTo(0, 0);
  };

  const handleAddGoalFromGoals = () => {
    setGoalCaptureSource("goals");
    setShowGoalCapture(true);
  };

  const handleGoalsChanged = (updated: Goal[]) => {
    saveGoals(updated);
    setGoals(updated);
    // If the active goal was deleted, fall back to first remaining goal
    if (activeGoalId && !updated.find((g) => g.id === activeGoalId)) {
      const next = updated[0]?.id ?? null;
      setActiveGoalId(next);
      saveActiveGoalId(next);
    }
  };

  const handleSetActiveGoal = (id: string) => {
    setActiveGoalId(id);
    // saveActiveGoalId already called from GoalsScreen before this callback
  };

  const handleSkipGuided = () => {
    setShowGuidedJourney(false);
    setScreen("explore");
    window.scrollTo(0, 0);
  };

  const handleCompleteGuided = () => {
    setShowGuidedJourney(false);
    setScreen("explore");
    window.scrollTo(0, 0);
  };

  // Navigate to goals screen when user clicks "manage goals" in GoalBanner
  const handleChangeGoal = () => {
    setScreen("goals");
    window.scrollTo(0, 0);
  };

  const selectCompany = (i: number) => {
    setCompanyIdx(i);
    setSearchedCompany(null);
    setWalkStep(0);
    setOpenStat(null);
  };

  const resetSelection = () => {
    setWalkStep(0);
    setOpenStat(null);
  };

  const toggleStat = (key: string) => {
    setOpenStat((cur) => (cur === key ? null : key));
  };

  const confirmBuy = (price: number) => {
    const company = companies[companyIdx];
    const quantity = Math.floor(amount / price);
    const next = buyShares(wallet, company, quantity, price);
    if (next === wallet) return;
    persistWallet(next);
    setWallet(next);
    markFirstTradeComplete();
    setWalkStep(99);
  };

  const handleBuy = (
    symbol: string,
    name: string,
    quantity: number,
    price: number
  ): boolean => {
    const next = buyShares(wallet, { symbol, name }, quantity, price);
    if (next === wallet) return false;
    persistWallet(next);
    setWallet(next);
    markFirstTradeComplete();
    return true;
  };

  const handleSell = (symbol: string, quantity: number, price: number): boolean => {
    const next = sellShares(wallet, symbol, quantity, price);
    if (next === wallet) return false;
    persistWallet(next);
    setWallet(next);
    return true;
  };

  const resetWallet = () => {
    if (
      !window.confirm(
        "Reset your practice wallet back to ₹10,000? This clears your practice holdings."
      )
    )
      return;
    setWallet(resetWalletData());
  };

  const holdingsList = Object.values(wallet.holdings);
  const investedValue = holdingsList.reduce((a, h) => a + h.quantity * h.avgPrice, 0);
  const totalValue = wallet.cash + investedValue;

  return (
    <div
      style={
        {
          "--accent": ACCENT,
          "--radius": `${RADIUS}px`,
          fontFamily: "var(--font-nunito), sans-serif",
          minHeight: "100vh",
          background:
            "radial-gradient(120% 90% at 80% -10%, #FBF6EC 0%, #F4EEE3 55%, #EFE7D8 100%)",
          color: "#36302A",
          WebkitFontSmoothing: "antialiased",
        } as React.CSSProperties
      }
    >
      {showGoalCapture ? (
        <GoalOnboardingScreen
          onComplete={handleGoalComplete}
          onCancel={goalCaptureSource === "goals" ? handleCancelGoalCapture : undefined}
          isFirst={goals.length === 0}
        />
      ) : showGuidedJourney && goal ? (
        <GuidedJourneyScreen
          goal={goal}
          company={companies[companyIdx]}
          onSkip={handleSkipGuided}
          onComplete={handleCompleteGuided}
          onBuy={handleBuy}
        />
      ) : (
        <>
          <NudgeHeader screen={screen} onNavigate={goTo} />

          {goal && (screen === "explore" || screen === "trade" || screen === "decide") && (
            <GoalBanner goal={goal} onChangeGoal={handleChangeGoal} />
          )}

          {screen === "home" && <HomeScreen onExplore={() => goTo("explore")} />}

          {screen === "goals" && (
            <GoalsScreen
              goals={goals}
              totalValue={totalValue}
              activeGoalId={activeGoalId}
              onGoalsChange={handleGoalsChanged}
              onSetActiveGoal={handleSetActiveGoal}
              onAddGoal={handleAddGoalFromGoals}
            />
          )}

          {screen === "explore" && (
            <ExploreScreen
              companyIdx={companyIdx}
              searchedCompany={searchedCompany}
              onSelectCompany={selectCompany}
              onSearchedCompanyChange={setSearchedCompany}
              onResetSelection={resetSelection}
              goal={goal}
              amount={amount}
              onAmountChange={setAmount}
              openStat={openStat}
              onToggleStat={toggleStat}
              walkStep={walkStep}
              onOpenWalk={() => setWalkStep(1)}
              onWalkNext={() => setWalkStep((s) => Math.min(4, s + 1))}
              onWalkPrev={() => setWalkStep((s) => Math.max(1, s - 1))}
              onCloseWalk={() => setWalkStep(0)}
              onConfirmBuy={confirmBuy}
              onGoTrade={() => goTo("trade")}
              onDecide={() => {
                setScreen("decide");
                window.scrollTo(0, 0);
              }}
            />
          )}

          {screen === "about" && (
            <AboutScreen
              goal={goal}
              totalValue={totalValue}
              onExplore={() => goTo("explore")}
              onChangeGoal={handleChangeGoal}
            />
          )}

          {screen === "decide" && (
            <DecisionScreen
              companyIdx={companyIdx}
              searchedCompany={searchedCompany}
              goal={goal}
              onBack={() => {
                setScreen("explore");
                window.scrollTo(0, 0);
              }}
              onGoTrade={(symbol, name) => {
                setTradePreselect({ symbol, name });
                setScreen("trade");
                window.scrollTo(0, 0);
              }}
            />
          )}

          {screen === "trade" && (
            <TradeScreen
              wallet={wallet}
              goal={goal}
              preselect={tradePreselect}
              onBuy={handleBuy}
              onSell={handleSell}
              onReset={resetWallet}
              onExplore={() => goTo("explore")}
            />
          )}

          <NudgeFooter />
        </>
      )}
    </div>
  );
}
