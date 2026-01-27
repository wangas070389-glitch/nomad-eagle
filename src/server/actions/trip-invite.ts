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

    // Validate Token
    const invite = await prisma.tripInvite.findUnique({
        where: { token },
        include: { trip: true }
    })

    if (!invite) return { error: "Invalid invite link." }
    if (invite.status !== "PENDING") return { error: "This invite has already been used or expired." }
    if (new Date() > invite.expiresAt) {
        await prisma.tripInvite.update({ where: { id: invite.id }, data: { status: "EXPIRED" } })
        return { error: "Invite expired." }
    }

    // Check if user is already a member
    const existingMember = await prisma.tripMember.findUnique({
        where: { tripId_userId: { tripId: invite.tripId, userId: session.user.id } }
    })

    if (existingMember) {
        // Already joined
        return { success: true, tripId: invite.tripId }
    }

    try {
        // Add User to Trip
        await prisma.tripMember.create({
            data: {
                tripId: invite.tripId,
                userId: session.user.id,
                role: "GUEST"
            }
        })

        return { success: true, tripId: invite.tripId }
    } catch (e) {
        return { error: "Failed to join trip." }
    }
}
