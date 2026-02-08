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
            // Rule: You must own the SOURCE account (or it must be Joint/System).
            // You do NOT need to own the DESTINATION account (Open Deposit).
            if (fromAccount.ownerId && fromAccount.ownerId !== session.user.id) {
                return { error: "Unauthorized: You do not own the source account" }
            }

            await prisma.$transaction(async (tx) => {
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

                // Generate Embedding (Async - ideally queued, but inline for MVP)
                try {
                    const embedding = await generateEmbedding(`Transfer to ${toAccount.name}: ${description}`)
                    const vector = `[${embedding.join(",")}]`
                    await tx.$executeRawUnsafe(
                        `UPDATE "Transaction" SET "descriptionEmbedding" = '${vector}'::vector WHERE id = '${tx1.id}'`
                    )
                } catch (e) {
                    console.error("Failed to generate embedding for tx1", e)
                }

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

                try {
                    const embedding = await generateEmbedding(`Transfer from ${fromAccount.name}: ${description}`)
                    const vector = `[${embedding.join(",")}]`
                    await tx.$executeRawUnsafe(
                        `UPDATE "Transaction" SET "descriptionEmbedding" = '${vector}'::vector WHERE id = '${tx2.id}'`
                    )
                } catch (e) {
                    console.error("Failed to generate embedding for tx2", e)
                }

                await tx.account.update({
                    where: { id: toAccountId },
                    data: { balance: { increment: amount } }
                })
            })

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
        return { error: "Transaction failed" }
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
