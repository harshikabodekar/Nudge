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
import GuidedJourneyScreen from "@/components/screens/GuidedJourneyScreen";
import GoalBanner from "@/components/GoalBanner";
import type { Screen } from "@/lib/nudge-types";
import { companies } from "@/lib/nudge-data";
import { buyShares, loadWallet, persistWallet, resetWallet as resetWalletData, sellShares } from "@/lib/wallet";
import type { Wallet } from "@/lib/wallet";
import { clearGoal, loadGoal, type Goal } from "@/lib/goal";
import { hasCompletedFirstTrade } from "@/lib/firstTrade";
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
  const [goal, setGoal] = useState<Goal | null>(() => loadGoal());
  const [showGoalCapture, setShowGoalCapture] = useState(false);
  const [showGuidedJourney, setShowGuidedJourney] = useState(false);
  const [tradePreselect, setTradePreselect] = useState<{ symbol: string; name: string } | null>(null);

  const goTo = (next: Screen) => {
    // Clear any pending trade preselect when navigating via normal nav.
    // DecisionScreen's onGoTrade bypasses goTo and sets it directly.
    setTradePreselect(null);
    if (next === "explore" && !goal) {
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
    setWalkStep(99);
  };

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
        <GoalOnboardingScreen onComplete={handleGoalComplete} />
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
              onDecide={() => { setScreen("decide"); window.scrollTo(0, 0); }}
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
              onBack={() => { setScreen("explore"); window.scrollTo(0, 0); }}
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
