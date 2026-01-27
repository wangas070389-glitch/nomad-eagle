"use server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

export async function updateProfile(data: { displayName: string, currency: string }) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return { error: "Not authenticated" }
    }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                displayName: data.displayName,
                currency: data.currency
            }
        })

        revalidatePath("/")
        revalidatePath("/profile")
        return { success: true }
    } catch (error) {
        console.error("Failed to update profile", error)
        return { error: "Failed to update profile" }
    }
}
