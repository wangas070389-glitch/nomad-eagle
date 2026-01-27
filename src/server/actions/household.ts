"use server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath, revalidateTag } from "next/cache"

export async function generateInviteCode() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.householdId) return { error: "Not authenticated" }

    const householdId = session.user.householdId

    // Generate simple 6-char code (e.g. ABX-129)
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const nums = "0123456789"
    let code = ""
    for (let i = 0; i < 3; i++) code += chars.charAt(Math.floor(Math.random() * chars.length))
    code += "-"
    for (let i = 0; i < 3; i++) code += nums.charAt(Math.floor(Math.random() * nums.length))

    try {
        await prisma.household.update({
            where: { id: householdId },
            data: { inviteCode: code }
        })
        revalidatePath("/settings")
        return { success: true, code }
    } catch (e) {
        return { error: "Failed to generate code" }
    }
}

export async function createHousehold(prevState: any, formData: FormData) {
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

export async function joinHousehold(prevStateOrCode: any, maybeFormData?: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return { error: "Not authenticated" }

    let code: string
    if (maybeFormData instanceof FormData) {
        // Called from useActionState (OnboardingForms)
        code = maybeFormData.get("code") as string || maybeFormData.get("householdId") as string
    } else {
        // Called directly (HouseholdSettings)
        code = prevStateOrCode as string
    }

    if (!code || code.length < 3) return { error: "Invalid code" }

    const household = await prisma.household.findUnique({
        where: { inviteCode: code.toUpperCase() }
    } as any) as any

    if (!household) {
        // Fallback check if they entered the ID directly (legacy/manual)
        const byId = await prisma.household.findUnique({ where: { id: code } })
        if (!byId) return { error: "Invalid invite code or ID" }

        if (byId.id === session.user.householdId) return { error: "You are already in this household" }

        await prisma.user.update({
            where: { id: session.user.id },
            data: { householdId: byId.id }
        })
        revalidatePath("/")
        return { success: true, name: byId.name }
    }

    if (household.id === session.user.householdId) return { error: "You are already in this household" }

    await prisma.user.update({
        where: { id: session.user.id },
        data: { householdId: household.id }
    })

    revalidatePath("/")
    return { success: true, name: household.name }
}

export async function getHouseholdMembers() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.householdId) return []

    const users = await prisma.user.findMany({
        where: { householdId: session.user.householdId },
        select: { id: true, name: true, email: true }
    })

    return users
}
