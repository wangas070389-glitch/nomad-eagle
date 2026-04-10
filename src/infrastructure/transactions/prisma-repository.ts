import { PrismaClient } from "@prisma/client"
import { TransactionRepository, CreateTransactionCommand } from "../../domain/transactions/types"
import { Decimal } from "decimal.js"

export class PrismaTransactionRepository implements TransactionRepository {
  constructor(private prisma: PrismaClient) {}

  async save(command: CreateTransactionCommand): Promise<string> {
    const tx = await this.prisma.transaction.create({
      data: {
        date: command.date,
        amount: command.amount,
        description: command.description,
        type: command.type as "INCOME" | "EXPENSE" | "TRANSFER",
        accountId: command.accountId || null,
        categoryId: command.categoryId || null,
        householdId: command.householdId,
        spentByUserId: command.userId,
        // @ts-ignore
        recurringFlowId: command.recurringFlowId || null,
        // @ts-ignore
        budgetLimitId: command.budgetLimitId || null,
        currency: "MXN" // Defaulting for simple decoupling demonstration
      }
    })
    return tx.id
  }

  async delete(id: string): Promise<void> {
    await this.prisma.transaction.delete({ where: { id } })
  }

  async getById(id: string) {
    const tx = await this.prisma.transaction.findUnique({
      where: { id }
    })
    if (!tx) return null
    return {
      id: tx.id,
      amount: new Decimal(tx.amount.toString()),
      description: tx.description,
      type: tx.type as any,
      accountId: tx.accountId,
      householdId: tx.householdId,
      recurringFlowId: (tx as any).recurringFlowId,
      budgetLimitId: (tx as any).budgetLimitId
    }
  }
}
