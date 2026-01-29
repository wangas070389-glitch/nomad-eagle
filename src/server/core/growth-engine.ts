/**
 * THE CORE PROTOCOL
 * Rules:
 * 1. Pure Functions Only (Input -> Output)
 * 2. No External Dependencies (No DB, No Fetch)
 * 3. Deterministic Math
 */

export interface ProjectionPoint {
    year: number;
    balance: number;
    totalInvested: number;
    interestEarned: number;
}

export interface GrowthParameters {
    principal: number;
    monthlyContribution: number;
    apy: number; // e.g., 0.10 for 10%
    years: number;
    isCompound: boolean;
}

export function calculateProjection(params: GrowthParameters): ProjectionPoint[] {
    const { principal, monthlyContribution, apy, years, isCompound } = params;

    // Validation (Core Logic)
    if (years <= 0 || years > 100) throw new Error("Years must be between 1 and 100");
    if (apy < 0) throw new Error("APY cannot be negative");

    const result: ProjectionPoint[] = [];
    let currentBalance = principal;
    let totalInvested = principal;

    // Monthly Rate
    const r = apy / 12;

    for (let year = 1; year <= years; year++) {
        for (let month = 1; month <= 12; month++) {
            // 1. Add Contribution
            currentBalance += monthlyContribution;
            totalInvested += monthlyContribution;

            // 2. Apply Interest
            if (isCompound) {
                // Compound: Interest on (Principal + Interest)
                currentBalance = currentBalance * (1 + r);
            } else {
                // Simple: Interest only on Total Invested (Principal + Contributions)
                // Note: Simple interest usually means interest doesn't compound.
                // Simple Interest Formula for one month: P * r * t
                // But in a progressive simulation, we usually mean we don't reinvest the interest.
                // However, 'Simple Interest' on a growing balance is tricky to verify against standard definitions.
                // Interpretation for this engine: Interest is calculated on the Principal + Contributions sum, 
                // and added to a separate 'Interest Bucket' or accumulated, but does NOT start earning interest itself.
                // BUT, to keep `currentBalance` representing Total Wealth, we add it. 
                // We just calculate the interest portion based on (Total Invested) vs (Current Balance).

                const interestPayment = totalInvested * r;
                currentBalance += interestPayment;
            }
        }

        result.push({
            year,
            balance: Number(currentBalance.toFixed(2)),
            totalInvested: Number(totalInvested.toFixed(2)),
            interestEarned: Number((currentBalance - totalInvested).toFixed(2))
        });
    }

    return result;
}
