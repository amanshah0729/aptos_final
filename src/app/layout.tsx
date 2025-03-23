import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ReactQueryProvider } from "@/components/ReactQueryProvider";
import { WalletProvider } from "@/components/aptos/wallet-provider";
import { WrongNetworkAlert } from "@/components/aptos/wrong-network-alert";

import "./globals.css";

export const metadata: Metadata = {
  title: "Fuck The House!",
  description: "Blockchain-based gambling platform",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <ReactQueryProvider>
            <div id="root">{children}</div>
            <WrongNetworkAlert />
          </ReactQueryProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
