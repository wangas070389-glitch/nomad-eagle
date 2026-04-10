"use server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { Decimal } from "decimal.js"
import { container } from "../domain-container"
import { getCategories } from "./categories"

export { getCategories } // For backward compatibility with dashboard imports

export interface ManualReconciliationInput {
    amount: number
    date: string
    description: string
    plannedItemId: string
    type: 'BUDGET_LIMIT' | 'RECURRING_FLOW'
    accountId: string
}

/**
 * High-Friction Transaction Creation.
 * Enforces a real-time logical handshake between manual entries and pre-authorized boundaries.
 */
export async function reconcileManualTransaction(input: ManualReconciliationInput) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.householdId) return { error: "Not authenticated" }

    const householdId = session.user.householdId

    try {
        // Enforce Relational Integrity via Domain Service
        const transactionId = await container.transactionService.execute({
            amount: new Decimal(input.amount),
            date: new Date(input.date),
            description: input.description,
            type: 'EXPENSE',
            householdId,
            userId: session.user.id,
            accountId: input.accountId,
            // The Deterministic Handshake
            budgetLimitId: input.type === 'BUDGET_LIMIT' ? input.plannedItemId : undefined,
            recurringFlowId: input.type === 'RECURRING_FLOW' ? input.plannedItemId : undefined,
        })

        revalidatePath("/plan")
        revalidatePath("/")
        return { success: true, id: transactionId }
    } catch (err) {
        console.error("Manual Reconciliation Failure:", err)
        return { error: "Failed to create high-friction transaction" }
    }
}

/**
 * Legacy Support: Fetch transactions for the dashboard
 * Serializes Prisma Decimals for Safe Client Component consumption.
 */
export async function getTransactions(page: number = 1, pageSize: number = 20, skipCount: number = 0) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.householdId) return []

    const txs = await prisma.transaction.findMany({
        where: { householdId: session.user.householdId },
        include: { 
            category: true, 
            account: true, 
            spentBy: true,
            recurringFlow: { select: { name: true } }
        },
        orderBy: { date: 'desc' },
        skip: skipCount || (page - 1) * pageSize,
        take: pageSize
    })

    // Serialize Decimals and Dates for RSC transport
    return txs.map(tx => ({
        ...tx,
        amount: Number(tx.amount),
        account: tx.account ? { ...tx.account, balance: Number(tx.account.balance) } : null,
        category: tx.category ? { ...tx.category } : null, // Ensure category is spread
        spentBy: tx.spentBy ? { ...tx.spentBy } : null,
        recurringFlow: (tx as any).recurringFlow ? { ...(tx as any).recurringFlow } : null,
    }))
}

/**
 * Legacy Support: Standard Transaction Creation (Non-handshaked)
 * Updated for Next.js 15 'useActionState' compatibility.
 */
export async function createTransaction(prevState: any, input: FormData | any) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.householdId) return { error: "Not authenticated" }

    let amount, date, description, categoryId, accountId, type;

    // Support both useActionState (prevState, formData) and direct calls (dataObject)
    let actualData = input;
    if (!input && prevState instanceof FormData) {
        // This handles cases where useActionState might wrap the action differently
        actualData = prevState;
    }

    if (actualData instanceof FormData) {
        amount = actualData.get("amount") as string
        date = actualData.get("date") as string
        description = actualData.get("description") as string
        categoryId = actualData.get("categoryId") as string
        accountId = actualData.get("accountId") as string
        type = (actualData.get("type") as string) || 'EXPENSE'
    } else {
        // Fallback for cases where it's called with a plain object as the 2nd arg
        const data = actualData;
        amount = data.amount
        date = data.date
        description = data.description
        categoryId = data.categoryId
        accountId = data.accountId
        type = data.type || 'EXPENSE'
    }

    const recurringFlowId = actualData instanceof FormData ? (actualData.get("recurringFlowId") as string) : (actualData as any).recurringFlowId
    const budgetLimitId = actualData instanceof FormData ? (actualData.get("budgetLimitId") as string) : (actualData as any).budgetLimitId
    const finalCategoryId = actualData instanceof FormData ? (actualData.get("categoryId") as string) : (actualData as any).categoryId

    try {
        // Use Domain Service for Atomic Execution & Ledgering
        const transactionId = await container.transactionService.execute({
            amount: new Decimal(amount),
            date: new Date(date),
            description,
            type: type as any,
            householdId: session.user.householdId,
            userId: session.user.id,
            accountId,
            categoryId: finalCategoryId || undefined,
            recurringFlowId: recurringFlowId || undefined,
            budgetLimitId: budgetLimitId || undefined
        })

        revalidatePath("/")
        revalidatePath("/plan")
        return { success: true, id: transactionId }
    } catch (e) {
        console.error("Create Transaction Error:", e)
        return { error: "Failed to create transaction and update balance" }
    }
}

/**
 * Legacy Support: Seed Default Categories
 */
export async function seedCategories(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.householdId) return { error: "Not authenticated" }

    const defaults = [
        { name: "Housing", icon: "🏠", type: "EXPENSE" as const },
        { name: "Food", icon: "🍱", type: "EXPENSE" as const },
        { name: "Transport", icon: "🚗", type: "EXPENSE" as const },
        { name: "Salary", icon: "💰", type: "INCOME" as const }
    ]

    try {
        await Promise.all(defaults.map(d => 
            prisma.category.create({
                data: { 
                    name: d.name,
                    icon: d.icon,
                    type: d.type as any, // Cast to any to bypass stale prisma client types
                    householdId: session.user.householdId 
                }
            })
        ))
        revalidatePath("/")
        return { success: true }
    } catch (e) {
        return { error: "Seeding failed" }
    }
}
