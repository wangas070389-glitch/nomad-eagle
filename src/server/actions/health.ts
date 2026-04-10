"use server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { container } from "../domain-container"

export interface IntegrityReport {
    status: 'HEALTHY' | 'UNHEALTHY'
    discrepancies: {
        accountId: string
        accountName: string
        cachedBalance: number
        ledgerBalance: number
        diff: number
    }[]
}

/**
 * getSystemIntegrity
 * Performs a real-time reconciliation check between Account Cache and Ledger Truth.
 */
export async function getSystemIntegrity(): Promise<IntegrityReport> {
    const session = await getServerSession(authOptions)
    if (!session?.user?.householdId) throw new Error("Unauthorized")

    const accounts = await prisma.account.findMany({
        where: { householdId: session.user.householdId }
    })

    const discrepancies = []
    let isHealthy = true

    for (const account of accounts) {
        const ledgerBalance = await container.ledgerService.calculateBalance(account.id)
        const cachedBalance = Number(account.balance)
        const diff = Math.abs(ledgerBalance.toNumber() - cachedBalance)

        if (diff > 0.01) { // Threshold for float precision or rounding
            isHealthy = false
            discrepancies.push({
                accountId: account.id,
                accountName: account.name,
                cachedBalance,
                ledgerBalance: ledgerBalance.toNumber(),
                diff
            })
        }
    }

    return {
        status: isHealthy ? 'HEALTHY' : 'UNHEALTHY',
        discrepancies
    }
}
