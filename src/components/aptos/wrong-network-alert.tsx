"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { NETWORK } from "@/constants";
import { useEffect } from "react";

export function WrongNetworkAlert() {
  const { network } = useWallet();
  
  useEffect(() => {
    if (network && network !== NETWORK) {
      console.error(`Wrong network detected: ${network}. Please switch to ${NETWORK} in your wallet.`);
    }
  }, [network]);
  
  // Return null to not render anything in the UI
  return null;
} 