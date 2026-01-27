"use server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { UserStatus } from "@prisma/client"

// Protection Check
async function requireAdmin() {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized: Admin Access Required")
    }
    return session
}

export async function toggleUserStatus(userId: string, newStatus: UserStatus) {
    await requireAdmin()

    await prisma.user.update({
        where: { id: userId },
        data: { status: newStatus }
    })

    revalidatePath("/admin/dashboard")
    return { success: true }
}

export async function resetUserPassword(userId: string) {
    await requireAdmin()

    // Dynamically import bcrypt to avoid build issues if types are missing
    const bcrypt = require("bcryptjs")
    const hashedPassword = await bcrypt.hash("ChangeMe123!", 12)

    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
    })

    return { success: true }
}

export async function approveAccess(userId: string) {
    return toggleUserStatus(userId, "ACTIVE")
}

export async function terminateEntity(entityId: string, entityType: 'USER' | 'HOUSEHOLD') {
    await requireAdmin()

    if (entityType === 'USER') {
        const user = await prisma.user.findUnique({
            where: { id: entityId },
            include: { ownedHousehold: { include: { users: true } } }
        })

        if (!user) return { error: "User not found" }

        // Logic: If User owns a household, and it has OTHER members, we cannot delete user easily.
        // We must transfer ownership or block.
        // If User is the ONLY member, we delete the Household too.

        let householdDeleted = false

        if (user.ownedHousehold.length > 0) {
            for (const household of user.ownedHousehold) {
                if (household.users.length === 1) {
                    await prisma.household.delete({ where: { id: household.id } })
                    householdDeleted = true
                } else {
                    return { error: `User owns household ${household.name} with other members. Transfer ownership first.` }
                }
            }
        }

        await prisma.user.delete({ where: { id: entityId } })
    }

    revalidatePath("/admin/dashboard")
    return { success: true }
}

export async function replicateUniverse(sourceEmail: string, targetEmail: string) {
    await requireAdmin();

    const source = await prisma.user.findUnique({
        where: { email: sourceEmail },
        include: { household: { include: { categories: true, recurringFlows: true } } }
    });

    const target = await prisma.user.findUnique({
        where: { email: targetEmail },
        include: { household: true }
    });

    if (!source || !source.household) return { error: "Source universe not found" };
    if (!target || !target.household) return { error: "Target universe not found" };

    // Clone Categories
    const categoriesToCreate = source.household.categories
        .filter(c => c.householdId === source.household!.id) // Only custom ones
        .map(c => ({
            name: c.name,
            type: c.type,
            icon: c.icon,
            householdId: target.household!.id
        }));

    if (categoriesToCreate.length > 0) {
        await prisma.category.createMany({ data: categoriesToCreate });
    }

    // Clone Flows
    const flowsToCreate = source.household.recurringFlows
        .map(f => ({
            name: f.name,
            amount: f.amount,
            type: f.type,
            frequency: f.frequency,
            householdId: target.household!.id,
            isActive: f.isActive
        }));

    if (flowsToCreate.length > 0) {
        await prisma.recurringFlow.createMany({ data: flowsToCreate });
    }

    return { success: true };
}

export async function getUsers() {
    await requireAdmin()

    const users = await prisma.user.findMany({
        orderBy: { email: 'asc' },
        include: { household: true }
    })

    return users
}
