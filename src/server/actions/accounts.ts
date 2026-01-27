"use server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

export async function getAccounts(showArchived = false) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return []

    // Fetch household accounts
    // Logic: Active accounts only by default
    const where: any = {
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

export async function createAccount(prevState: any, formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: "Not authenticated" }

    const name = formData.get("name") as string
    const type = formData.get("type") as string
    const balance = Number(formData.get("balance"))
    const currency = formData.get("currency") as string

    if (!name) return { error: "Name is required" }

    try {
        await prisma.account.create({
            data: {
                name,
                type: type as any,
                balance,
                currency: currency as any,
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

        // Balance Reconciliation Logic
        if (oldBalance !== newBalance) {
            const diff = newBalance - oldBalance

            // Create a system transaction for the adjustment
            await prisma.transaction.create({
                data: {
                    amount: Math.abs(diff),
                    type: diff > 0 ? "INCOME" : "EXPENSE",
                    description: "Manual Balance Adjustment",
                    date: new Date(),
                    currency: account.currency,
                    accountId: account.id,
                    householdId: account.householdId,
                    spentByUserId: session.user.id,
                    // If we had a special category for "Adjustment", we'd use it.
                    // For now, let's leave category blank or system default if we had one.
                }
            })
        }

        await prisma.account.update({
            where: { id: accountId },
            data: {
                name: data.name,
                type: data.type as any,
                balance: data.balance,
                isArchived: data.isArchived
            }
        })

        revalidatePath("/")
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
        // Cascade delete transactions first (if not handled by DB cascade)
        // Schema usually handles cascade if defined, but being safe:
        await prisma.transaction.deleteMany({
            where: { accountId }
        })

        await prisma.account.delete({
            where: { id: accountId }
        })

        revalidatePath("/")
        return { success: true }
    } catch (e) {
        return { error: "Failed to delete account" }
    }
}
