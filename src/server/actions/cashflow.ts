"use server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { container } from "../domain-container"
import { Decimal } from "decimal.js"

export type ReconciliationCell = {
    planned: number
    actual: number
    remaining: number
}

export type CashFlowRow = {
    id?: string
    name: string
    reconciliationType?: 'BUDGET_LIMIT' | 'RECURRING_FLOW'
    values: (number | ReconciliationCell)[]
}

export type DetailedCashFlow = {
    headers: string[]
    inflows: CashFlowRow[]
    outflows: CashFlowRow[]
    summary: {
        totalIncome: number[]
        totalExpense: number[]
        netFlow: number[]
        endingBalance: number[]
    }
}

export async function getDetailedCashFlow(months: number = 12): Promise<DetailedCashFlow | { error: string }> {
    const session = await getServerSession(authOptions)
    if (!session?.user?.householdId) return { error: "Not authenticated" }

    const householdId = session.user.householdId

    // 1. Fetch Inputs
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    const [flows, accounts, currentTransactions] = await Promise.all([
        prisma.recurringFlow.findMany({ where: { householdId, isActive: true } }),
        prisma.account.findMany({ where: { householdId } }),
        prisma.transaction.findMany({
            where: {
                householdId,
                date: { gte: startOfMonth, lte: endOfMonth }
            }
        })
    ])

    const totalCurrentBalance = accounts.reduce((sum, acc) => sum.plus(new Decimal(acc.balance.toString())), new Decimal(0))
    
    // Aggregate Budget Limits (Hardened Cap)
        // 2. Generate Deterministic Solvency Projection (Domain logic)
    const points = await container.projectionService.generateHardenedProjection({
        householdId,
        startingBalance: totalCurrentBalance,
        recurringFlows: flows.map(f => ({
            id: f.id,
            name: f.name,
            amount: new Decimal(f.amount.toString()),
            type: f.type as 'INCOME' | 'EXPENSE',
            frequency: f.frequency,
            startDate: f.startDate,
            bucket: (f as any).bucket
        })),
        months
    })

    // 3. Transform to UI Structure
    const headers: string[] = []
    const summary = {
        totalIncome: new Array(months).fill(0),
        totalExpense: new Array(months).fill(0),
        netFlow: new Array(months).fill(0),
        endingBalance: new Array(months).fill(0)
    }

    points.forEach((p, i) => {
        // Headers should EXACTLY match the projection points' dates
        headers.push(p.date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }))
        
        summary.totalIncome[i] = p.inflow.toNumber()
        summary.totalExpense[i] = p.outflow.toNumber()
        summary.netFlow[i] = p.inflow.minus(p.outflow).toNumber()
        summary.endingBalance[i] = p.balance.toNumber()
    })

    // 4. Construct Spreadsheet Rows (Granular Splits)
    const inflowRowsMap: Record<string, { id?: string, reconciliationType?: 'BUDGET_LIMIT' | 'RECURRING_FLOW', values: (number | ReconciliationCell)[] }> = {}
    const outflowRowsMap: Record<string, { id?: string, reconciliationType?: 'BUDGET_LIMIT' | 'RECURRING_FLOW', values: (number | ReconciliationCell)[] }> = {}

    points.forEach((p, i) => {
        p.breakdown.forEach(item => {
            const rowMap = item.type === 'INCOME' ? inflowRowsMap : outflowRowsMap
            if (!rowMap[item.name]) {
                rowMap[item.name] = { 
                    id: item.id || "", 
                    reconciliationType: 'RECURRING_FLOW',
                    values: new Array(months).fill(0) 
                }
            }
            
            const plannedAmount = item.amount.toNumber()
            
            // Reconciliation Logic for the Current Month (Index 0)
            if (i === 0 && item.id) {
                const actual = currentTransactions
                    .filter(tx => (tx as any).recurringFlowId === item.id)
                    .reduce((sum, tx) => sum + Number(tx.amount), 0)
                
                rowMap[item.name].values[i] = {
                    planned: plannedAmount,
                    actual: actual,
                    remaining: plannedAmount - actual
                }
            } else {
                rowMap[item.name].values[i] = plannedAmount
            }
        })
    })

    const inflowRows: CashFlowRow[] = Object.entries(inflowRowsMap).map(([name, data]) => ({ 
        id: data.id, 
        name, 
        reconciliationType: data.reconciliationType,
        values: data.values 
    }))
    const outflowRows: CashFlowRow[] = Object.entries(outflowRowsMap).map(([name, data]) => ({ 
        id: data.id, 
        name, 
        reconciliationType: data.reconciliationType,
        values: data.values 
    }))

    // 5. Hardened Summary Recalculation (Binary Priority Logic)
    // For index 0 (current month), we substitute Planned with Actual if realized > 0.
    let hardenedTotalIncome = new Decimal(0)
    let hardenedTotalExpense = new Decimal(0)

    inflowRows.forEach(row => {
        const val = row.values[0]
        if (typeof val === 'object' && val !== null) {
            // Priority: Actual > Planned
            hardenedTotalIncome = hardenedTotalIncome.plus(val.actual > 0 ? val.actual : val.planned)
        } else {
            hardenedTotalIncome = hardenedTotalIncome.plus(val as number)
        }
    })

    outflowRows.forEach(row => {
        const val = row.values[0]
        if (typeof val === 'object' && val !== null) {
            hardenedTotalExpense = hardenedTotalExpense.plus(val.actual > 0 ? val.actual : val.planned)
        } else {
            hardenedTotalExpense = hardenedTotalExpense.plus(val as number)
        }
    })

    // Update Summary index 0 with Forensic Reality
    summary.totalIncome[0] = hardenedTotalIncome.toNumber()
    summary.totalExpense[0] = hardenedTotalExpense.toNumber()
    summary.netFlow[0] = hardenedTotalIncome.minus(hardenedTotalExpense).toNumber()
    
    // Note: endingBalance[0] is already derived from startingBalance + summary components 
    // but summary.netFlow was updated, so we need to refresh endingBalance chain.
    let runningBalance = new Decimal(points[0].balance.minus(points[0].inflow).plus(points[0].outflow)) // Back to start of month
    for (let i = 0; i < months; i++) {
        const net = summary.netFlow[i]
        runningBalance = runningBalance.plus(net)
        summary.endingBalance[i] = runningBalance.toNumber()
    }

    // 6. Sovereignty Layout (Categorical Grouping)
    const inflows: CashFlowRow[] = [
        { name: "Σ Total Inflow", values: summary.totalIncome },
        ...inflowRows
    ]
    
    const outflows: CashFlowRow[] = [
        { name: "Σ Total Expenses", values: summary.totalExpense },
        ...outflowRows
    ]

    return { headers, inflows, outflows, summary }
}
