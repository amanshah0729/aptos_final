import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

// Create the configuration for the Aptos client
const aptosConfig = new AptosConfig({
  network: (process.env.NEXT_PUBLIC_APP_NETWORK as Network) || Network.DEVNET,
  // Make sure to include the API key in the client configuration
  clientConfig: {
    HEADERS: {
      "x-api-key": process.env.NEXT_PUBLIC_APTOS_API_KEY || "",
    },
  },
});

// Create and export the Aptos client
const aptosClient = new Aptos(aptosConfig);

export default aptosClient; 