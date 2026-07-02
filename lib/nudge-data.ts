export type Vibe = "green" | "yellow" | "red";

export interface Stat {
  key: string;
  label: string;
  value: string;
  explain: string;
}

export interface Row {
  icon: string;
  label: string;
  text: string;
}

export interface Company {
  name: string;
  /**
   * NSE symbol (Yahoo Finance ".NS" suffix) used to fetch live data.
   * Zomato Limited legally renamed to Eternal Limited (ETERNAL.NS) in 2024;
   * Tata Motors demerged in 2024 into separate commercial- and
   * passenger-vehicle entities — TMPV.NS (Tata Motors Passenger Vehicles)
   * is the successor matching this card's JLR/passenger-car narrative.
   * The literal "ZOMATO.NS" / "TATAMOTORS.NS" tickers are delisted.
   */
  symbol: string;
  logo: string;
  logoBg: string;
  logoColor: string;
  sector: string;
  vibe: Vibe;
  vibeLabel: string;
  /** Static reference price, used whenever live data is unavailable. */
  price: number;
  stats: Stat[];
  rows: Row[];
  pros: string[];
  cons: string[];
}

export const companies: Company[] = [
  {
    name: "Zomato",
    symbol: "ETERNAL.NS",
    logo: "z",
    logoBg: "#FDEAE2",
    logoColor: "#D9603C",
    sector: "Food delivery · Quick commerce",
    vibe: "yellow",
    vibeLabel: "Mixed signals",
    price: 262,
    stats: [
      {
        key: "pe",
        label: "P / E ratio",
        value: "124",
        explain:
          "how pricey the stock is vs what it actually earns. lower = cheaper. yours is 124 — quite high, because investors are betting big on future growth.",
      },
      {
        key: "mcap",
        label: "Market cap",
        value: "₹2.3L Cr",
        explain:
          "the total value of the whole company. yours is large — a big, well-known name, though younger than the old giants.",
      },
      {
        key: "high",
        label: "52-wk high",
        value: "₹298",
        explain:
          "the highest it traded in the last year. yours is ₹298 — today's ₹262 sits a little below that peak.",
      },
      {
        key: "low",
        label: "52-wk low",
        value: "₹146",
        explain:
          "the lowest in the last year. yours is ₹146 — today's price is well above it, so it's had a strong run up.",
      },
    ],
    rows: [
      {
        icon: "🍱",
        label: "What they do",
        text: "It's the food-delivery app — you order from restaurants, they bring it over. They also run Blinkit, that 10-minute grocery service.",
      },
      {
        icon: "📈",
        label: "How it's doing lately",
        text: "Pretty good — more people ordering each year, and they recently started actually making a profit instead of just burning cash.",
      },
      {
        icon: "🌱",
        label: "Good for a first-timer?",
        text: "Maybe wait a bit. It's grown fast, but the price is a little pricey for what it earns right now.",
      },
      {
        icon: "₹",
        label: "What ₹500 buys you",
        text: "About 2 shares at today's price (~₹260 each). A small, low-stakes way to dip a toe in.",
      },
      {
        icon: "👀",
        label: "One thing to watch",
        text: "Lots of competition in quick-grocery. Keep an eye on whether Blinkit keeps growing.",
      },
    ],
    pros: [
      "You already use it — easiest company to understand as a beginner",
      "Blinkit (quick commerce) has been growing fast and is turning profitable",
      "Turned cash-flow positive recently after years of burning investor money",
    ],
    cons: [
      "PE of 124 is very high — a lot of future growth is already priced in",
      "Intense competition from Swiggy and new entrants in quick delivery",
    ],
  },
  {
    name: "Infosys",
    symbol: "INFY.NS",
    logo: "i",
    logoBg: "#E3EEFB",
    logoColor: "#2F6BC4",
    sector: "IT services · Software",
    vibe: "green",
    vibeLabel: "Looks steady",
    price: 1550,
    stats: [
      {
        key: "pe",
        label: "P / E ratio",
        value: "24",
        explain:
          "how pricey the stock is vs what it earns. lower = cheaper. yours is 24 — mid-range. not a bubble, not a bargain.",
      },
      {
        key: "mcap",
        label: "Market cap",
        value: "₹6.4L Cr",
        explain:
          "the total value of the whole company. yours is huge — one of India's most established names, which usually means steadier.",
      },
      {
        key: "high",
        label: "52-wk high",
        value: "₹1,733",
        explain:
          "the highest it traded in the last year. yours is ₹1,733 — today's ₹1,550 sits a bit below the peak.",
      },
      {
        key: "low",
        label: "52-wk low",
        value: "₹1,351",
        explain:
          "the lowest in the last year. yours is ₹1,351 — today's price is comfortably above it.",
      },
    ],
    rows: [
      {
        icon: "💻",
        label: "What they do",
        text: "A giant IT company — businesses around the world pay them to build and run their software and tech systems.",
      },
      {
        icon: "📈",
        label: "How it's doing lately",
        text: "Steady as always. Big global clients, reliable income. Not flashy, but dependable.",
      },
      {
        icon: "🌱",
        label: "Good for a first-timer?",
        text: "Looks good — one of the more stable, predictable names to learn the ropes with.",
      },
      {
        icon: "₹",
        label: "What ₹500 buys you",
        text: "Infosys trades around ₹1,550, so ₹500 won't get a full share yet — but it's a great one to watch and learn from.",
      },
      {
        icon: "👀",
        label: "One thing to watch",
        text: "Its growth leans on big companies' tech budgets. If they cut spending, Infosys feels it.",
      },
    ],
    pros: [
      "25+ years of consistent profits — one of India's most reliable blue-chips",
      "PE of ~24 is reasonable for the quality and track record you're getting",
      "Pays steady dividends, so you earn even while you hold",
    ],
    cons: [
      "Growth is slow and steady — no moonshot moments expected",
      "US tech budget cuts hit Infosys first since that's where the big contracts are",
    ],
  },
  {
    name: "Tata Motors",
    symbol: "TMPV.NS",
    logo: "t",
    logoBg: "#E6EFE7",
    logoColor: "#3E7D4F",
    sector: "Automobiles",
    vibe: "green",
    vibeLabel: "Looks steady",
    price: 950,
    stats: [
      {
        key: "pe",
        label: "P / E ratio",
        value: "9",
        explain:
          "how pricey the stock is vs what it earns. lower = cheaper. yours is 9 — low, so you're paying little for each rupee it earns. often seen as decent value.",
      },
      {
        key: "mcap",
        label: "Market cap",
        value: "₹3.5L Cr",
        explain:
          "the total value of the whole company. yours is large and well-established — a household name in India.",
      },
      {
        key: "high",
        label: "52-wk high",
        value: "₹1,179",
        explain:
          "the highest it traded in the last year. yours is ₹1,179 — today's ₹950 sits below the year's high.",
      },
      {
        key: "low",
        label: "52-wk low",
        value: "₹600",
        explain:
          "the lowest in the last year. yours is ₹600 — today's price is well above it, a sign of a steady climb.",
      },
    ],
    rows: [
      {
        icon: "🚗",
        label: "What they do",
        text: "Makes cars and trucks — from everyday Indian cars to the luxury Jaguar and Land Rover brands abroad.",
      },
      {
        icon: "📈",
        label: "How it's doing lately",
        text: "Had a strong run. Their JLR luxury arm and new electric cars have been selling well.",
      },
      {
        icon: "🌱",
        label: "Good for a first-timer?",
        text: "Looks good — a well-known name that's been on a fairly steady climb.",
      },
      {
        icon: "₹",
        label: "What ₹500 buys you",
        text: "₹500 goes further here than you'd expect — enough to actually own a piece, no saving up required.",
      },
      {
        icon: "👀",
        label: "One thing to watch",
        text: "Car sales rise and fall with the economy. A slow year can dent profits.",
      },
    ],
    pros: [
      "PE of ~9 is low — you're not overpaying for each rupee it earns",
      "JLR (Jaguar Land Rover) has had strong luxury sales internationally",
      "Growing EV lineup with Nexon EV and Punch EV gaining market share",
    ],
    cons: [
      "Car sales are cyclical — a slow economy shrinks demand fast",
      "JLR's success depends on global luxury spending, which can be volatile",
    ],
  },
  {
    name: "Reliance",
    symbol: "RELIANCE.NS",
    logo: "r",
    logoBg: "#E8EAF6",
    logoColor: "#3949AB",
    sector: "Oil · Retail · Telecom",
    vibe: "green",
    vibeLabel: "Looks steady",
    price: 1315,
    stats: [
      {
        key: "pe",
        label: "P / E ratio",
        value: "27",
        explain:
          "how pricey the stock is vs what it earns. yours is 27 — fair for a business this big and diversified. not cheap, not expensive.",
      },
      {
        key: "mcap",
        label: "Market cap",
        value: "₹17.8L Cr",
        explain:
          "the total value of the whole company. Reliance is one of the biggest companies in India — ₹17.8L Cr puts it in a class of its own.",
      },
      {
        key: "high",
        label: "52-wk high",
        value: "₹1,608",
        explain:
          "the highest it traded in the last year. yours is ₹1,608 — today's price sits somewhat below that peak.",
      },
      {
        key: "low",
        label: "52-wk low",
        value: "₹1,115",
        explain:
          "the lowest in the last year. yours is ₹1,115 — today's price is comfortably above the low.",
      },
    ],
    rows: [
      {
        icon: "🏗️",
        label: "What they do",
        text: "India's biggest conglomerate — runs Jio (your mobile network), JioMart, Reliance Fresh supermarkets, and one of the world's largest oil refineries. Mukesh Ambani's company.",
      },
      {
        icon: "📈",
        label: "How it's doing lately",
        text: "Steady. Retail and Jio are growing well. The older oil business adds stability. Not explosive, but consistent.",
      },
      {
        icon: "🌱",
        label: "Good for a first-timer?",
        text: "Yes. It's so diversified that if one business slows, another usually picks up the slack. Lower drama than a single-sector company.",
      },
      {
        icon: "₹",
        label: "What ₹500 buys you",
        text: "One share is ~₹1,315, so ₹500 won't get you there yet. Nudge the slider to ₹1,400 and you're in.",
      },
      {
        icon: "👀",
        label: "One thing to watch",
        text: "A lot of the Jio and retail excitement is already priced in. It's a great business — but buying at the right price still matters.",
      },
    ],
    pros: [
      "India's most diversified business — oil, retail, and telecom in one stock",
      "Jio and JioMart have been growing fast with massive user bases",
      "Long track record and Mukesh Ambani's operational track record",
    ],
    cons: [
      "At ₹1,300+ a share, you need more than ₹500 to buy in",
      "Very complex business — hard to fully understand all the moving parts",
    ],
  },
  {
    name: "HDFC Bank",
    symbol: "HDFCBANK.NS",
    logo: "h",
    logoBg: "#E3F2FD",
    logoColor: "#1565C0",
    sector: "Banking · Financial services",
    vibe: "green",
    vibeLabel: "Looks steady",
    price: 1850,
    stats: [
      {
        key: "pe",
        label: "P / E ratio",
        value: "19",
        explain:
          "how pricey the stock is vs what it earns. yours is 19 — reasonable for a bank of this quality and track record. not cheap, but not stretched either.",
      },
      {
        key: "mcap",
        label: "Market cap",
        value: "₹14.1L Cr",
        explain:
          "the total value of the whole company. HDFC Bank is India's largest private sector bank — ₹14.1L Cr is very large.",
      },
      {
        key: "high",
        label: "52-wk high",
        value: "₹1,950",
        explain:
          "the highest it traded in the last year. yours is ₹1,950 — today's price is just slightly below that.",
      },
      {
        key: "low",
        label: "52-wk low",
        value: "₹1,430",
        explain:
          "the lowest in the last year. yours is ₹1,430 — today's price is well above it.",
      },
    ],
    rows: [
      {
        icon: "🏦",
        label: "What they do",
        text: "India's largest private sector bank. Savings accounts, home loans, credit cards, business lending — the whole banking stack.",
      },
      {
        icon: "📈",
        label: "How it's doing lately",
        text: "Consistently good. HDFC Bank has barely missed a quarter in 25 years. Post-merger with HDFC Ltd it's adjusting, but fundamentals are rock solid.",
      },
      {
        icon: "🌱",
        label: "Good for a first-timer?",
        text: "Yes. Banking is one of the most predictable sectors in India. HDFC specifically has one of the best long-term track records in the market.",
      },
      {
        icon: "₹",
        label: "What ₹500 buys you",
        text: "One share is ~₹1,850, so ₹500 won't get you there. Set the slider to ₹2,000 to buy one share.",
      },
      {
        icon: "👀",
        label: "One thing to watch",
        text: "Post-merger loan growth has been slower than expected. Watch for it to accelerate.",
      },
    ],
    pros: [
      "25 years of consistent profit growth — one of the most reliable stocks in India",
      "PE of ~19 is reasonable for the quality, history, and brand you're buying",
      "Banking is defensive — people need loans and accounts even in slowdowns",
    ],
    cons: [
      "At ₹1,850+ per share, you need more than ₹500 to start",
      "Post-merger integration has slowed growth momentum compared to pre-merger years",
    ],
  },
  {
    name: "TCS",
    symbol: "TCS.NS",
    logo: "t",
    logoBg: "#E8F5E9",
    logoColor: "#2E7D32",
    sector: "IT services · Consulting",
    vibe: "green",
    vibeLabel: "Looks steady",
    price: 3750,
    stats: [
      {
        key: "pe",
        label: "P / E ratio",
        value: "29",
        explain:
          "how pricey the stock is vs what it earns. yours is 29 — a bit of a premium, but justified by TCS's reliability, size, and dividend track record.",
      },
      {
        key: "mcap",
        label: "Market cap",
        value: "₹13.6L Cr",
        explain:
          "the total value of the whole company. TCS is India's largest IT company — ₹13.6L Cr puts it among India's biggest.",
      },
      {
        key: "high",
        label: "52-wk high",
        value: "₹4,592",
        explain:
          "the highest it traded in the last year. yours is ₹4,592 — today's price is notably below that peak.",
      },
      {
        key: "low",
        label: "52-wk low",
        value: "₹3,311",
        explain:
          "the lowest in the last year. yours is ₹3,311 — today's price is above that low.",
      },
    ],
    rows: [
      {
        icon: "💻",
        label: "What they do",
        text: "India's largest IT company — they build and run software systems for banks, insurers, retailers, and governments worldwide. India's biggest tech exporter.",
      },
      {
        icon: "📈",
        label: "How it's doing lately",
        text: "Steady, not spectacular. Big global clients, predictable revenue. The AI wave is both an opportunity and a risk — watch how they adapt.",
      },
      {
        icon: "🌱",
        label: "Good for a first-timer?",
        text: "Yes, for learning. TCS is the definition of a blue-chip IT stock. Not volatile, not flashy — but very reliable over time.",
      },
      {
        icon: "₹",
        label: "What ₹500 buys you",
        text: "At ₹3,750 a share, ₹500 won't buy in yet — you'd need to save ~₹4,000. But worth tracking to understand IT stocks.",
      },
      {
        icon: "👀",
        label: "One thing to watch",
        text: "When US companies cut IT spending in a downturn, TCS is among the first to feel it — their biggest contracts come from there.",
      },
    ],
    pros: [
      "Tata-backed, three decades of profitability and consistent dividends",
      "Massive contract order book — revenue is booked years in advance",
      "Most globally diversified Indian IT stock — less India-specific risk",
    ],
    cons: [
      "At ₹3,750+ per share, you need real savings to buy even one share",
      "Growth is slow and steady — no high-growth moments for a while",
    ],
  },
  {
    name: "ITC",
    symbol: "ITC.NS",
    logo: "i",
    logoBg: "#FFF8E1",
    logoColor: "#F57F17",
    sector: "FMCG · Hotels · Cigarettes",
    vibe: "yellow",
    vibeLabel: "Mixed signals",
    price: 410,
    stats: [
      {
        key: "pe",
        label: "P / E ratio",
        value: "27",
        explain:
          "how pricey the stock is vs what it earns. yours is 27 — fair, especially for a company that pays high dividends and has stable profits.",
      },
      {
        key: "mcap",
        label: "Market cap",
        value: "₹5.1L Cr",
        explain:
          "the total value of the whole company. ₹5.1L Cr is large — ITC is well-established across cigarettes, FMCG, hotels, and more.",
      },
      {
        key: "high",
        label: "52-wk high",
        value: "₹528",
        explain:
          "the highest it traded in the last year. yours is ₹528 — today's price is meaningfully below that peak.",
      },
      {
        key: "low",
        label: "52-wk low",
        value: "₹400",
        explain:
          "the lowest in the last year. yours is ₹400 — today's price is hovering just above the year's low.",
      },
    ],
    rows: [
      {
        icon: "🏪",
        label: "What they do",
        text: "A big conglomerate — cigarettes (the biggest chunk of profits), FMCG brands like Aashirvaad atta and Bingo chips, premium ITC hotels, and paper packaging.",
      },
      {
        icon: "📈",
        label: "How it's doing lately",
        text: "Steady profits, but stock has been under pressure. The cigarette business is cash-generative; the FMCG and hotel segments are growing but slowly.",
      },
      {
        icon: "🌱",
        label: "Good for a first-timer?",
        text: "Decent. It's one of the most affordable big names at ~₹410, pays a solid dividend, but cigarette exposure is something to think about ethically.",
      },
      {
        icon: "₹",
        label: "What ₹500 buys you",
        text: "At ~₹410, ₹500 gets you 1 share with change left over. You'd be an actual part-owner of ITC.",
      },
      {
        icon: "👀",
        label: "One thing to watch",
        text: "The market has been waiting for FMCG and hotels to grow big enough to matter. It's getting there — but slowly.",
      },
    ],
    pros: [
      "One of the most affordable big-name stocks — ₹500 actually buys you a share",
      "Pays a high dividend — you earn cash just for holding it",
      "Diversified across cigarettes, FMCG, hotels, and paper — multiple revenue streams",
    ],
    cons: [
      "Cigarette revenues raise ethical questions for some investors",
      "Stock has underperformed compared to peers for several years",
    ],
  },
  {
    name: "Wipro",
    symbol: "WIPRO.NS",
    logo: "w",
    logoBg: "#F3E5F5",
    logoColor: "#6A1B9A",
    sector: "IT services · Consulting",
    vibe: "yellow",
    vibeLabel: "Mixed signals",
    price: 270,
    stats: [
      {
        key: "pe",
        label: "P / E ratio",
        value: "22",
        explain:
          "how pricey the stock is vs what it earns. yours is 22 — lower than TCS or Infosys, which reflects the market being less convinced about Wipro's growth.",
      },
      {
        key: "mcap",
        label: "Market cap",
        value: "₹2.8L Cr",
        explain:
          "the total value of the whole company. ₹2.8L Cr is large, but meaningfully smaller than TCS (₹13.6L Cr) — Wipro is the third IT major, not the leader.",
      },
      {
        key: "high",
        label: "52-wk high",
        value: "₹327",
        explain:
          "the highest it traded in the last year. yours is ₹327 — today's price is below that, reflecting recent weakness.",
      },
      {
        key: "low",
        label: "52-wk low",
        value: "₹222",
        explain:
          "the lowest in the last year. yours is ₹222 — today's price is above that, so it's recovered somewhat.",
      },
    ],
    rows: [
      {
        icon: "💻",
        label: "What they do",
        text: "One of India's Big Three IT companies — IT services, consulting, and outsourcing for global clients. Think of it as Infosys's smaller, quieter sibling.",
      },
      {
        icon: "📈",
        label: "How it's doing lately",
        text: "Recovery mode. Revenue growth has been slower than TCS or Infosys for a while. New leadership is trying to fix that.",
      },
      {
        icon: "🌱",
        label: "Good for a first-timer?",
        text: "Maybe. It's affordable at ₹270, which is rare for a major IT name. But it's underperformed peers recently — worth understanding why.",
      },
      {
        icon: "₹",
        label: "What ₹500 buys you",
        text: "At ~₹270, ₹500 buys 1 share with ₹230 to spare. It's one of the few IT stocks where ₹500 actually gets you in.",
      },
      {
        icon: "👀",
        label: "One thing to watch",
        text: "Recovery story — watch for revenue growth to actually accelerate, not just stabilise.",
      },
    ],
    pros: [
      "Most affordable entry into major Indian IT — ₹500 buys you a share",
      "PE of ~22 is lower than TCS or Infosys — you're paying less for the same sector",
      "Azim Premji's long-term institutional backing provides stability",
    ],
    cons: [
      "Has lagged TCS and Infosys in growth for several years",
      "Still in recovery — the turnaround isn't confirmed yet",
    ],
  },
  {
    name: "Asian Paints",
    symbol: "ASIANPAINT.NS",
    logo: "a",
    logoBg: "#FCE4EC",
    logoColor: "#AD1457",
    sector: "Paints · Home décor",
    vibe: "yellow",
    vibeLabel: "Mixed signals",
    price: 2250,
    stats: [
      {
        key: "pe",
        label: "P / E ratio",
        value: "47",
        explain:
          "how pricey the stock is vs what it earns. yours is 47 — high. you're paying a big premium for the brand. when premium brands face competition, this multiple can compress.",
      },
      {
        key: "mcap",
        label: "Market cap",
        value: "₹2.2L Cr",
        explain:
          "the total value of the whole company. ₹2.2L Cr is large — Asian Paints is India's dominant paint brand, though its market lead is being challenged.",
      },
      {
        key: "high",
        label: "52-wk high",
        value: "₹3,395",
        explain:
          "the highest it traded in the last year. yours is ₹3,395 — today's price is significantly below that peak, reflecting the recent competitive pressure.",
      },
      {
        key: "low",
        label: "52-wk low",
        value: "₹2,200",
        explain:
          "the lowest in the last year. yours is ₹2,200 — today's price is hovering just above the year's low.",
      },
    ],
    rows: [
      {
        icon: "🎨",
        label: "What they do",
        text: "India's largest paint company. Royale, Apex, Apcolite — most paint in Indian homes is Asian Paints. They've also been moving into wall textures and home décor.",
      },
      {
        icon: "📈",
        label: "How it's doing lately",
        text: "Rough year. New competition from Grasim/Birla Opus has put pressure on margins. The stock is well below its peak.",
      },
      {
        icon: "🌱",
        label: "Good for a first-timer?",
        text: "Worth learning from, but careful. A PE of 47 means you're paying a big premium for the brand. The competitive threat is real and still unresolved.",
      },
      {
        icon: "₹",
        label: "What ₹500 buys you",
        text: "At ~₹2,250 a share, ₹500 doesn't get you there. You'd need to save up to ~₹2,500 to buy in.",
      },
      {
        icon: "👀",
        label: "One thing to watch",
        text: "Birla Opus is spending heavily to grab market share from Asian Paints. Watch how volume and margins hold up quarter by quarter.",
      },
    ],
    pros: [
      "Dominant market position in paints — decades of brand trust with dealers and consumers",
      "Excellent long-term track record before recent competitive pressure",
      "Paints are a resilient sector — people repaint regardless of economic mood",
    ],
    cons: [
      "PE of 47 is expensive — you're paying a premium the business is struggling to justify right now",
      "Significant competitive pressure from Grasim's Birla Opus, a new well-funded entrant",
    ],
  },
];

export function vibeColors(vibe: Vibe) {
  const map = {
    green: { dot: "#4F9D69", bg: "#E9F4EC", border: "#BFE0C8", text: "#36774A" },
    yellow: { dot: "#E0A93C", bg: "#FBF1DC", border: "#EDD7A6", text: "#9A7320" },
    red: { dot: "#D17A5A", bg: "#FBE8E0", border: "#EFC8B7", text: "#A8512F" },
  };
  return map[vibe] || map.green;
}

export const fmt = (n: number) => Number(n).toLocaleString("en-IN");

/** Formats a raw rupee market-cap figure as "₹2.3L Cr" / "₹450 Cr", matching the static copy's style. */
export function formatMarketCapINR(raw: number): string {
  const crore = raw / 1e7;
  if (crore >= 1e5) {
    return `₹${(crore / 1e5).toFixed(1)}L Cr`;
  }
  return `₹${fmt(Math.round(crore))} Cr`;
}

/** Finds a preset Company by its symbol, ignoring .NS / .BO suffix. Returns null for searched companies. */
export function findCompanyBySymbol(symbol: string): Company | null {
  const base = (s: string) => s.split(".")[0].toUpperCase();
  return companies.find((c) => base(c.symbol) === base(symbol)) ?? null;
}
