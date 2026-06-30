"use client";

import { useState } from "react";
import NudgeHeader from "@/components/NudgeHeader";
import NudgeFooter from "@/components/NudgeFooter";
import HomeScreen from "@/components/screens/HomeScreen";
import ExploreScreen from "@/components/screens/ExploreScreen";
import AboutScreen from "@/components/screens/AboutScreen";
import TradeScreen from "@/components/screens/TradeScreen";
import type { Screen } from "@/lib/nudge-types";
import { companies } from "@/lib/nudge-data";
import { buyShares, loadWallet, persistWallet, resetWallet as resetWalletData } from "@/lib/wallet";
import type { Wallet } from "@/lib/wallet";

const ACCENT = "#4F9D69";
const RADIUS = 24;

export default function NudgeApp() {
  const [screen, setScreen] = useState<Screen>("home");
  const [companyIdx, setCompanyIdx] = useState(0);
  const [amount, setAmount] = useState(500);
  const [openStat, setOpenStat] = useState<string | null>(null);
  const [walkStep, setWalkStep] = useState(0);
  const [wallet, setWallet] = useState<Wallet>(() => loadWallet());

  const goTo = (next: Screen) => {
    setScreen(next);
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
    const next = buyShares(wallet, company, amount, price);
    if (next === wallet) return; // order couldn't be filled — no-op
    persistWallet(next);
    setWallet(next);
    setWalkStep(99);
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
      <NudgeHeader screen={screen} onNavigate={goTo} />

      {screen === "home" && <HomeScreen onExplore={() => goTo("explore")} />}

      {screen === "explore" && (
        <ExploreScreen
          companyIdx={companyIdx}
          onSelectCompany={selectCompany}
          onResetSelection={resetSelection}
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

      {screen === "about" && <AboutScreen onExplore={() => goTo("explore")} />}

      {screen === "trade" && (
        <TradeScreen
          wallet={wallet}
          onReset={resetWallet}
          onExplore={() => goTo("explore")}
        />
      )}

      <NudgeFooter />
    </div>
  );
}
