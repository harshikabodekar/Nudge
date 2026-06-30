export type Screen = "home" | "explore" | "about" | "trade";

export interface Wallet {
  cash: number;
  holdings: Record<number, { shares: number; cost: number }>;
}
