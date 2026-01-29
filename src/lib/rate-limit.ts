import { SHIELD_CONFIG } from "../../shield.config"

export class RateLimiter {
    private timestamps: Map<string, number[]> = new Map();
    private windowMs: number;
    private maxRequests: number;

    constructor(windowMs: number, maxRequests: number) {
        this.windowMs = windowMs;
        this.maxRequests = maxRequests;
    }

    check(key: string): boolean {
        const now = Date.now();
        const timestamps = this.timestamps.get(key) || [];

        // Filter out timestamps older than the window
        const validTimestamps = timestamps.filter(ts => now - ts < this.windowMs);

        if (validTimestamps.length >= this.maxRequests) {
            return false;
        }

        validTimestamps.push(now);
        this.timestamps.set(key, validTimestamps);

        // Cleanup memory occasionally if needed, but for Map simple keys it's okay for now.
        // In serverless, this Map persists only as long as the lambda is hot. 
        // For strict distributed limiting, use Redis/Vercel KV.
        return true;
    }
}

// Global instance for simple in-memory limiting (per container)
// Configured via Shield Protocol
export const loginRateLimiter = new RateLimiter(
    60 * 1000,
    SHIELD_CONFIG.network.rate_limit_per_minute
);
