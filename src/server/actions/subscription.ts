"use server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ActionState } from "@/lib/types"
import { UserTier } from "@prisma/client"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

export async function upgradeToPro(): Promise<ActionState> {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: "Not authenticated" }

    try {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1500))

        await prisma.user.update({
            where: { id: session.user.id },
            data: { tier: "PRO" } // Manual string if enum not generated yet, but let's try enum first
        })

        revalidatePath("/pricing")
        revalidatePath("/settings")
        revalidatePath("/dashboard")

        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: "Payment simulation failed" }
    }
}

export async function cancelSubscription(): Promise<ActionState> {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: "Not authenticated" }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: { tier: "FREE" }
        })
        revalidatePath("/")
        return { success: true }
    } catch (e) {
        return { error: "Cancellation failed" }
    }
}
