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

    // 3. Get All Categories (for names of unbudgeted items)
    const allCategories = await prisma.category.findMany({
        where: { householdId }
    })
    const categoryNameMap = new Map<string, string>()
    allCategories.forEach(c => categoryNameMap.set(c.id, c.name))

    // 4. Combine & Merge
    // Start with explicit limits
    const progress = limits.map(limit => {
        const spent = spentMap.get(limit.categoryId) || 0
        const max = Number(limit.amount)
        const percent = (spent / max) * 100

        let status: 'safe' | 'warning' | 'danger' = 'safe'
        if (percent > 100) status = 'danger'
        else if (percent > 85) status = 'warning'

        // Remove processed item from map to identify unbudgeted later?
        // Actually simpler: Set of processed IDs.
        spentMap.delete(limit.categoryId)

        return {
            categoryId: limit.categoryId,
            categoryName: limit.category.name,
            spent,
            limit: max,
            percent,
            status,
            period: limit.period
        }
    })

    // Add remaining (Unbudgeted) items from spentMap
    for (const [categoryId, spent] of spentMap.entries()) {
        if (spent > 0) { // Only show if there is spending
            const name = categoryNameMap.get(categoryId) || "Unknown Category"
            progress.push({
                categoryId: categoryId,
                categoryName: name,
                spent: spent,
                limit: 0, // No limit set
                percent: 100, // Visual full bar, or handle as special case in UI
                status: 'danger', // Default to danger/over-budget color
                period: 'MONTHLY'
            })
        }
    }

    // Sort: Danger first (over budget), then by % usage
    return progress.sort((a, b) => {
        if (a.status === 'danger' && b.status !== 'danger') return -1
        if (b.status === 'danger' && a.status !== 'danger') return 1
        return b.percent - a.percent
    })
}
