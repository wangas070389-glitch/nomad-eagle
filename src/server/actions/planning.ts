"use server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Frequency } from "@prisma/client"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

export async function addRecurringFlow(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.householdId) return { error: "Not authenticated" }

    const name = formData.get("name") as string
    const amount = Number(formData.get("amount"))
    const type = formData.get("type") as "INCOME" | "EXPENSE"
    const frequency = formData.get("frequency") as Frequency
    const startDate = new Date(formData.get("startDate") as string)
    const bucket = (formData.get("bucket") as any) || "VARIABLE_ALLOCATION"

    if (bucket !== "CAPITAL_INFLOW" && bucket !== "FIXED_OBLIGATION" && bucket !== "VARIABLE_ALLOCATION") {
        return { error: "Invalid bucket. Must be CAPITAL_INFLOW, FIXED_OBLIGATION, or VARIABLE_ALLOCATION" }
    }

    const tagsRaw = formData.get("tags") as string
    const tags = tagsRaw ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean) : []

    if (!name || !amount || !type || !frequency) {
        return { error: "Missing required fields" }
    }

    try {
        await prisma.recurringFlow.create({
            data: {
                name,
                amount,
                type,
                frequency,
                startDate,
                householdId: session.user.householdId,
                bucket,
                tags
            } as any
        })

        revalidatePath("/plan")
        revalidatePath("/")
        return { success: true }
    } catch (e) {
        console.error("Failed to add flow:", e)
        return { error: "Failed to create flow" }
    }
}

export async function updateRecurringFlow(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.householdId) return { error: "Not authenticated" }

    const id = formData.get("id") as string
    const name = formData.get("name") as string
    const amount = Number(formData.get("amount"))
    const type = formData.get("type") as "INCOME" | "EXPENSE"
    const frequency = formData.get("frequency") as Frequency
    const startDate = new Date(formData.get("startDate") as string)
    const bucket = (formData.get("bucket") as any) || "VARIABLE_ALLOCATION"

    if (bucket !== "CAPITAL_INFLOW" && bucket !== "FIXED_OBLIGATION" && bucket !== "VARIABLE_ALLOCATION") {
        return { error: "Invalid bucket. Must be CAPITAL_INFLOW, FIXED_OBLIGATION, or VARIABLE_ALLOCATION" }
    }

    const tagsRaw = formData.get("tags") as string
    const tags = tagsRaw ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean) : []

    if (!id || !name || !amount || !type || !frequency) {
        return { error: "Missing required fields" }
    }

    const existing = await prisma.recurringFlow.findUnique({ where: { id } })
    if (!existing || existing.householdId !== session.user.householdId) {
        return { error: "Unauthorized" }
    }

    try {
        await prisma.recurringFlow.update({
            where: { id },
            data: {
                name,
                amount,
                type,
                frequency,
                startDate,
                bucket,
                tags
            } as any
        })

        revalidatePath("/plan")
        revalidatePath("/")
        return { success: true }
    } catch (e) {
        console.error("Failed to update flow:", e)
        return { error: "Failed to update flow" }
    }
}

export async function deleteRecurringFlow(id: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.householdId) return

    const existing = await prisma.recurringFlow.findUnique({ where: { id } })
    if (!existing || existing.householdId !== session.user.householdId) {
        return
    }

    await prisma.recurringFlow.delete({
        where: { id }
    })

    revalidatePath("/plan")
    revalidatePath("/")
}

export async function setBudgetLimit(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.householdId) return { error: "Not authenticated" }

    const categoryId = formData.get("categoryId") as string
    const amount = Number(formData.get("amount"))

    if (!categoryId) return { error: "Missing category" }

    try {
        if (amount <= 0) {
            await prisma.budgetLimit.deleteMany({
                where: {
                    categoryId,
                    householdId: session.user.householdId
                }
            })
        } else {
            await prisma.budgetLimit.upsert({
                where: {
                    categoryId_period: {
                        categoryId,
                        period: "MONTHLY"
                    }
                },
                update: { amount },
                create: {
                    categoryId,
                    amount,
                    householdId: session.user.householdId,
                    period: "MONTHLY"
                }
            })
        }

        revalidatePath("/plan")
        revalidatePath("/")
        return { success: true }
    } catch (e) {
        return { error: "Failed to set budget limit" }
    }
}

export async function toggleFlowActive(id: string, isActive: boolean) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.householdId) return { error: "Unauthorized" }

    try {
        await prisma.recurringFlow.update({
            where: { id },
            data: { isActive }
        })
        revalidatePath("/plan")
        revalidatePath("/")
        return { success: true }
    } catch (e) {
        return { error: "Failed to toggle status" }
    }
}

export async function getPlanningData() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.householdId) return { flows: [], limits: [], categories: [] }

    const [flows, limits, categories] = await Promise.all([
        prisma.recurringFlow.findMany({
            where: { householdId: session.user.householdId }
        }),
        prisma.budgetLimit.findMany({
            where: { householdId: session.user.householdId }
        }),
        prisma.category.findMany({
            where: {
                OR: [
                    { householdId: null },
                    { householdId: session.user.householdId }
                ],
                isArchived: false
            },
            orderBy: { name: 'asc' }
        })
    ])

    return {
        flows: flows.map(f => ({ ...f, amount: Number(f.amount) })),
        limits: limits.map(l => ({ ...l, amount: Number(l.amount) })),
        categories
    }
}
