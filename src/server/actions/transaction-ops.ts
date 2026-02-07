"use server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

/**
 * atomicDeleteTransaction
 * 1. Get Transaction Amount and Account
 * 2. Reverse balance impact (Expense -> Add, Income -> Subtract)
 * 3. Delete Transaction
 */
export async function deleteTransaction(id: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.householdId) return { error: "Not authenticated" }

    const tx = await prisma.transaction.findUnique({
        where: { id },
        include: { account: true }
    })

    if (!tx) return { error: "Transaction not found" }

    // Ownership Check: 
    // - If personal account: must be owner.
    // - If joint account: any household member can delete? Or just owner/admin?
    // Let's allow anyone in household to delete joint transactions for now (Trust model)
    // But if it's personal, strictly only owner.

    if (tx.account?.ownerId && tx.account.ownerId !== session.user.id) {
        return { error: "You cannot delete transactions from a personal account that is not yours." }
    }

    // Joint account check (ensure account belongs to household)
    if (tx.account?.householdId !== session.user.householdId) {
        return { error: "Unauthorized" }
    }

    const targetAccountId = tx.accountId
    if (!targetAccountId) return { error: "Transaction has no linked account" }

    try {
        await prisma.$transaction(async (txPrisma) => {
            // Revert Balance
            const amount = Number(tx.amount)
            let balanceChange = 0

            if (tx.type === "EXPENSE") {
                balanceChange = amount // Add back
            } else if (tx.type === "INCOME") {
                balanceChange = -amount // Remove income
            }
            // Transfer logic is complex (two sides). For MVP assume simple expense/income logic or ignore transfer balance impact if not linked.
            // If Type is TRANSFER, we might need to handle the "To" account too if implemented. 
            // For now, let's assume single-sided impact or user handles both.

            if (balanceChange !== 0) {
                await txPrisma.account.update({
                    where: { id: targetAccountId },
                    data: {
                        balance: { increment: balanceChange }
                    }
                })
            }

            // Delete
            await txPrisma.transaction.delete({
                where: { id }
            })
        })

        revalidatePath("/")
        return { success: true }
    } catch (e) {
        return { error: "Failed to delete transaction" }
    }
}

/**
 * atomicUpdateTransaction
 * 1. Calc diff (New - Old)
 * 2. Update Balance
 * 3. Update Transaction
 */
// Skipping updateTransaction for now to focus on Delete first as requested in verification plan
// Actually plan asked for Edit too. Let's start with Delete to unblock verifying Kicking/Delete first?
// No, I should implement it.

import { ActionState } from "@/lib/types"
import { generateEmbedding } from "@/lib/embedding"

// ... existing deleteTransaction ...

export async function updateTransaction(id: string, prevState: ActionState, formData: FormData): Promise<ActionState> {
    const session = await getServerSession(authOptions)
    if (!session?.user?.householdId) return { error: "Not authenticated" }

    const amountStr = formData.get("amount") as string
    const dateStr = formData.get("date") as string
    const description = formData.get("description") as string
    const categoryId = formData.get("categoryId") as string
    const accountId = formData.get("accountId") as string
    const type = formData.get("type") as "INCOME" | "EXPENSE"
    const spentByUserId = formData.get("spentByUserId") as string || session.user.id

    if (!amountStr || !dateStr || !accountId || !type) return { error: "Missing fields" }

    const newAmount = parseFloat(amountStr)
    const newDate = new Date(dateStr)

    // 1. Fetch Original
    const oldTx = await prisma.transaction.findUnique({
        where: { id },
        include: { account: true }
    })

    if (!oldTx) return { error: "Transaction not found" }

    // Auth Checks
    if (oldTx.account?.householdId !== session.user.householdId) return { error: "Unauthorized" }

    const oldAccountId = oldTx.accountId
    if (!oldAccountId) return { error: "Transaction has no linked account" }

    // If moving to a new account, check access to new account
    if (accountId !== oldTx.accountId) {
        const newAccount = await prisma.account.findUnique({ where: { id: accountId } })
        if (!newAccount) return { error: "New account not found" }
        if (newAccount.householdId !== session.user.householdId) return { error: "Unauthorized access to new account" }
        if (newAccount.ownerId && newAccount.ownerId !== session.user.id) return { error: "Cannot move to a personal account you don't own" }
    }

    try {
        await prisma.$transaction(async (txPrisma) => {
            // 2. Revert Phase (Undo the past)
            // If Old was Expense: Balance had decreased. So ADD back.
            // If Old was Income: Balance had increased. So SUBTRACT.
            const oldAmount = Number(oldTx.amount)
            let revertChange = 0

            if (oldTx.type === "EXPENSE") {
                revertChange = oldAmount
            } else if (oldTx.type === "INCOME") {
                revertChange = -oldAmount
            }

            if (revertChange !== 0) {
                await txPrisma.account.update({
                    where: { id: oldAccountId },
                    data: { balance: { increment: revertChange } }
                })
            }

            // 3. Apply Phase (Write the future)
            // If New is Expense: SUBTRACT.
            // If New is Income: ADD.
            let applyChange = 0
            if (type === "EXPENSE") {
                applyChange = -newAmount
            } else if (type === "INCOME") {
                applyChange = newAmount
            }

            // Apply to (potentially new) account
            await txPrisma.account.update({
                where: { id: accountId },
                data: { balance: { increment: applyChange } }
            })

            // 4. Update Transaction Record
            if (accountId !== oldTx.accountId) {
                const newAcc = await txPrisma.account.findUniqueOrThrow({ where: { id: accountId } })
                await txPrisma.transaction.update({
                    where: { id },
                    data: {
                        amount: newAmount,
                        date: newDate,
                        description,
                        type,
                        categoryId: categoryId || null,
                        accountId,
                        spentByUserId,
                        currency: newAcc.currency
                    }
                })

                try {
                    const embedding = await generateEmbedding(description)
                    const vector = `[${embedding.join(",")}]`
                    await txPrisma.$executeRawUnsafe(
                        `UPDATE "Transaction" SET "descriptionEmbedding" = '${vector}'::vector WHERE id = '${id}'`
                    )
                } catch (e) {
                    console.error("Failed to update embedding", e)
                }
            } else {
                await txPrisma.transaction.update({
                    where: { id },
                    data: {
                        amount: newAmount,
                        date: newDate,
                        description,
                        type,
                        categoryId: categoryId || null,
                        accountId,
                        spentByUserId
                    }
                })

                try {
                    const embedding = await generateEmbedding(description)
                    const vector = `[${embedding.join(",")}]`
                    await txPrisma.$executeRawUnsafe(
                        `UPDATE "Transaction" SET "descriptionEmbedding" = '${vector}'::vector WHERE id = '${id}'`
                    )
                } catch (e) {
                    console.error("Failed to update embedding", e)
                }
            }
        })

        revalidatePath("/")
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: "Failed to update transaction" }
    }
}
