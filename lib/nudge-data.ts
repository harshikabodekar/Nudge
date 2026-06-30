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
  logo: string;
  logoBg: string;
  logoColor: string;
  sector: string;
  vibe: Vibe;
  vibeLabel: string;
  price: number;
  stats: Stat[];
  rows: Row[];
}

export const companies: Company[] = [
  {
    name: "Zomato",
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
  },
  {
    name: "Infosys",
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
  },
  {
    name: "Tata Motors",
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
        text: "Around ₹950 a share, so ₹500 is about half a share if your app allows fractions — otherwise one to save up for.",
      },
      {
        icon: "👀",
        label: "One thing to watch",
        text: "Car sales rise and fall with the economy. A slow year can dent profits.",
      },
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
