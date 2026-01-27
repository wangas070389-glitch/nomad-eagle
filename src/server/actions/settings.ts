"use server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

export async function resetHousehold() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.householdId) return { error: "Not authenticated" }

    const householdId = session.user.householdId

    try {
        // Delete in order of dependencies (Child -> Parent)

        // 1. Transactions & Positions (depend on Accounts)
        await prisma.transaction.deleteMany({
            where: { account: { householdId } }
        })

        await prisma.investmentPosition.deleteMany({
            where: { account: { householdId } }
        })

        // 2. Accounts (depend on Household)
        await prisma.account.deleteMany({
            where: { householdId }
        })

        // 3. Planning Data (depend on Household)
        await prisma.budgetLimit.deleteMany({
            where: { householdId }
        })

        await prisma.recurringFlow.deleteMany({
            where: { householdId }
        })

        // Note: we KEEP Categories so the user doesn't have to re-seed them every time.
        // We KEEP the Household and User themselves.

        revalidatePath("/")
        revalidatePath("/plan")
        revalidatePath("/settings")

        return { success: true }
    } catch (error) {
        console.error("Reset failed:", error)
        return { error: "Failed to reset household data." }
    }
}
