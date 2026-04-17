"use server"

import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"

import { createHousehold } from "./household"

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain one uppercase letter")
        .regex(/[0-9]/, "Must contain one number")
        .regex(/[^a-zA-Z0-9]/, "Must contain one special character"),
    inviteCode: z.string().optional()
})

export type AuthState = {
    error?: string
    success?: boolean
} | null

export async function registerUser(prevState: AuthState, formData: FormData): Promise<AuthState> {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const inviteCode = formData.get("inviteCode") as string

    // 1. The Velvet Rope: Check Capacity
    const pendingCount = await prisma.user.count({
        where: { status: 'PENDING' }
    })

    if (pendingCount >= 8) {
        return { error: "System at capacity. The waiting list is currently capped at 8 slots." }
    }

    const parse = registerSchema.safeParse({ email, password, inviteCode })

    if (!parse.success) {
        return { error: parse.error.issues[0].message }
    }

    const { data } = parse

    // Check existing
    const existing = await prisma.user.findUnique({
        where: { email: data.email }
    })

    if (existing) {
        return { error: "User already exists" }
    }

    try {
        // Prepare household connection
        let householdId: string | null = null
        let householdName = ""

        if (data.inviteCode) {
            const household = await prisma.household.findUnique({
                where: { inviteCode: data.inviteCode }
            })
            if (!household) return { error: "Invalid invite code" }
            householdId = household.id
            householdName = household.name
        }

        // Create User
        const hashedPassword = await bcrypt.hash(data.password, 10)

        const newUser = await prisma.user.create({
            data: {
                email: data.email,
                name: data.email.split("@")[0],
                password: hashedPassword,
                householdId // Connect if we have it
            }
        })

        // If no invite code, create new household
        if (!householdId) {
            const newHousehold = await prisma.household.create({
                data: {
                    name: `${newUser.name}'s Household`,
                    ownerId: newUser.id
                }
            })

            await prisma.user.update({
                where: { id: newUser.id },
                data: { householdId: newHousehold.id }
            })
        }

        return { success: true }

    } catch (e) {
        console.error(e)
        return { error: "Registration failed" }
    }
}
