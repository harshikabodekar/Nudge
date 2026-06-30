"use client";

import { useState } from "react";
import NudgeHeader from "@/components/NudgeHeader";
import NudgeFooter from "@/components/NudgeFooter";
import HomeScreen from "@/components/screens/HomeScreen";
import ExploreScreen from "@/components/screens/ExploreScreen";
import AboutScreen from "@/components/screens/AboutScreen";
import TradeScreen from "@/components/screens/TradeScreen";
import { companies } from "@/lib/nudge-data";
import type { Screen, Wallet } from "@/lib/nudge-types";

const ACCENT = "#4F9D69";
const RADIUS = 24;
const WALLET_STORAGE_KEY = "nudge_wallet_v1";
const EMPTY_WALLET: Wallet = { cash: 10000, holdings: {} };

export default function NudgeApp() {
  const [screen, setScreen] = useState<Screen>("home");
  const [companyIdx, setCompanyIdx] = useState(0);
  const [amount, setAmount] = useState(500);
  const [openStat, setOpenStat] = useState<string | null>(null);
  const [walkStep, setWalkStep] = useState(0);
  const [wallet, setWallet] = useState<Wallet>(() => {
    if (typeof window === "undefined") return EMPTY_WALLET;
    try {
      const raw = localStorage.getItem(WALLET_STORAGE_KEY);
      if (raw) {
        const w = JSON.parse(raw);
        if (w && typeof w.cash === "number" && w.holdings) return w;
      }
    } catch {
      // ignore corrupt local storage
    }
    return EMPTY_WALLET;
  });

  const persist = (w: Wallet) => {
    try {
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(w));
    } catch {
      // ignore write failures (e.g. private browsing)
    }
  };

  const goTo = (next: Screen) => {
    setScreen(next);
    window.scrollTo(0, 0);
  };

  const selectCompany = (i: number) => {
    setCompanyIdx(i);
    setWalkStep(0);
    setOpenStat(null);
  };

  const toggleStat = (key: string) => {
    setOpenStat((cur) => (cur === key ? null : key));
  };

  const confirmBuy = () => {
    const sel = companies[companyIdx];
    const price = sel.price;
    const shares = Math.floor(amount / price);
    if (shares < 1) return;
    const cost = shares * price;
    if (wallet.cash < cost) return;
    const cur = wallet.holdings[companyIdx] || { shares: 0, cost: 0 };
    const holdings = {
      ...wallet.holdings,
      [companyIdx]: { shares: cur.shares + shares, cost: cur.cost + cost },
    };
    const next: Wallet = {
      cash: Math.round((wallet.cash - cost) * 100) / 100,
      holdings,
    };
    persist(next);
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
    persist(EMPTY_WALLET);
    setWallet(EMPTY_WALLET);
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
