
"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function rotatePassword(formData: FormData) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user?.email) {
            throw new Error("Unauthorized access detected.")
        }

        const currentPassword = formData.get("currentPassword") as string
        const newPassword = formData.get("newPassword") as string
        const confirmPassword = formData.get("confirmPassword") as string // Kept for server-side validation sanity

        if (!newPassword || newPassword.length < 8) {
            return { error: "New password must be at least 8 characters long." }
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return { error: "User entity not found." }
        }

        // If user has a password set, verify it
        if (user.password) {
            const isValid = await bcrypt.compare(currentPassword, user.password)
            if (!isValid) {
                return { error: "Current password is incorrect." }
            }
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12)

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        })

        revalidatePath("/profile")
        return { success: "Security protocol updated. Credentials rotated." }

    } catch (error) {
        console.error("Encryption Error:", error)
        // Return a clean string to avoid serialization issues
        return { error: "Server refused request. Please verify connection." }
    }
}
