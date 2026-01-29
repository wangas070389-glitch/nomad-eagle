export type ActionState = {
    error?: string
    success?: boolean
    message?: string
    [key: string]: unknown
} | null

import { Prisma } from "@prisma/client"

export type TransactionWithRelations = Prisma.TransactionGetPayload<{
    include: {
        category: true,
        account: { select: { id: true, name: true, currency: true, ownerId: true } },
        spentBy: { select: { id: true, name: true, email: true, avatarUrl: true } }
    }
}>

export type AccountWithRelations = Prisma.AccountGetPayload<{}>

export type TripWithRelations = Prisma.TripGetPayload<{
    include: {
        members: { include: { user: true } },
        transactions: { include: { spentBy: true } }
    }
}>

// UI Safe Types (Serialized for client components)
export type SafeAccount = Omit<AccountWithRelations, 'balance'> & { balance: number }

export type SafeTransaction = Omit<TransactionWithRelations, 'amount' | 'date'> & {
    amount: number
    date: Date
}


export type AccountOption = Pick<SafeAccount, 'id' | 'name' | 'currency' | 'ownerId'>

export type RecurringFlow = Prisma.RecurringFlowGetPayload<{}>

export type SafeRecurringFlow = Omit<RecurringFlow, 'amount'> & {
    amount: number
}

export type Category = Prisma.CategoryGetPayload<{}>

export type SimulationPoint = {
    date: string
    actual: number | null
    projected: number | null
}

export type SimulationData = {
    data: SimulationPoint[]
    summary: {
        currentNetWorth: number
        monthlySurplus: number
        projectedTotal: number
        approximatedRunwayDays?: number
    }
}

export type TripMemberWithUser = Prisma.TripMemberGetPayload<{
    include: { user: true }
}>

export type InvestmentPositionWithValue = Omit<Prisma.InvestmentPositionGetPayload<{}>, 'quantity' | 'costBasis'> & {
    quantity: number
    costBasis: number
    currentPrice: number
    totalValue: number
    ticker?: string | null
    name: string
    currency: string
}






