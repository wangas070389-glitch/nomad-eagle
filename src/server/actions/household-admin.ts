"use server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

export async function removeMember(targetUserId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.householdId) return { error: "Not authenticated" }

    // Verify currentUser is the Owner
    const household = await prisma.household.findUnique({
        where: { id: session.user.householdId },
        select: { ownerId: true }
    })

    if (!household || household.ownerId !== session.user.id) {
        return { error: "Unauthorized: Only the household owner can remove members." }
    }

    if (targetUserId === session.user.id) {
        return { error: "You cannot remove yourself. Delete the household instead." }
    }

    try {
        // Remove from household
        await prisma.user.update({
            where: { id: targetUserId },
            data: { householdId: null }
        })

        revalidatePath("/settings")
        revalidatePath("/")
        return { success: true }
    } catch (e) {
        return { error: "Failed to remove member." }
    }
}
