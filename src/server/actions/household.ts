"use server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath, revalidateTag } from "next/cache"

import { ActionState } from "@/lib/types"

export async function generateInviteCode() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.householdId) return { error: "Not authenticated" }

    const householdId = session.user.householdId

    // Generate simple 6-char code (e.g. ABX-129)
    // Secure Fix (ADR 0007): High Entropy Code
    // Format: XXXX-XXXX-XXXX (12 chars total + dashes)
    const crypto = require("crypto")
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    const length = 12
    const randomBytes = crypto.randomBytes(length)

    let secureCode = ""
    for (let i = 0; i < length; i++) {
        const index = randomBytes[i] % chars.length
        secureCode += chars[index]
        if ((i + 1) % 4 === 0 && i !== length - 1) secureCode += "-"
    }

    const code = secureCode // e.g. "A9B2-X5Y1-8W3Z"

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

export async function createHousehold(prevState: ActionState, formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: "Not authenticated" }

    const name = formData.get("name") as string
    if (!name || name.length < 2) return { error: "Invalid household name" }

    try {
        const household = await prisma.household.create({
            data: {
                name,
                ownerId: session.user.id
            }
        })

        await prisma.user.update({
            where: { id: session.user.id },
            data: { householdId: household.id }
        })

        revalidatePath("/")
        return { success: true }
    } catch (e) {
        console.error("Failed to create household:", e)
        return { error: "Failed to create household" }
    }
}

const rateLimits = new Map<string, { attempts: number, lastAttempt: number }>()
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour
const MAX_ATTEMPTS = 5

export async function joinHousehold(prevStateOrCode: ActionState | string, maybeFormData?: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return { error: "Not authenticated" }

    const ip = session.user.id // In a real app use actual IP or reliable identifier, fallback to user ID for MVP rate limiting
    const now = Date.now()
    const rateLimit = rateLimits.get(ip)

    if (rateLimit) {
        if (now - rateLimit.lastAttempt < RATE_LIMIT_WINDOW) {
            if (rateLimit.attempts >= MAX_ATTEMPTS) {
                return { error: "Too many attempts. Please try again later." }
            }
            rateLimit.attempts++
            rateLimit.lastAttempt = now
        } else {
            rateLimits.set(ip, { attempts: 1, lastAttempt: now })
        }
    } else {
        rateLimits.set(ip, { attempts: 1, lastAttempt: now })
    }

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
    })

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
