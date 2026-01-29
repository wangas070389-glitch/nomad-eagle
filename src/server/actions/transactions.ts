"use server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TransactionType } from "@prisma/client"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { ActionState } from "@/lib/types"

const createTransactionSchema = z.object({
    amount: z.number().positive(),
    date: z.string().transform((str) => new Date(str)),
    description: z.string().max(100),
    type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
    categoryId: z.string().optional(),
    accountId: z.string(),
    spentByUserId: z.string()
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
        accountId: formData.get("accountId"),
        spentByUserId: formData.get("spentByUserId") || session.user.id
    })

    if (!parseResult.success) {
        return { error: "Invalid input: " + parseResult.error.issues.map(i => i.message).join(", ") }
    }

    const { amount, date, description, type, categoryId, accountId, spentByUserId } = parseResult.data

    // Validate Category if provided
    if (categoryId) {
        const category = await prisma.category.findUnique({ where: { id: categoryId } })
        if (!category) return { error: "Invalid category" }
        // Optional: strict check if category belongs to household or system
        if (category.householdId && category.householdId !== session.user.householdId) {
            return { error: "Unauthorized category" }
        }
    }

    // Logic: Verify Account Access
    // If accountId is joint (ownerId=null) -> OK
    // If accountId is personal -> Must be ownerId=session.user.id
    const account = await prisma.account.findUnique({ where: { id: accountId } })
    if (!account) return { error: "Account not found" }

    if (account.ownerId && account.ownerId !== session.user.id) {
        return { error: "Unauthorized access to this account" }
    }

    // Atomic Transaction: Create Record + Update Balance
    try {
        await prisma.$transaction(async (tx) => {
            // 1. Create Transaction
            await tx.transaction.create({
                data: {
                    amount,
                    date,
                    description,
                    type,
                    categoryId,
                    accountId,
                    currency: account.currency,
                    spentByUserId,
                }
            })

            // 2. Update Balance
            // If Income -> Add. If Expense -> Subtract.
            const balanceChange = type === "INCOME" ? amount : -amount

            await tx.account.update({
                where: { id: accountId },
                data: {
                    balance: { increment: balanceChange }
                }
            })
        })

        revalidatePath("/dashboard")
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: "Transaction failed" }
    }
}

export async function getTransactions(page: number = 1, pageSize: number = 50) {
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
                    email: true
                }
            }
        },
        orderBy: {
            date: 'desc'
        },
        skip: (page - 1) * pageSize,
        take: pageSize
    })

    return transactions.map(tx => ({
        ...tx,
        amount: Number(tx.amount)
    }))
}
