"use server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Frequency } from "@prisma/client"
import { getServerSession } from "next-auth"
import { revalidatePath, revalidateTag } from "next/cache"

export async function addRecurringFlow(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.householdId) return { error: "Not authenticated" }

    const name = formData.get("name") as string
    const amount = Number(formData.get("amount"))
    const type = formData.get("type") as "INCOME" | "EXPENSE"
    const frequency = formData.get("frequency") as Frequency
    const startDate = new Date(formData.get("startDate") as string)

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
                householdId: session.user.householdId
            }
        })

        // revalidateTag(`forecast-household-${session.user.householdId}`)
        revalidatePath("/plan")
        revalidatePath("/")
        return { success: true }
    } catch (e) {
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

    if (!id || !name || !amount || !type || !frequency) {
        return { error: "Missing required fields" }
    }

    // Verify ownership
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
                startDate
            }
        })

        // revalidateTag(`forecast-household-${session.user.householdId}`)
        revalidatePath("/plan")
        revalidatePath("/")
        return { success: true }
    } catch (e) {
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

    // revalidateTag(`forecast-household-${session.user.householdId}`)
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
            // Remove limit if 0 or negative
            // Make sure to handle "not found" gracefully or use deleteMany
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
                        period: "MONTHLY" // Defaulting to monthly for now
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

        // revalidateTag(`forecast-household-${session.user.householdId}`)
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
        // revalidateTag(`forecast-household-${session.user.householdId}`)
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
                    { householdId: null }, // System
                    { householdId: session.user.householdId } // Custom
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
