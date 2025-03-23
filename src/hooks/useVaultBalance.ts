import { useQuery } from '@tanstack/react-query'

export function useVaultBalance() {
  return useQuery({
    queryKey: ['vault-balance'],
    queryFn: async () => {
      // Return a mock balance
      return Math.random() * 100 + 50
    },
    refetchInterval: 5000 // Refresh every 5 seconds
  })
} 