import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CeloSave - Group Savings on Celo",
  description:
    "Decentralized rotating savings groups (Samiti/Esusu/Tontine) built on Celo. Join or create a savings circle with friends and family using cUSD, USDT, or USDC.",
  keywords: ["Celo", "MiniPay", "savings", "DeFi", "stablecoin", "samiti", "tontine", "esusu"],
  openGraph: {
    title: "CeloSave - Group Savings on Celo",
    description: "Decentralized rotating savings groups built on Celo blockchain",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
