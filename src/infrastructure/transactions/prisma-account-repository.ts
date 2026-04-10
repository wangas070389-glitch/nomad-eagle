import { PrismaClient } from "@prisma/client"
import { AccountRepository } from "../../domain/transactions/types"
import { Decimal } from "decimal.js"

export class PrismaAccountRepository implements AccountRepository {
  constructor(private prisma: PrismaClient) {}

  async updateBalance(accountId: string, amount: Decimal): Promise<void> {
    await this.prisma.account.update({
      where: { id: accountId },
      data: {
        balance: { increment: amount }
      }
    })
  }

  async getAccount(accountId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId }
    })
    if (!account) return null
    return {
      id: account.id,
      householdId: account.householdId,
      currency: account.currency,
      ownerId: account.ownerId
    }
  }
}
