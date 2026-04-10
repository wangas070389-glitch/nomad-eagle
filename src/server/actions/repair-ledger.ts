"use server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { Decimal } from "decimal.js"
import { container } from "../domain-container"

/**
 * repairLedgerIntegrity
 * Self-healing protocol that reconciles Account balance caches against
 * the immutable Ledger Entries (the same source of truth used by the
 * Integrity Panel in health.ts).
 *
 * Previous version calculated from Transaction records, which diverged
 * from the Integrity Panel's Ledger Entry calculations. Now both systems
 * share a single source of truth.
 */
export async function repairLedgerIntegrity() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.householdId) return { error: "Not authenticated" }

    const householdId = session.user.householdId

    try {
        const results = await prisma.$transaction(async (tx) => {
            const accounts = await tx.account.findMany({
                where: { householdId }
            })

            const repairs = []

            for (const account of accounts) {
                // Calculate balance from Ledger Entries — the SAME source
                // that health.ts (Integrity Panel) uses via
                // container.ledgerService.calculateBalance()
                const ledgerBalance = await container.ledgerService.calculateBalance(account.id)
                const cachedBalance = new Decimal(account.balance.toString())

                const diff = ledgerBalance.minus(cachedBalance).abs()

                if (diff.gt(0.01)) {
                    // Synchronize the cache to match the ledger
                    await tx.account.update({
                        where: { id: account.id },
                        data: { balance: ledgerBalance }
                    })

                    repairs.push({
                        account: account.name,
                        oldBalance: cachedBalance.toString(),
                        newBalance: ledgerBalance.toString(),
                        drift: diff.toString()
                    })
                } else {
                    repairs.push({
                        account: account.name,
                        oldBalance: cachedBalance.toString(),
                        newBalance: cachedBalance.toString(),
                        drift: "0"
                    })
                }
            }
            return repairs
        })

        revalidatePath("/")
        revalidatePath("/plan")
        return { success: true, repairs: results }
    } catch (e) {
        console.error("Ledger Repair Failure:", e)
        return { error: "Failed to repair ledger integrity" }
    }
}
