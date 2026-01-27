"use server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function settleTrip(tripId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: "Not authenticated" }

    // Verify Owner
    const member = await prisma.tripMember.findUnique({
        where: { tripId_userId: { tripId, userId: session.user.id } }
    })

    if (!member || member.role !== "OWNER") {
        return { error: "Only the owner can settle a trip." }
    }

    try {
        await prisma.trip.update({
            where: { id: tripId },
            data: { status: "COMPLETED" }
        })
        revalidatePath(`/trips/${tripId}`)
        return { success: true }
    } catch (e) {
        return { error: "Failed to settle trip" }
    }
}

export async function deleteTrip(tripId: string, deleteTransactions: boolean) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: "Not authenticated" }

    // Verify Owner
    const member = await prisma.tripMember.findUnique({
        where: { tripId_userId: { tripId, userId: session.user.id } }
    })

    if (!member || member.role !== "OWNER") {
        return { error: "Only the owner can delete a trip." }
    }

    try {
        if (deleteTransactions) {
            // Delete associated transactions (Refund money / Cleanup)
            await prisma.transaction.deleteMany({
                where: { tripId }
            })
        } else {
            // Keep transactions, just unlink them
            await prisma.transaction.updateMany({
                where: { tripId },
                data: { tripId: null }
            })
        }

        await prisma.trip.delete({
            where: { id: tripId }
        })

        revalidatePath("/trips")
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: "Failed to delete trip" }
    }
}
