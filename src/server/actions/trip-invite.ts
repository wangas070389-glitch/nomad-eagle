"use server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { randomBytes } from "crypto"

export async function createInviteToken(tripId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: "Not authenticated" }

    // Verify Owner
    const member = await prisma.tripMember.findUnique({
        where: { tripId_userId: { tripId, userId: session.user.id } }
    })

    if (!member || member.role !== "OWNER") {
        return { error: "Only the owner can invite guests." }
    }

    // Generate secure token
    const token = randomBytes(16).toString('hex') // 32 chars
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 days

    try {
        await prisma.tripInvite.create({
            data: {
                tripId,
                token,
                expiresAt,
                status: "PENDING"
            }
        })

        return { success: true, token }
    } catch (e) {
        return { error: "Failed to create invite" }
    }
}

export async function joinTrip(token: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: "Not authenticated" }

    try {
        const result = await prisma.$transaction(async (tx) => {
            // Re-fetch and validate the invite inside the transaction
            const invite = await tx.tripInvite.findUnique({
                where: { token },
                include: { trip: true }
            })

            if (!invite) return { error: "Invalid invite link." }
            if (invite.status !== "PENDING") return { error: "This invite has already been used or expired." }
            if (new Date() > invite.expiresAt) {
                await tx.tripInvite.update({ where: { id: invite.id }, data: { status: "EXPIRED" } })
                return { error: "Invite expired." }
            }

            // Check if user is already a member
            const existingMember = await tx.tripMember.findUnique({
                where: { tripId_userId: { tripId: invite.tripId, userId: session.user.id } }
            })

            if (existingMember) {
                // Already joined, but if they used the token, we shouldn't necessarily burn it unless we want to.
                // However, the token is not consumed if they were already a member. Let's just return success.
                return { success: true, tripId: invite.tripId }
            }

            // Add User to Trip
            await tx.tripMember.create({
                data: {
                    tripId: invite.tripId,
                    userId: session.user.id,
                    role: "GUEST"
                }
            })

            // Invalidate the invite token by changing status to ACCEPTED
            await tx.tripInvite.update({
                where: { id: invite.id },
                data: { status: "ACCEPTED" }
            })

            return { success: true, tripId: invite.tripId }
        })

        return result
    } catch (e: any) {
        return { error: "Failed to join trip." }
    }
}
