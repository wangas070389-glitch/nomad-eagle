"use server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ActionState } from "@/lib/types"
import { Currency } from "@prisma/client"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const updateProfileSchema = z.object({
    displayName: z.string().max(50).optional(),
    avatarUrl: z.string().url().or(z.literal("")).optional(),
    jobTitle: z.string().max(50).optional(),
    currency: z.enum(["USD", "MXN"]).optional()
})

export async function updateUserProfile(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: "Not authenticated" }

    const parse = updateProfileSchema.safeParse({
        displayName: formData.get("displayName"),
        avatarUrl: formData.get("avatarUrl"),
        jobTitle: formData.get("jobTitle"),
        currency: formData.get("currency")
    })

    if (!parse.success) return { error: "Invalid data" }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: parse.data
        })
        revalidatePath("/settings")
        return { success: true }
    } catch (e) {
        return { error: "Failed to update profile" }
    }
}

const addIncomeSchema = z.object({
    employer: z.string().min(1),
    title: z.string().min(1),
    amount: z.number().positive(),
    currency: z.enum(["USD", "MXN"]),
    startDate: z.string().transform(str => new Date(str)),
    endDate: z.string().optional().transform(str => str ? new Date(str) : null)
})

export async function addIncomeRecord(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: "Not authenticated" }

    const parse = addIncomeSchema.safeParse({
        employer: formData.get("employer"),
        title: formData.get("title"),
        amount: Number(formData.get("amount")),
        currency: formData.get("currency"),
        startDate: formData.get("startDate"),
        endDate: formData.get("endDate") || undefined
    })

    if (!parse.success) return { error: "Invalid input" }

    try {
        await prisma.incomeHistory.create({
            data: {
                ...parse.data,
                userId: session.user.id
            }
        })
        revalidatePath("/settings")
        return { success: true }
    } catch (e) {
        return { error: "Failed to add record" }
    }
}

export async function deleteIncomeRecord(id: string): Promise<ActionState> {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: "Not authenticated" }

    try {
        const record = await prisma.incomeHistory.findUnique({ where: { id } })
        if (!record || record.userId !== session.user.id) return { error: "Unauthorized" }

        await prisma.incomeHistory.delete({ where: { id } })
        revalidatePath("/settings")
        return { success: true }
    } catch (e) {
        return { error: "Failed to delete" }
    }
}
