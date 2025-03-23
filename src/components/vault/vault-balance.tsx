import { useVaultBalance } from '@/hooks/useVaultBalance'

export function VaultBalance() {
  const { data: balance, isLoading } = useVaultBalance()
  
  return (
    <div className="text-center mb-4">
      <div className="text-sm text-gray-400">Total Staked</div>
      <div className="text-xl font-bold text-blue-400">
        {isLoading ? "Loading..." : `${balance?.toFixed(2) || "0"} APT`}
      </div>
    </div>
  )
} 