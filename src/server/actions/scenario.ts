"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Validation Schema (Edge Protocol: Strong typing)
const ScenarioSchema = z.object({
    name: z.string().min(1, "Name is required"),
    principal: z.number().nonnegative(),
    monthlyContribution: z.number().nonnegative(),
    apy: z.number().min(0).max(1), // 0 to 100%
    years: z.number().min(1).max(100),
    isCompound: z.boolean()
})

export async function saveScenario(data: z.infer<typeof ScenarioSchema>) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) throw new Error("Unauthorized")

    const validation = ScenarioSchema.safeParse(data)
    if (!validation.success) throw new Error("Invalid Data")

    const { name, principal, monthlyContribution, apy, years, isCompound } = validation.data

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user) throw new Error("User not found")

    const scenario = await prisma.investmentScenario.create({
        data: {
            userId: user.id,
            name,
            principal,
            monthlyContribution,
            apy,
            years,
            isCompound
        }
    })

    revalidatePath("/wealth")
    return { success: true, id: scenario.id }
}
