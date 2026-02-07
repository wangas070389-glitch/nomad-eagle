"use server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"

export async function getBudgetProgress(referenceDate?: Date) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.householdId) return []

    const householdId = session.user.householdId
    // Use client-provided date or fallback to server now
    // If referenceDate is provided, usage depends on if it's already adjusted or just a timestamp.
    // Ideally we want the month relative to the user.
    const now = referenceDate ? new Date(referenceDate) : new Date()

    // Calculate start/end based on 'now'
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    // Adjust endOfMonth to be 23:59:59.999 to cover the full last day
    endOfMonth.setHours(23, 59, 59, 999)

    // 1. Get Limits
    const limits = await prisma.budgetLimit.findMany({
        where: { householdId },
        include: { category: true }
    })

    // 2. Get Actuals (Grouped by Category)
    const actuals = await prisma.transaction.groupBy({
        by: ['categoryId'],
        where: {
            account: { householdId }, // Ensure household scope
            date: {
                gte: startOfMonth,
                lte: endOfMonth
            },
            type: "EXPENSE",
            categoryId: { not: null }
        },
        _sum: {
            amount: true
        }
    })

    // Map Actuals for O(1) lookup
    const spentMap = new Map<string, number>()
    actuals.forEach(a => {
        if (a.categoryId) spentMap.set(a.categoryId, Number(a._sum.amount || 0))
    })

    // 3. Combine
    const progress = limits.map(limit => {
        const spent = spentMap.get(limit.categoryId) || 0
        const max = Number(limit.amount)
        const percent = (spent / max) * 100

        let status: 'safe' | 'warning' | 'danger' = 'safe'
        if (percent > 100) status = 'danger'
        else if (percent > 85) status = 'warning'

        return {
            categoryId: limit.categoryId,
            categoryName: limit.category.name,
            spent,
            limit: max,
            percent,
            status,
            period: limit.period // assume MONTHLY for MVP display
        }
    })

    return progress.sort((a, b) => b.percent - a.percent)
}
