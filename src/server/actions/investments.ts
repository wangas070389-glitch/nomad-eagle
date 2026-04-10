"use server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath, unstable_cache } from "next/cache"
import { container } from "../domain-container"
import { Decimal } from "decimal.js"
import { ActionState } from "@/lib/types"
import { AssetClass, Currency } from "@prisma/client"

const fetchPortfolioSummary = async (householdId: string) => {
    const positions = await prisma.investmentPosition.findMany({
        where: {
            account: { householdId: householdId },
            quantity: { gt: 0 }
        },
        include: { account: true }
    })

    const exchangeRate = 20.5 // USD to MXN
    let totalValueMXN = 0

    const enriched = positions.map(p => {
        const currentPrice = Number(p.costBasis) // Simplified: flat
        const totalValue = Number(p.quantity) * currentPrice

        let valMXN = totalValue
        if (p.currency === "USD") valMXN = totalValue * exchangeRate

        totalValueMXN += valMXN

        return {
            ...p,
            quantity: Number(p.quantity),
            costBasis: Number(p.costBasis),
            account: {
                ...p.account,
                balance: Number(p.account.balance)
            },
            currentPrice,
            totalValue
        }
    })

    return {
        totalValueMXN,
        positions: enriched,
        exchangeRate
    }
}

export async function getPortfolioSummary() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session.user.householdId) return { totalValueMXN: 0, positions: [], exchangeRate: 1 }

    const getCachedPortfolio = unstable_cache(
        async (hId: string) => fetchPortfolioSummary(hId),
        [`portfolio-household-${session.user.householdId}`],
        {
            tags: [`portfolio-household-${session.user.householdId}`],
            revalidate: 3600 // 1 Hour Cache
        }
    )

    return await getCachedPortfolio(session.user.householdId)
}

export async function refreshPortfolioValues() {
    revalidatePath("/")
    return { success: true }
}

export async function createPosition(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session.user.householdId) return { error: "Not authenticated" }

    const name = formData.get("name") as string
    const ticker = formData.get("ticker") as string
    const quantity = Number(formData.get("quantity"))
    const costBasis = Number(formData.get("costBasis"))
    const assetClass = formData.get("assetClass") as AssetClass
    const currency = formData.get("currency") as Currency
    const accountId = formData.get("accountId") as string

    try {
        await container.investmentService.create({
            name,
            ticker,
            quantity: new Decimal(quantity),
            costBasis: new Decimal(costBasis),
            assetClass: assetClass as any,
            currency,
            accountId
        })
        revalidatePath("/")
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: "Failed to create position" }
    }
}

export async function updateInvestment(
    poolId: string,
    data: {
        quantity: number,
        costBasis: number
    }
): Promise<ActionState> {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: "Not authenticated" }

    try {
        await container.investmentService.update(poolId, {
            quantity: new Decimal(data.quantity),
            costBasis: new Decimal(data.costBasis)
        })

        revalidatePath("/")
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: "Failed to update investment" }
    }
}

export async function deleteInvestment(id: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: "Not authenticated" }

    try {
        await container.investmentService.delete(id)
        revalidatePath("/")
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: "Failed to delete investment" }
    }
}

export async function capitalizeInvestment(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session.user.householdId) return { error: "Not authenticated" }

    const investmentId = formData.get("investmentId") as string
    const unitsToSell = Number(formData.get("units"))
    const salePrice = Number(formData.get("salePrice"))
    const targetAccountId = formData.get("targetAccountId") as string

    try {
        await container.investmentService.capitalize({
            investmentId,
            unitsToSell: new Decimal(unitsToSell),
            salePrice: new Decimal(salePrice),
            targetAccountId,
            householdId: session.user.householdId,
            userId: session.user.id
        })

        revalidatePath("/")
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: e instanceof Error ? e.message : "Capitalization failed" }
    }
}
