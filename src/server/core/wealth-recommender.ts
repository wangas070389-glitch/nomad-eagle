import { calculateProjection, ProjectionPoint } from "./growth-engine";

/**
 * THE BRIDGE PROTOCOL
 * Connects Financial Plan (Present Liquidity) -> Wealth Engine (Future Solvency)
 */

export interface RecommendationStrategy {
    surplus: number;
    projectedTotal: number;
    tenYearGain: number;
    message: string;
    chartData: ProjectionPoint[]; // ghost projection data
}

export function generateSurplusProjection(netFlow: number): RecommendationStrategy | null {
    // 1. Validation: Only recommend if user has investable surplus
    if (netFlow <= 100) return null; // Ignore trivial amounts (< $100)

    // 2. Configuration: "Safe Harbor" Defaults
    const DEFAULT_APY = 0.08; // S&P 500 Historical Benchmark (Conservative)
    const DEFAULT_YEARS = 20;

    // 3. Execution: Call the Growth Engine
    const projection = calculateProjection({
        principal: 0, // Starting from scratch with just cashflow
        monthlyContribution: netFlow,
        apy: DEFAULT_APY,
        years: DEFAULT_YEARS,
        isCompound: true
    });

    if (projection.length === 0) return null;

    const finalPoint = projection[projection.length - 1];

    // 4. Insight Generation
    // "Gain" is the wealth created purely by time and interest (Balance - Contributions)
    const gain = finalPoint.balance - finalPoint.totalInvested;

    return {
        surplus: netFlow,
        projectedTotal: finalPoint.balance,
        tenYearGain: gain,
        message: `Your plan generates +$${netFlow.toLocaleString()}/mo. Turn this into $${Math.round(finalPoint.balance / 1000)}k by 2045?`,
        chartData: projection
    };
}
