"use server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TransactionType } from "@prisma/client"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { ActionState } from "@/lib/types"
import { generateEmbedding } from "@/lib/embedding"

const createTransactionSchema = z.object({
    amount: z.number().positive(),
    date: z.string().transform((str) => new Date(str)),
    description: z.string().max(100),
    type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
    categoryId: z.string().optional(),
    accountId: z.string().optional(),
    fromAccountId: z.string().optional(),
    toAccountId: z.string().optional(),
    spentByUserId: z.string()
}).refine(data => {
    if (data.type === 'TRANSFER') {
        return !!data.fromAccountId && !!data.toAccountId && data.fromAccountId !== data.toAccountId
    }
    return !!data.accountId
}, {
    message: "Invalid account selection for transaction type"
})

export async function seedCategories(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.householdId) return { error: "No household" }

    const defaults = [
        { name: "Housing", icon: "🏠", type: "EXPENSE" },
        { name: "Groceries", icon: "🛒", type: "EXPENSE" },
        { name: "Transport", icon: "🚗", type: "EXPENSE" },
        { name: "Dining Out", icon: "🍔", type: "EXPENSE" },
        { name: "Retirement/Afore", icon: "👴", type: "EXPENSE" }, // Or Investment, but tracking as expense flow?
        { name: "Salary", icon: "💰", type: "INCOME" },
        { name: "Investments", icon: "📈", type: "EXPENSE" },
    ]

    // Check existing
    const count = await prisma.category.count({ where: { householdId: session.user.householdId } })
    if (count > 0) return { success: true, message: "Already seeded" }

    await prisma.category.createMany({
        data: defaults.map(d => ({
            ...d,
            type: d.type as TransactionType,
            householdId: session.user.householdId!
        }))
    })

    return { success: true }
}

export async function getCategories() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.householdId) return []

    return await prisma.category.findMany({
        where: {
            OR: [
                { householdId: null }, // System
                { householdId: session.user.householdId } // Custom
            ],
            isArchived: false
        },
        orderBy: { name: 'asc' }
    })
}



export async function createTransaction(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session.user.householdId) return { error: "Not authenticated" }

    const parseResult = createTransactionSchema.safeParse({
        amount: Number(formData.get("amount")),
        date: formData.get("date"),
        description: formData.get("description"),
        type: formData.get("type"),
        categoryId: formData.get("categoryId") || undefined,
        accountId: formData.get("accountId") || undefined,
        fromAccountId: formData.get("fromAccountId") || undefined,
        toAccountId: formData.get("toAccountId") || undefined,
        spentByUserId: formData.get("spentByUserId") || session.user.id
    })

    if (!parseResult.success) {
        return { error: "Invalid input: " + parseResult.error.issues.map(i => i.message).join(", ") }
    }

    const { amount, date, description, type, categoryId, accountId, fromAccountId, toAccountId, spentByUserId } = parseResult.data

    // Common validations
    if (categoryId) {
        const category = await prisma.category.findUnique({ where: { id: categoryId } })
        if (!category) return { error: "Invalid category" }
        if (category.householdId && category.householdId !== session.user.householdId) {
            return { error: "Unauthorized category" }
        }
    }

    try {
        if (type === "TRANSFER") {
            const fromAccount = await prisma.account.findUnique({ where: { id: fromAccountId } })
            const toAccount = await prisma.account.findUnique({ where: { id: toAccountId } })

            if (!fromAccount || !toAccount) return { error: "One or both accounts not found" }

            // Check access
            if (fromAccount.householdId !== session.user.householdId ||
                toAccount.householdId !== session.user.householdId) {
                return { error: "Unauthorized: Account belongs to another household" }
            }

            // Personal ownership check (Debit Authority Only)
            // Rule Update (ADR 016 Addendum): "Trusted Household" Model.
            // We allow any household member to log a transfer FROM any account in the household.
            // This enables "Admin" users (e.g. wife) to log transfers for their partners.
            // effectively removing the blocking check:
            // if (fromAccount.ownerId && fromAccount.ownerId !== session.user.id) ...

            const transactionResult = await prisma.$transaction(async (tx) => {
                // 1. Withdrawal from Source
                const tx1 = await tx.transaction.create({
                    data: {
                        amount: -amount, // Negative for outflow
                        date,
                        description: `Transfer to ${toAccount.name}: ${description}`,
                        type: "TRANSFER",
                        categoryId,
                        accountId: fromAccountId,
                        currency: fromAccount.currency,
                        spentByUserId,
                        householdId: session.user.householdId
                    }
                })

                // Embedding generation moved outside transaction to prevent 25P02 aborts

                await tx.account.update({
                    where: { id: fromAccountId },
                    data: { balance: { decrement: amount } }
                })

                // 2. Deposit to Destination
                const tx2 = await tx.transaction.create({
                    data: {
                        amount: amount, // Positive for inflow
                        date,
                        description: `Transfer from ${fromAccount.name}: ${description}`,
                        type: "TRANSFER",
                        categoryId,
                        accountId: toAccountId,
                        currency: toAccount.currency,
                        spentByUserId,
                        householdId: session.user.householdId
                    }
                })

                // Embedding generation moved outside transaction

                await tx.account.update({
                    where: { id: toAccountId },
                    data: { balance: { increment: amount } }
                })
                return { tx1Id: tx1.id, tx2Id: tx2.id }
            })

            // Async Embedding Generation (Fire and Forget or Await)
            // We await it here to ensure UI shows it if needed, but in separate scope so it doesn't fail the transfer.
            const { tx1Id, tx2Id } = transactionResult

            try {
                const embedding1 = await generateEmbedding(`Transfer to ${toAccount.name}: ${description}`)
                await prisma.$executeRawUnsafe(
                    `UPDATE "Transaction" SET "descriptionEmbedding" = '${JSON.stringify(embedding1)}'::vector WHERE id = '${tx1Id}'`
                )
            } catch (e) { console.error("Embedding 1 failed", e) }

            try {
                const embedding2 = await generateEmbedding(`Transfer from ${fromAccount.name}: ${description}`)
                await prisma.$executeRawUnsafe(
                    `UPDATE "Transaction" SET "descriptionEmbedding" = '${JSON.stringify(embedding2)}'::vector WHERE id = '${tx2Id}'`
                )
            } catch (e) { console.error("Embedding 2 failed", e) }

        } else {
            // Standard Income/Expense
            const account = await prisma.account.findUnique({ where: { id: accountId } })
            if (!account) return { error: "Account not found" }

            // Security Fix (ADR 0005): Enforce Household Isolation
            if (account.householdId !== session.user.householdId) {
                return { error: "Unauthorized access to this account" }
            }

            if (account.ownerId && account.ownerId !== session.user.id) {
                return { error: "Unauthorized access to this account" }
            }

            const balanceChange = type === "INCOME" ? amount : -amount

            await prisma.$transaction(async (tx) => {
                const newTx = await tx.transaction.create({
                    data: {
                        amount,
                        date,
                        description,
                        type,
                        categoryId,
                        accountId,
                        currency: account.currency,
                        spentByUserId,
                        householdId: session.user.householdId
                    }
                })

                try {
                    const embedding = await generateEmbedding(description)
                    const vector = `[${embedding.join(",")}]`
                    await tx.$executeRawUnsafe(
                        `UPDATE "Transaction" SET "descriptionEmbedding" = '${vector}'::vector WHERE id = '${newTx.id}'`
                    )
                } catch (e) {
                    console.error("Failed to generate embedding for newTx", e)
                }

                await tx.account.update({
                    where: { id: accountId },
                    data: { balance: { increment: balanceChange } }
                })
            })
        }

        revalidatePath("/dashboard")
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: e instanceof Error ? e.message : "Transaction failed" }
    }
}

// allow explicit skip, or fallback to page calc
export async function getTransactions(page: number = 1, pageSize: number = 50, skip?: number) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.householdId) return []

    // Fetch transactions for all accounts visible to user
    // Visible accounts = Joint OR Personal(Me)
    // We can filter by Accounts.

    const accounts = await prisma.account.findMany({
        where: {
            householdId: session.user.householdId
        },
        select: { id: true }
    })

    const accountIds = accounts.map(a => a.id)

    const transactions = await prisma.transaction.findMany({
        where: {
            accountId: { in: accountIds }
        },
        include: {
            category: true,
            account: {
                select: {
                    id: true,
                    name: true,
                    currency: true,
                    ownerId: true
                }
            },
            spentBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true
                }
            }
        },
        orderBy: {
            date: 'desc'
        },
        skip: skip !== undefined ? skip : (page - 1) * pageSize,
        take: pageSize
    })

    return transactions.map(tx => ({
        ...tx,
        amount: Number(tx.amount)
    }))
}
