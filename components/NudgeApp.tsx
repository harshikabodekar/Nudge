"use client";

import { useState } from "react";
import NudgeHeader from "@/components/NudgeHeader";
import NudgeFooter from "@/components/NudgeFooter";
import HomeScreen from "@/components/screens/HomeScreen";
import ExploreScreen from "@/components/screens/ExploreScreen";
import AboutScreen from "@/components/screens/AboutScreen";
import TradeScreen from "@/components/screens/TradeScreen";
import GoalOnboardingScreen from "@/components/screens/GoalOnboardingScreen";
import GuidedJourneyScreen from "@/components/screens/GuidedJourneyScreen";
import GoalBanner from "@/components/GoalBanner";
import type { Screen } from "@/lib/nudge-types";
import { companies } from "@/lib/nudge-data";
import { buyShares, loadWallet, persistWallet, resetWallet as resetWalletData, sellShares } from "@/lib/wallet";
import type { Wallet } from "@/lib/wallet";
import { clearGoal, loadGoal, type Goal } from "@/lib/goal";
import { hasCompletedFirstTrade } from "@/lib/firstTrade";

const ACCENT = "#4F9D69";
const RADIUS = 24;

export default function NudgeApp() {
  const [screen, setScreen] = useState<Screen>("home");
  const [companyIdx, setCompanyIdx] = useState(0);
  const [amount, setAmount] = useState(500);
  const [openStat, setOpenStat] = useState<string | null>(null);
  const [walkStep, setWalkStep] = useState(0);
  const [wallet, setWallet] = useState<Wallet>(() => loadWallet());
  // Lazy-init from localStorage is safe here (same as wallet) because goal
  // no longer gates the first-painted screen — the landing page always
  // renders regardless of its value, so server/client can't disagree on
  // the initial DOM. It only matters once the user tries to go to Explore.
  const [goal, setGoal] = useState<Goal | null>(() => loadGoal());
  const [showGoalCapture, setShowGoalCapture] = useState(false);
  const [showGuidedJourney, setShowGuidedJourney] = useState(false);

  const goTo = (next: Screen) => {
    if (next === "explore" && !goal) {
      // Ask what they're saving toward before showing any stock — triggered
      // by the attempt to reach Explore, not as a gate in front of the app.
      setShowGoalCapture(true);
      return;
    }
    setScreen(next);
    window.scrollTo(0, 0);
  };

  const handleGoalComplete = (g: Goal) => {
    setGoal(g);
    setShowGoalCapture(false);
    if (!hasCompletedFirstTrade()) {
      setShowGuidedJourney(true);
    } else {
      setScreen("explore");
    }
    window.scrollTo(0, 0);
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

  const selectCompany = (i: number) => {
    setCompanyIdx(i);
    setWalkStep(0);
    setOpenStat(null);
  };

  // Same reset as selectCompany, without touching companyIdx — used when the
  // user picks a searched (non-preset) company, which Explore tracks locally.
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
    if (next === wallet) return; // order couldn't be filled — no-op
    persistWallet(next);
    setWallet(next);
    setWalkStep(99);
  };

  // Used by the Trade screen's order panel — any company (preset or
  // searched), quantity entered directly rather than derived from a ₹ amount.
  const handleBuy = (symbol: string, name: string, quantity: number, price: number): boolean => {
    const next = buyShares(wallet, { symbol, name }, quantity, price);
    if (next === wallet) return false;
    persistWallet(next);
    setWallet(next);
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

  const handleChangeGoal = () => {
    if (!window.confirm("Change your goal? You can set a new one right away.")) return;
    clearGoal();
    setGoal(null);
  };

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
        <GoalOnboardingScreen onComplete={handleGoalComplete} />
      ) : showGuidedJourney && goal ? (
        <GuidedJourneyScreen
          goal={goal}
          onSkip={handleSkipGuided}
          onComplete={handleCompleteGuided}
          onBuy={handleBuy}
        />
      ) : (
        <>
          <NudgeHeader screen={screen} onNavigate={goTo} />

          {goal && (screen === "explore" || screen === "trade") && (
            <GoalBanner goal={goal} onChangeGoal={handleChangeGoal} />
          )}

          {screen === "home" && <HomeScreen onExplore={() => goTo("explore")} />}

          {screen === "explore" && (
            <ExploreScreen
              companyIdx={companyIdx}
              onSelectCompany={selectCompany}
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
            />
          )}

          {screen === "about" && (
            <AboutScreen onExplore={() => goTo("explore")} onChangeGoal={handleChangeGoal} />
          )}

          {screen === "trade" && (
            <TradeScreen
              wallet={wallet}
              goal={goal}
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
