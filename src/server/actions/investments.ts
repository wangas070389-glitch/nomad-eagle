"use server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath, unstable_cache } from "next/cache"
import { revalidateTag } from "next/cache"

const fetchPortfolioSummary = async (householdId: string) => {
    const positions = await prisma.investmentPosition.findMany({
        where: {
            account: { householdId: householdId },
            quantity: { gt: 0 }
        },
        include: { account: true }
    })

    // Mock exchange rate or fetch from DB
    const exchangeRate = 20.5 // USD to MXN

    // Calculate totals
    // Logic: If currency is USD, convert to MXN for total
    let totalValueMXN = 0

    // Enrich positions with currentPrice/totalValue (Mock for now or calc)
    // In a real app we'd fetch prices. Here we assume price is stored or derived?
    // Schema has 'costBasis' and 'quantity'. 'currentPrice' isn't in schema but component uses it.
    // Let's assume currentPrice = costBasis * 1.1 for demo gain, or check PriceHistory.
    // For MVP editing, let's just use costBasis as current price or mock it.

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
    const session = await getServerSession(authOptions)
    // In real app: fetch external API
    if (session?.user?.householdId) {
        // Invalidate the cache to force refresh
        // revalidateTag(`portfolio-household-${session.user.householdId}`)
    }
    revalidatePath("/")
    return { success: true }
}

import { ActionState } from "@/lib/types"
import { Account, InvestmentPosition, Currency, AssetClass } from "@prisma/client"

// ... existing fetchPortfolioSummary ...

export async function createPosition(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: "Not authenticated" }

    const name = formData.get("name") as string
    const ticker = formData.get("ticker") as string
    const quantity = Number(formData.get("quantity"))
    const costBasis = Number(formData.get("costBasis"))
    const assetClass = formData.get("assetClass") as AssetClass
    const currency = formData.get("currency") as Currency
    const accountId = formData.get("accountId") as string

    if (!name || !accountId) return { error: "Name and Account are required" }

    try {
        await prisma.investmentPosition.create({
            data: {
                name,
                ticker,
                quantity,
                costBasis,
                assetClass,
                currency,
                accountId
            }
        })
        revalidatePath("/")
        return { success: true }
    } catch (e) {
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

    // Verify ownership via Account -> Household
    const position = await prisma.investmentPosition.findUnique({
        where: { id: poolId },
        include: { account: true }
    })

    if (!position || position.account.householdId !== session.user.householdId) {
        return { error: "Unauthorized" }
    }

    try {
        await prisma.investmentPosition.update({
            where: { id: poolId },
            data: {
                quantity: data.quantity,
                costBasis: data.costBasis
            }
        })

        revalidatePath("/")
        return { success: true }
    } catch (e) {
        return { error: "Failed to update investment" }
    }
}

export async function deleteInvestment(id: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: "Not authenticated" }

    // Verify ownership
    const position = await prisma.investmentPosition.findUnique({
        where: { id },
        include: { account: true }
    })

    if (!position || position.account.householdId !== session.user.householdId) {
        return { error: "Unauthorized" }
    }

    await prisma.investmentPosition.delete({ where: { id } })
    revalidatePath("/")
    return { success: true }
}

export async function capitalizeInvestment(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: "Not authenticated" }

    const investmentId = formData.get("investmentId") as string
    const unitsToSell = Number(formData.get("units"))
    const salePrice = Number(formData.get("salePrice"))
    const targetAccountId = formData.get("targetAccountId") as string

    if (!investmentId || !unitsToSell || !salePrice || !targetAccountId) {
        return { error: "Missing required fields" }
    }

    // Verify Investment Ownership
    const position = await prisma.investmentPosition.findUnique({
        where: { id: investmentId },
        include: { account: true }
    })

    if (!position || position.account.householdId !== session.user.householdId) {
        return { error: "Unauthorized access to investment" }
    }

    // Verify Target Account Ownership
    const targetAccount = await prisma.account.findUnique({
        where: { id: targetAccountId }
    })

    if (!targetAccount || targetAccount.householdId !== session.user.householdId) {
        return { error: "Unauthorized access to target account" }
    }

    if (unitsToSell > Number(position.quantity)) {
        return { error: "Cannot sell more than you own" }
    }

    const totalCashValue = unitsToSell * salePrice

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Decrement Investment
            const newQuantity = Number(position.quantity) - unitsToSell
            if (newQuantity <= 0) {
                await tx.investmentPosition.update({
                    where: { id: investmentId },
                    data: { quantity: 0 }
                })
            } else {
                await tx.investmentPosition.update({
                    where: { id: investmentId },
                    data: { quantity: newQuantity }
                })
            }

            // 2. Increment Bank Account
            await tx.account.update({
                where: { id: targetAccountId },
                data: { balance: { increment: totalCashValue } }
            })

            // 3. Create Transaction
            await tx.transaction.create({
                data: {
                    amount: totalCashValue,
                    date: new Date(),
                    description: `Sold ${unitsToSell}u of ${position.ticker || position.name}`,
                    type: "INCOME", // Liquidity event
                    accountId: targetAccountId,
                    householdId: session.user.householdId!,
                    currency: targetAccount.currency,
                    spentByUserId: session.user.id
                }
            })
        })

        revalidatePath("/")
        return { success: true }
    } catch (e) {
        return { error: "Capitalization failed" }
    }
}
