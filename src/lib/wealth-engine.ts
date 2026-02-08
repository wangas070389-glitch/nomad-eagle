export interface Strategy {
    id: string
    name: string // "CETES", "S&P 500", "Savings"
    balance: number
    monthlyContribution: number
    returnMean: number // annual, e.g. 0.07 for 7%
    returnVol: number // annual, e.g. 0.15 for 15%
}

export interface SimulationResult {
    month: number
    year: number
    deterministic: number // Median / Expected
    p10: number // Pessimistic (10th percentile)
    p90: number // Optimistic (90th percentile)
}

export class WealthEngine {
    private strategies: Strategy[]

    constructor(strategies: Strategy[]) {
        this.strategies = strategies
    }

    /**
     * Run the simulation (Deterministic & Stochastic)
     * @param durationMonths How many months to simulate
     * @param iterations Number of Monte Carlo iterations (default 1000)
     */
    runSimulation(durationMonths: number = 360, iterations: number = 1000): SimulationResult[] {
        // 1. Calculate Deterministic Path (Median Baseline)
        const deterministicPath = this.simulatePath(durationMonths, 'DETERMINISTIC')

        // 2. Run Monte Carlo Simulations
        const mcPaths: number[][] = [] // 1000 paths of length durationMonths
        for (let i = 0; i < iterations; i++) {
            mcPaths.push(this.simulatePath(durationMonths, 'STOCHASTIC'))
        }

        // 3. Aggregate Percentiles per Month
        const results: SimulationResult[] = []
        const startYear = new Date().getFullYear()

        for (let m = 0; m <= durationMonths; m++) {
            // Collect all simulated values for month M
            const valuesAtMonth = mcPaths.map(path => path[m])
            valuesAtMonth.sort((a, b) => a - b)

            results.push({
                month: m,
                year: startYear + Math.floor(m / 12),
                deterministic: deterministicPath[m],
                p10: valuesAtMonth[Math.floor(iterations * 0.1)] || 0,
                p90: valuesAtMonth[Math.floor(iterations * 0.9)] || 0
            })
        }

        return results
    }

    private simulatePath(months: number, mode: 'DETERMINISTIC' | 'STOCHASTIC'): number[] {
        // Create a working copy of strategies (mutable balances)
        const currentStrategies = this.strategies.map(s => ({ ...s }))
        const path: number[] = []

        // Initial Total
        path.push(currentStrategies.reduce((sum, s) => sum + s.balance, 0))

        for (let m = 1; m <= months; m++) {
            let monthTotal = 0

            for (const s of currentStrategies) {
                // Determine Rate for this month
                let monthlyRate = 0
                if (mode === 'DETERMINISTIC') {
                    // Simple r = mean / 12
                    monthlyRate = s.returnMean / 12
                } else {
                    // Geometric Brownian Motion: dS = S*r*dt + S*sigma*dW
                    // monthly_r = (mean - 0.5*vol^2)/12 + vol/sqrt(12) * Z
                    // Z = Random Normal Number (Box-Muller transform)
                    const dt = 1 / 12
                    const drift = (s.returnMean - 0.5 * Math.pow(s.returnVol, 2)) * dt
                    const shock = s.returnVol * Math.sqrt(dt) * this.gaussianRandom()
                    monthlyRate = drift + shock
                }

                // Apply Growth
                // NewBalance = Old * e^(rate) + Contribution
                // Continuous compounding approximation or discrete?
                // Discrete for simplicity: Balance * (1 + rate)
                // For GBM: Balance * exp(rate)

                if (mode === 'STOCHASTIC') {
                    s.balance = s.balance * Math.exp(monthlyRate) + s.monthlyContribution
                } else {
                    s.balance = s.balance * (1 + monthlyRate) + s.monthlyContribution
                }

                monthTotal += s.balance
            }
            path.push(monthTotal)
        }

        return path
    }

    // Box-Muller Transform for standard normal distribution
    private gaussianRandom(): number {
        let u = 0, v = 0
        while (u === 0) u = Math.random()
        while (v === 0) v = Math.random()
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
    }

    /**
     * Finds the crossover month where P10 exceeds target
     */
    static findFreedomDate(results: SimulationResult[], target: number): string | null {
        const match = results.find(r => r.p10 >= target)
        if (!match) return null

        const date = new Date()
        date.setMonth(date.getMonth() + match.month)
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }
}
