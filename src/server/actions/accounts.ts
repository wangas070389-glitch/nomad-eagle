"use server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { container } from "../domain-container"
import { Decimal } from "decimal.js"

import { ActionState } from "@/lib/types"
import { AccountType, Currency, Prisma } from "@prisma/client"

// Local definition if not global yet
// Local definition if not global yet
export type AccountActionState = {
    error?: string
    success?: boolean
} | null

export async function getAccounts(showArchived = false) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session.user.householdId) return []

    // Fetch household accounts
    const where: Prisma.AccountWhereInput = {
        householdId: session.user.householdId
    }

    if (!showArchived) {
        where.isArchived = false
    }

    const accounts = await prisma.account.findMany({
        where,
        orderBy: { name: 'asc' }
    })

    // Convert Decimals to numbers for serialization
    return accounts.map(account => ({
        ...account,
        balance: Number(account.balance)
    }))
}

export async function createAccount(prevState: AccountActionState, formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: "Not authenticated" }

    const name = formData.get("name") as string
    const type = formData.get("type") as AccountType
    const balance = Number(formData.get("balance"))
    const currency = formData.get("currency") as Currency

    if (!name) return { error: "Name is required" }

    try {
        await prisma.account.create({
            data: {
                name,
                type,
                balance,
                currency,
                householdId: session.user.householdId!,
                ownerId: session.user.id // Default to personal ownership
            }
        })

        revalidatePath("/")
        return { success: true }
    } catch (e) {
        return { error: "Failed to create account" }
    }
}

export async function updateAccount(
    accountId: string,
    data: {
        name: string,
        type: string,
        balance: number,
        isArchived: boolean
    }
) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: "Not authenticated" }

    const account = await prisma.account.findUnique({
        where: { id: accountId }
    })

    if (!account) return { error: "Account not found" }

    // Check ownership/permissions (Household check)
    if (account.householdId !== session.user.householdId) {
        return { error: "Unauthorized" }
    }

    try {
        const oldBalance = Number(account.balance)
        const newBalance = data.balance

        // Balance Reconciliation Logic — Route through Domain Service
        // This ensures an immutable LedgerEntry is created for every adjustment
        if (oldBalance !== newBalance) {
            const diff = newBalance - oldBalance

            await container.transactionService.execute({
                amount: new Decimal(Math.abs(diff)),
                type: diff > 0 ? "INCOME" : "EXPENSE",
                description: "Manual Balance Adjustment",
                date: new Date(),
                accountId: account.id,
                householdId: account.householdId,
                userId: session.user.id,
            })
        }

        // Update non-balance metadata (name, type, archive status)
        // Note: Balance is already updated atomically by the domain service above
        await prisma.account.update({
            where: { id: accountId },
            data: {
                name: data.name,
                type: data.type as AccountType,
                isArchived: data.isArchived,
                // Only set balance explicitly if no adjustment was made
                ...(oldBalance === newBalance ? { balance: data.balance } : {})
            }
        })

        revalidatePath("/")
        revalidatePath("/plan")
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: "Failed to update account" }
    }
}

export async function deleteAccount(accountId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: "Not authenticated" }

    const account = await prisma.account.findUnique({
        where: { id: accountId }
    })

    if (!account || account.householdId !== session.user.householdId) {
        return { error: "Unauthorized" }
    }

    try {
        // 1. Clean up LedgerEntry records to prevent orphaned references
        await prisma.ledgerEntry.deleteMany({
            where: { accountId }
        })

        // 2. Cascade delete transactions
        await prisma.transaction.deleteMany({
            where: { accountId }
        })

        // 3. Delete the account itself
        await prisma.account.delete({
            where: { id: accountId }
        })

        revalidatePath("/")
        return { success: true }
    } catch (e) {
        return { error: "Failed to delete account" }
    }
}
