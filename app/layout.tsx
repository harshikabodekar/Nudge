import type { Metadata } from "next";
import { Quicksand, Nunito } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"
  ),
  title: "Nudge — investing for people who find investing scary",
  description:
    "Plain language. Real companies. Practice with fake money. No signup, no pressure — your first nudge into investing.",
  openGraph: {
    title: "Nudge — investing for people who find investing scary",
    description:
      "Plain language. Real companies. Practice with fake money. No signup, no pressure — your first nudge into investing.",
    type: "website",
    siteName: "Nudge",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nudge — investing for people who find investing scary",
    description:
      "Plain language. Real companies. Practice with fake money. No signup, no pressure — your first nudge into investing.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${quicksand.variable} ${nunito.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
