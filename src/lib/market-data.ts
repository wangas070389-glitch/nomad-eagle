import { unstable_cache } from 'next/cache'

// Mock implementation to avoid yahoo-finance2 bundling issues with child_process
const getCachedPrice = unstable_cache(
    async (ticker: string) => {
        // Deterministic mock price based on ticker string
        const hash = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        return 100 + (hash % 900) // Price between 100 and 1000
    },
    ['asset-price'],
    { revalidate: 3600, tags: ['market-data'] }
)

const getCachedRate = unstable_cache(
    async () => {
        return 20.50 // Hardcoded for stability/mock
    },
    ['exchange-rate'],
    { revalidate: 3600, tags: ['market-data'] }
)

export const marketData = {
    async getAssetPrice(ticker: string | null): Promise<number | null> {
        if (!ticker) return null;
        return getCachedPrice(ticker)
    },

    async getExchangeRate(from: "USD" | "MXN", to: "USD" | "MXN"): Promise<number> {
        if (from === to) return 1;

        const rate = await getCachedRate()

        if (from === "USD" && to === "MXN") {
            return rate
        }
        if (from === "MXN" && to === "USD") {
            return 1 / rate
        }

        return 20.50
    }
}
