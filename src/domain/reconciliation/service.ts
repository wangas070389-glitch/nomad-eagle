import { prisma } from "@/lib/prisma"
import { Decimal } from "decimal.js"

export interface ReconciliationStatus {
    plannedItemId: string
    plannedName: string
    limit: Decimal
    actual: Decimal
    remaining: Decimal
    utilizationPercent: number
}

/**
 * The ReconciliationDomainService enforces 'High-Friction' Deterministic Allocation.
 * It transforms raw transaction flows into relational entity variances.
 */
export class ReconciliationDomainService {
    /**
     * Aggregates manual transactions against a specific pre-authorized boundary 
     * for a given date range (usually the current month).
     */
    async getEntityVariance(params: {
        householdId: string
        plannedItemId: string
        type: 'BUDGET_LIMIT' | 'RECURRING_FLOW'
        startDate: Date
        endDate: Date
    }): Promise<ReconciliationStatus> {
        // 1. Fetch Planned Boundary
        let plannedName = "Unknown"
        let limit = new Decimal(0)

        if (params.type === 'BUDGET_LIMIT') {
            const budgetLimit = await prisma.budgetLimit.findUnique({
                where: { id: params.plannedItemId },
                include: { category: true }
            })
            if (budgetLimit) {
                plannedName = `Limit: ${budgetLimit.category.name}`
                limit = new Decimal(budgetLimit.amount.toString())
            }
        } else {
            const flow = await prisma.recurringFlow.findUnique({
                where: { id: params.plannedItemId }
            })
            if (flow) {
                plannedName = flow.name
                limit = new Decimal(flow.amount.toString())
            }
        }

        // 2. Aggregate Actual Consumption (Relational Linkage)
        const transactions = await prisma.transaction.findMany({
            where: {
                householdId: params.householdId,
                OR: [
                    { recurringFlowId: params.plannedItemId }
                ],
                date: {
                    gte: params.startDate,
                    lte: params.endDate
                }
            }
        })

        const actual = transactions.reduce((sum, tx) => sum.plus(new Decimal(tx.amount.toString())), new Decimal(0))
        const remaining = limit.minus(actual)
        const utilizationPercent = limit.gt(0) ? actual.dividedBy(limit).times(100).toNumber() : 0

        return {
            plannedItemId: params.plannedItemId,
            plannedName,
            limit,
            actual,
            remaining,
            utilizationPercent
        }
    }
}
