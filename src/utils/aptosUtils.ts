import { AptosClient, Types } from 'aptos';

// Initialize Aptos client (using devnet for development)
const client = new AptosClient('https://fullnode.devnet.aptoslabs.com/v1');

// Contract address and module info
// Use the full address with 0x prefix
const CONTRACT_ADDRESS = '0x6d5363db550862fb6fdc64ce2a60ff59486a111d53576d3fd70f2c5ebd14b3b1';
const MODULE_NAME = 'message_board';

export async function callViewFunction(functionName: string): Promise<any> {
  try {
    const payload: Types.ViewRequest = {
      function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::${functionName}`,
      type_arguments: [],
      arguments: []
    };

    console.log(`Calling view function: ${payload.function}`);
    const response = await client.view(payload);
    return response[0]; // The first element contains the return value
  } catch (error) {
    console.error(`Error calling view function ${functionName}:`, error);
    throw error;
  }
}

export async function getVaultBalance(): Promise<number> {
  const balanceInOctas = await callViewFunction('get_vault_balance');
  // Convert from octas (10^8) to APT
  return Number(balanceInOctas) / 100000000;
}

export async function getDepositCount(): Promise<number> {
  return Number(await callViewFunction('get_deposit_count'));
}

export async function getAllDepositors(): Promise<string[]> {
  return await callViewFunction('get_all_depositors');
}

export async function getReturnPercentage(): Promise<number> {
  return Number(await callViewFunction('get_gambler_return_percentage'));
} 