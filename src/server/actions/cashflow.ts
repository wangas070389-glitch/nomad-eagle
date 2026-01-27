"use server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"

export type CashFlowRow = {
    name: string
    values: number[]
}

export type DetailedCashFlow = {
    headers: string[]
    inflows: CashFlowRow[]
    outflows: CashFlowRow[]
    summary: {
        totalIncome: number[]
        totalExpense: number[]
        netFlow: number[]
        endingBalance: number[] // Cash Surplus accumulation
    }
}

export async function getDetailedCashFlow(months: number = 12): Promise<DetailedCashFlow | { error: string }> {
    const session = await getServerSession(authOptions)
    if (!session?.user?.householdId) return { error: "Not authenticated" }

    const householdId = session.user.householdId

    // 1. Fetch Data
    const flows = await prisma.recurringFlow.findMany({
        where: { householdId, isActive: true },
        orderBy: { amount: 'desc' }
    })
    const budgetLimits = await prisma.budgetLimit.findMany({
        where: { householdId },
        include: { category: true }
    })

    // 2. Initialize Structure
    const headers: string[] = []
    const inflowsMap = new Map<string, number[]>()
    const outflowsMap = new Map<string, number[]>()

    // Initialize rows with 0s
    flows.forEach(f => {
        const map = f.type === "INCOME" ? inflowsMap : outflowsMap
        map.set(f.name, new Array(months).fill(0))
    })

    // Add Budget Limits to Outflows
    budgetLimits.forEach(b => {
        outflowsMap.set(b.category.name, new Array(months).fill(0))
    })

    const summary = {
        totalIncome: new Array(months).fill(0),
        totalExpense: new Array(months).fill(0),
        netFlow: new Array(months).fill(0),
        endingBalance: new Array(months).fill(0)
    }

    const today = new Date()
    let runningBalance = 0

    // 3. Time Loop
    for (let i = 1; i <= months; i++) {
        const futureDate = new Date(today.getFullYear(), today.getMonth() + i, 1)
        const currentMonth = futureDate.getMonth()
        const currentYear = futureDate.getFullYear()

        headers.push(futureDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }))
        const arrayIndex = i - 1

        let monthlyIncome = 0
        let monthlyExpense = 0

        // Process Recurring Flows
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
                if (currentMonth === startMonth) isDue = true
            } else if (flow.frequency === "ONE_TIME") {
                if (currentMonth === startMonth && currentYear === startYear) isDue = true
            } else if (flow.frequency === "YEARLY") {
                if (currentMonth === startMonth) isDue = true
            }

            if (isDue) {
                const map = flow.type === "INCOME" ? inflowsMap : outflowsMap
                const row = map.get(flow.name)
                if (row) row[arrayIndex] += amt

                if (flow.type === "INCOME") monthlyIncome += amt
                else monthlyExpense += amt
            }
        }

        // Process Budget Limits (Always Monthly for now)
        for (const limit of budgetLimits) {
            const amt = Number(limit.amount)
            const row = outflowsMap.get(limit.category.name)
            if (row) row[arrayIndex] += amt
            monthlyExpense += amt
        }

        // Update Summary
        summary.totalIncome[arrayIndex] = monthlyIncome
        summary.totalExpense[arrayIndex] = monthlyExpense
        summary.netFlow[arrayIndex] = monthlyIncome - monthlyExpense

        runningBalance += (monthlyIncome - monthlyExpense)
        summary.endingBalance[arrayIndex] = runningBalance
    }

    // 4. Transform Maps to Arrays
    const inflows: CashFlowRow[] = Array.from(inflowsMap.entries()).map(([name, values]) => ({ name, values }))
    const outflows: CashFlowRow[] = Array.from(outflowsMap.entries()).map(([name, values]) => ({ name, values }))

    return { headers, inflows, outflows, summary }
}
