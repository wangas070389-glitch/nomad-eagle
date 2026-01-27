"use server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

export async function createTrip(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: "Not authenticated" }

    const name = formData.get("name") as string
    const budgetRaw = formData.get("budget") as string

    if (!name) return { error: "Name is required" }

    try {
        const trip = await prisma.trip.create({
            data: {
                name,
                budgetLimit: budgetRaw ? Number(budgetRaw) : undefined,
                status: "PLANNING",
                members: {
                    create: {
                        userId: session.user.id,
                        role: "OWNER"
                    }
                }
            }
        })
        revalidatePath("/trips")
        return { success: true, id: trip.id }
    } catch (e) {
        return { error: "Failed to create trip" }
    }
}

export async function getTrips() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return []

    // Fetch trips where the user is a member
    const trips = await prisma.trip.findMany({
        where: {
            members: { some: { userId: session.user.id } }
        },
        include: {
            members: { include: { user: true } },
            _count: { select: { transactions: true } }
        },
        orderBy: { startDate: 'asc' }
    })

    // Calculate spent per trip
    // This is expensive if lots of transactions, but okay for MVP isolation
    // Ideally we aggregate this
    const tripsWithSpent = await Promise.all(trips.map(async (t) => {
        const aggregations = await prisma.transaction.aggregate({
            where: { tripId: t.id },
            _sum: { amount: true }
        })
        return {
            ...t,
            spent: Number(aggregations._sum.amount || 0)
        }
    }))

    return tripsWithSpent
}

export async function getTripDetails(tripId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return null

    // Verify membership (Isolation Logic)
    const membership = await prisma.tripMember.findUnique({
        where: {
            tripId_userId: {
                tripId,
                userId: session.user.id
            }
        }
    })

    if (!membership) {
        // Security Gate: Access Denied
        return null
    }

    const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: {
            members: { include: { user: true } },
            transactions: {
                include: {
                    spentBy: true,
                    category: true
                },
                orderBy: { date: 'desc' }
            }
        }
    })

    return trip
}

export async function addTripTransaction(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: "Not authenticated" }

    const tripId = formData.get("tripId") as string
    const amount = Number(formData.get("amount"))
    const description = formData.get("description") as string
    const payerId = formData.get("payerId") as string // Who paid?

    // Security: Verify user is member of trip
    const member = await prisma.tripMember.findUnique({
        where: { tripId_userId: { tripId, userId: session.user.id } }
    })
    if (!member) return { error: "Unauthorized" }

    try {
        // Ghost Transaction Logic:
        // If payer is ME, I likely want to link it to MY bank account.
        // If payer is FRIEND, they might not have a bank account in my system.
        // For MVP: Simplest is generic 'Cash/Manual' transaction unless user selects an account.

        // Let's assume generic "Trip Expense" (Cash) for now to support Ghost users.
        // If we want real sync, we'd need account selection.

        await prisma.transaction.create({
            data: {
                amount,
                description,
                date: new Date(),
                currency: "USD", // MVP
                type: "EXPENSE",
                tripId,
                spentByUserId: payerId,
                householdId: session.user.householdId, // Optional, might be null if Guest
                // No account ID -> "Ghost" / Cash
            }
        })

        revalidatePath(`/trips/${tripId}`)
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: "Failed to add expense" }
    }
}
