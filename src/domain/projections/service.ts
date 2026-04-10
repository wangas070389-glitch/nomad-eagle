import { Decimal } from "decimal.js"
import { LedgerRepository } from "../ledger/types"
import { StrategicBucket, Frequency } from "@prisma/client"

export interface ProjectionPoint {
  date: Date
  inflow: Decimal
  outflow: Decimal
  balance: Decimal
  breakdown: {
    id?: string // Atomic Entity ID for reconciliation linkage
    name: string
    amount: Decimal
    type: 'INCOME' | 'EXPENSE'
    bucket: StrategicBucket
  }[]
}

/**
 * ProjectionDomainService
 * Hardened simulation engine that derives future performance from historical ledger provenance.
 */
export class ProjectionDomainService {
  constructor(private ledgerRepo: LedgerRepository) {}

  /**
   * Determine if a recurring flow is due in the target month.
   */
  private isFlowDue(flow: { name: string, frequency: Frequency, startDate: Date }, targetDate: Date): boolean {
    const start = new Date(flow.startDate)
    const target = new Date(targetDate)
    
    // Normalize to first of the month for year/month comparison
    const startNorm = new Date(start.getFullYear(), start.getMonth(), 1)
    const targetNorm = new Date(target.getFullYear(), target.getMonth(), 1)

    if (targetNorm < startNorm) {
        return false
    }

    const diffMonths = (targetNorm.getFullYear() - startNorm.getFullYear()) * 12 + (targetNorm.getMonth() - startNorm.getMonth())
    let isDue = false

    switch (flow.frequency) {
        case 'MONTHLY':
            isDue = true
            break
        case 'QUARTERLY':
            isDue = diffMonths % 3 === 0
            break
        case 'SEMIANNUAL':
            isDue = diffMonths % 6 === 0
            break
        case 'ANNUAL':
            isDue = diffMonths % 12 === 0
            break
        case 'WEEKLY':
            isDue = true 
            break
        case 'ONE_TIME':
            isDue = diffMonths === 0
            break
        default:
            isDue = true
    }

    return isDue
  }
  /**
   * Generates a 12-month projection derived exclusively from Planner entities.
   * Enforces Locked Planner Sovereignty (100% deterministic).
   */
  async generateHardenedProjection(params: {
    householdId: string,
    startingBalance: Decimal,
    recurringFlows: { 
        id: string, 
        name: string, 
        amount: Decimal, 
        type: 'INCOME' | 'EXPENSE', 
        frequency: Frequency, 
        startDate: Date,
        bucket: StrategicBucket
    }[],
    months: number
  }): Promise<ProjectionPoint[]> {
    let runningBalance = params.startingBalance
    const points: ProjectionPoint[] = []
    const now = new Date()
    // Align to the start of the current day in local/server time to prevent mid-month rollover issues
    const today = new Date(now.getFullYear(), now.getMonth(), 1)

    for (let i = 0; i < params.months; i++) {
        const projectionDate = new Date(today.getFullYear(), today.getMonth() + i, 1)
      
      let monthlyInflow = new Decimal(0)
      let monthlyOutflow = new Decimal(0) 
      const breakdown: ProjectionPoint['breakdown'] = []

      // 1. Process Static Inflows
      for (const flow of params.recurringFlows.filter(f => f.type === 'INCOME')) {
        if (flow.frequency === 'WEEKLY' as any) {
            // Weekly: contribute 4.33x the amount per month
            const weeklyMonthly = flow.amount.mul(4.33)
            monthlyInflow = monthlyInflow.plus(weeklyMonthly)
            breakdown.push({ 
                id: flow.id, 
                name: flow.name, 
                amount: weeklyMonthly, 
                type: 'INCOME',
                bucket: flow.bucket
            })
        } else if (this.isFlowDue(flow, projectionDate)) {
            monthlyInflow = monthlyInflow.plus(flow.amount)
            breakdown.push({ 
                id: flow.id, 
                name: flow.name, 
                amount: flow.amount, 
                type: 'INCOME',
                bucket: flow.bucket
            })
        }
      }

      // 2. Process Static Outflows
      for (const flow of params.recurringFlows.filter(f => f.type === 'EXPENSE')) {
        let amountToApply = new Decimal(0)
        let isDue = false

        if (flow.frequency === 'WEEKLY' as any) {
            amountToApply = flow.amount.mul(4.33)
            isDue = true
        } else if (this.isFlowDue(flow, projectionDate)) {
            amountToApply = flow.amount
            isDue = true
        }

        if (isDue) {
            monthlyOutflow = monthlyOutflow.plus(amountToApply)
            breakdown.push({ 
                id: flow.id, 
                name: flow.name, 
                amount: amountToApply, 
                type: 'EXPENSE',
                bucket: flow.bucket
            })
        }
      }

      runningBalance = runningBalance.plus(monthlyInflow).minus(monthlyOutflow)

      points.push({
        date: projectionDate,
        inflow: monthlyInflow,
        outflow: monthlyOutflow,
        balance: runningBalance,
        breakdown
      })
    }

    return points
  }
}
