"use server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { marketData } from "@/lib/market-data"
import { unstable_cache } from "next/cache"

export type SimulationPoint = {
    date: string
    actual: number | null
    projected: number | null
}

export type SimulationSummary = {
    currentNetWorth: number
    monthlySurplus: number
    projectedTotal: number
}

// The core logic, decoupled from auth for cleaner caching signature
const performSimulation = async (householdId: string, months: number, annualReturnRate: number) => {
    // 1. Get Current Net Worth (The Starting Block)
    const accounts = await prisma.account.findMany({
        where: { householdId },
        include: { positions: true }
    })

    const exchangeRate = await marketData.getExchangeRate("USD", "MXN")

    let currentCash = 0
    let currentInvestments = 0

    for (const acc of accounts) {
        let accBalance = Number(acc.balance)
        if (acc.currency === "USD") accBalance *= exchangeRate

        if (acc.type === "INVESTMENT") {
            currentCash += accBalance
            for (const pos of acc.positions) {
                let posValue = Number(pos.quantity) * Number(pos.costBasis)
                if (pos.currency === "USD") posValue *= exchangeRate
                currentInvestments += posValue
            }
        } else {
            currentCash += accBalance
        }
    }

    const startNetWorth = currentCash + currentInvestments

    // 2. Load Rules (Flows & Limits)
    const flows = await prisma.recurringFlow.findMany({ where: { householdId, isActive: true } })
    const budgetLimits = await prisma.budgetLimit.findMany({ where: { householdId } })

    // Calculate baseline monthly budget expenses (Variable Limits)
    let monthlyVariableExpenses = 0
    for (const limit of budgetLimits) {
        monthlyVariableExpenses += Number(limit.amount)
    }

    // 3. The Time-Travel Loop
    const data: SimulationPoint[] = []

    const today = new Date()
    data.push({
        date: today.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        actual: Math.round(startNetWorth),
        projected: Math.round(startNetWorth)
    })

    let simCash = currentCash
    let simInvestments = currentInvestments
    const monthlyRate = annualReturnRate / 12

    let totalProjectedSurplus = 0

    for (let i = 1; i <= months; i++) {
        const futureDate = new Date(today.getFullYear(), today.getMonth() + i, 1)
        const currentMonth = futureDate.getMonth()
        const currentYear = futureDate.getFullYear()

        // Apply Investment Growth first (compounding)
        simInvestments = simInvestments * (1 + monthlyRate)

        let monthlyIncome = 0
        let monthlyExpenses = 0

        // Fixed Flows Logic
        for (const flow of flows) {
            const amt = Number(flow.amount)
            const startDate = new Date(flow.startDate)
            const startMonth = startDate.getMonth()
            const startYear = startDate.getFullYear()

            let isDue = false

            if (flow.frequency === "MONTHLY") {
                isDue = true
            } else if (flow.frequency === "QUARTERLY") {
                const monthDiff = (currentMonth - startMonth) + (currentYear - startYear) * 12
                if (monthDiff >= 0 && monthDiff % 3 === 0) isDue = true
            } else if (flow.frequency === "SEMIANNUAL") {
                const monthDiff = (currentMonth - startMonth) + (currentYear - startYear) * 12
                if (monthDiff >= 0 && monthDiff % 6 === 0) isDue = true
            } else if (flow.frequency === "ANNUAL") {
                // Approximate hit
                if (currentMonth === startMonth) isDue = true
            } else if (flow.frequency === "ONE_TIME") {
                if (currentMonth === startMonth && currentYear === startYear) isDue = true
            } else if (flow.frequency === "WEEKLY") {
                monthlyIncome += (flow.type === "INCOME" ? amt : 0) * 4.33
                monthlyExpenses += (flow.type === "EXPENSE" ? amt : 0) * 4.33
                continue
            } else if (flow.frequency === "YEARLY") {
                if (currentMonth === startMonth) isDue = true
            }

            if (isDue) {
                if (flow.type === "INCOME") monthlyIncome += amt
                if (flow.type === "EXPENSE") monthlyExpenses += amt
            }
        }

        monthlyExpenses += monthlyVariableExpenses

        const netFlow = monthlyIncome - monthlyExpenses
        totalProjectedSurplus += netFlow

        const safetyNetTarget = 6 * monthlyExpenses

        if (netFlow > 0) {
            if (simCash < safetyNetTarget) {
                simCash += netFlow
            } else {
                simInvestments += netFlow
            }
        } else {
            simCash += netFlow
            if (simCash < 0) {
                simInvestments += simCash
                simCash = 0
            }
        }

        data.push({
            date: futureDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            actual: null,
            projected: Math.round(simCash + simInvestments)
        })
    }

    const endNetWorth = simCash + simInvestments

    return {
        data,
        summary: {
            currentNetWorth: startNetWorth,
            monthlySurplus: Math.round(totalProjectedSurplus / months),
            projectedTotal: Math.round(endNetWorth)
        }
    }
}

export async function simulateNetWorth(months: number = 60, annualReturnRate: number = 0.08) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.householdId) return { error: "Not authenticated" }

    const householdId = session.user.householdId

    // Use unstable_cache
    const getCachedSimulation = unstable_cache(
        async (hId: string, m: number, r: number) => performSimulation(hId, m, r),
        [`forecast-household-${householdId}`],
        {
            tags: [`forecast-household-${householdId}`],
            revalidate: 3600 // Cache for 1 hour by default, invalidate on changes
        }
    )

    return await getCachedSimulation(householdId, months, annualReturnRate)
}
