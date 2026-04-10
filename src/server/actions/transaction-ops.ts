"use server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { container } from "../domain-container"
import { Decimal } from "decimal.js"
import { generateEmbedding } from "@/lib/embedding"
import { ActionState } from "@/lib/types"

export async function deleteTransaction(id: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.householdId) return { error: "Not authenticated" }

    try {
        await container.transactionService.delete(id, session.user.householdId)
        
        revalidatePath("/")
        revalidatePath("/plan")
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: e instanceof Error ? e.message : "Failed to delete transaction" }
    }
}

export async function updateTransaction(id: string, prevState: ActionState, formData: FormData): Promise<ActionState> {
    const session = await getServerSession(authOptions)
    if (!session?.user?.householdId) return { error: "Not authenticated" }

    const amountStr = formData.get("amount") as string
    const dateStr = formData.get("date") as string
    const description = formData.get("description") as string
    const type = formData.get("type") as "INCOME" | "EXPENSE"
    const categoryId = formData.get("categoryId") as string
    const accountId = formData.get("accountId") as string
    const spentByUserId = formData.get("spentByUserId") as string || session.user.id
    const recurringFlowId = formData.get("recurringFlowId") as string
    const budgetLimitId = formData.get("budgetLimitId") as string

    try {
        const transactionId = await container.transactionService.update(id, {
            date: new Date(dateStr),
            amount: new Decimal(amountStr),
            description,
            type,
            accountId,
            categoryId,
            householdId: session.user.householdId,
            userId: spentByUserId,
            recurringFlowId: recurringFlowId || undefined,
            budgetLimitId: budgetLimitId || undefined
        })

        revalidatePath("/")
        revalidatePath("/plan")
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: e instanceof Error ? e.message : "Failed to update transaction" }
    }
}
