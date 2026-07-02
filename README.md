# Nudge

**A calm, knowledgeable friend who happens to know the stock market really well.**

Nudge is a beginner-first investment companion. It doesn't execute real trades. It doesn't bury you in charts. It just — talks to you, walks you through a practice buy, and lets you build confidence before you put a single rupee on the line.

> **Live demo:** _link coming after deploy_

---

## The problem

Opening a trading app for the first time is overwhelming. Limit orders, LTP, P&L, 52-week highs — the jargon hits immediately, and most people quietly close the tab and never go back.

Nudge is for those people. The goal isn't to replace a broker. It's to make the first step feel small enough to actually take.

---

## What it does

**Goal-first onboarding** — before you see a single stock, Nudge asks what you're actually saving toward. A Goa trip. A new phone. An emergency fund. That goal follows you through the app and frames every number in terms of something real.

**Guided first-investment path** — after setting a goal, first-time users get a gentle three-step walkthrough: understand one company in plain language → see what ₹500 would do → make one practice buy. Skippable at any point, never pushy.

**Company Decision page** — before committing, drill into a company: pros/cons, a what-if scenario table (±5%/15%/30%), a 52-week price-range bar, and a 12-month price sparkline. Goal-fit verdict tells you whether the company matches your savings horizon.

**Live stock data + search** — prices, 52-week highs/lows, and change percentages come from Yahoo Finance in real time (no API key needed). You can search any listed company, not just the nine starter picks.

**Paper trading wallet** — ₹10,000 of fake cash, real NSE prices. Buy and sell shares, watch your P&L move, see what a limit order feels like. Nothing leaves your pocket, ever.

**"What you've learned" tracker** — every time you hover or tap a term explainer (P/E ratio, market cap, LTP, limit order…), it gets quietly added to a personal list. Check the About page to see what you've picked up. No account needed — it lives in your browser.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, TypeScript, inline styles + CSS custom properties |
| Live data | Yahoo Finance (`v8/finance/chart`) — no API key |
| Persistence | `localStorage` only — wallet, goal, learned concepts, first-trade flag |
| Auth / backend | None |
| Deployment | Vercel (recommended) |

Everything that matters to the user lives in the browser. There's no database, no login, and no server state beyond the two Next.js API routes that proxy Yahoo Finance (to avoid CORS and add a User-Agent header).

---

## Honest limitations

**Fundamentals are mostly static.** The Yahoo Finance endpoint Nudge uses (`v8/finance/chart`) reliably returns price, change %, and 52-week high/low. PE ratio and market cap require a different endpoint (`quoteSummary`) that needs a rotating crumb/cookie — which doesn't work reliably from a server IP. So those numbers fall back to the static reference values baked into the codebase. They're directionally correct but not live.

**Company narratives are hand-written, not AI-generated.** The plain-language breakdowns ("what does this company actually do?", "what would ₹500 buy you?", pros, cons) exist for nine preset companies: Zomato, Infosys, Tata Motors, Reliance, HDFC Bank, TCS, ITC, Wipro, and Asian Paints. Any company you find through live search gets generic stat cards but no narrative.

**Paper trading is simplified.** Limit orders fill immediately at your target price rather than waiting for the market to reach it. This is intentional — the point is to understand the concept, not simulate real order-book behaviour.

**No portfolio history.** The wallet shows current holdings and a running P&L, but there's no trade history or time-series chart. That's a deliberate scope decision, not an oversight.

---

## Run locally

```bash
git clone <repo-url>
cd nudge
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No `.env` file needed — the Yahoo Finance proxy routes work without any keys.

If you want to run the production build locally:

```bash
npm run build
npm start
```

---

## Project structure (short version)

```
app/
  api/stock/     → proxies Yahoo Finance chart endpoint
  api/search/    → proxies Yahoo Finance symbol search
  api/history/   → proxies Yahoo Finance 12-month monthly closes (for sparkline)
  globals.css    → keyframe animations, tooltip styles, responsive nav
components/
  screens/       → HomeScreen, ExploreScreen, DecisionScreen, TradeScreen,
                   AboutScreen, GoalOnboardingScreen, GuidedJourneyScreen
  NudgeApp.tsx   → root orchestrator, all screen state lives here
lib/
  nudge-data.ts      → 9 preset company definitions (narratives, stats, pros, cons)
  goalFit.ts         → matchGoalToCompany — rule-based goal-fit verdict
  wallet.ts          → paper-trade wallet (localStorage, symbol-keyed)
  goal.ts            → savings goal (localStorage)
  firstTrade.ts      → first-trade completion flag (localStorage)
  learned.ts         → concept-learned tracker (localStorage)
  useLiveStock.ts    → per-symbol live price hook with in-flight deduplication
  useSymbolSearch.ts → debounced search hook
  yahooFinance.ts    → fetch helpers + NSE symbol aliases + 12-month history
```

---

## A note on the data

NSE tickers change. Two known renames that are handled in the codebase:

- **Zomato** → `ETERNAL.NS` (renamed Eternal Limited, 2024)
- **Tata Motors** → `TMPV.NS` (passenger vehicles demerged from commercial, 2024)

If a preset company's live price stops loading, the card falls back to the static reference price baked into `lib/nudge-data.ts` and shows a small "live data unavailable" note.

---

*Not financial advice. Just your first nudge.*
