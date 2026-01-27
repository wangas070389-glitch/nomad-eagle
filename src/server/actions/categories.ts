"use server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

export async function getCategories() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.householdId) return []

    const categories = await prisma.category.findMany({
        where: {
            OR: [
                { householdId: null }, // System defaults
                { householdId: session.user.householdId } // Custom
            ],
            isArchived: false
        },
        orderBy: { name: 'asc' }
    })

    return categories
}

type ActionState = {
    error?: string
    success?: boolean
}

export async function createCategoryAction(prevState: ActionState | null, formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.householdId) return { error: "Not authenticated" }

    const name = formData.get("name") as string
    const icon = formData.get("icon") as string || "🏷️"
    const type = (formData.get("type") as "INCOME" | "EXPENSE") || "EXPENSE"

    if (!name) return { error: "Name is required" }

    try {
        await prisma.category.create({
            data: {
                name,
                icon,
                type,
                householdId: session.user.householdId
            }
        })
        revalidatePath("/settings")
        revalidatePath("/plan")
        revalidatePath("/")
        return { success: true }
    } catch (e) {
        return { error: "Failed to create category" }
    }
}

export async function archiveCategory(id: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.householdId) return { error: "Not authenticated" }

    const category = await prisma.category.findUnique({
        where: { id },
    })

    if (!category || category.householdId !== session.user.householdId) {
        return { error: "Unauthorized or System Category" }
    }

    try {
        await prisma.category.update({
            where: { id },
            data: { isArchived: true }
        })
        revalidatePath("/settings")
        revalidatePath("/plan")
        return { success: true }
    } catch (e) {
        return { error: "Failed to archive category" }
    }
}
