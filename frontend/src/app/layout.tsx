import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "@/providers/web3-provider";

export const metadata: Metadata = {
  title: "Sentinel - AI Guardian for DeFi Safety",
  description: "Autonomous DeFi protection that monitors your positions 24/7 and automatically withdraws funds to safety when exploits are detected.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
