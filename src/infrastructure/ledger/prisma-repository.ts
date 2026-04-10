import { PrismaClient } from "@prisma/client"
import { LedgerRepository, CreateLedgerTransactionCommand, LedgerEntry } from "../../domain/ledger/types"
import { Decimal } from "decimal.js"

export class PrismaLedgerRepository implements LedgerRepository {
  constructor(private prisma: PrismaClient) {}

  async appendTransaction(command: CreateLedgerTransactionCommand): Promise<void> {
    await this.prisma.ledgerTransaction.create({
      data: {
        type: command.type,
        description: command.description,
        metadata: command.metadata || {},
        entries: {
          create: command.entries.map(e => ({
            accountId: e.accountId,
            householdId: e.householdId,
            amount: e.amount,
            type: e.type
          }))
        }
      }
    })
  }

  async getEntriesByAccount(accountId: string): Promise<LedgerEntry[]> {
    const entries = await this.prisma.ledgerEntry.findMany({
      where: { accountId }
    })
    return entries.map(e => ({
      id: e.id,
      accountId: e.accountId,
      householdId: e.householdId,
      amount: new Decimal(e.amount.toString()),
      type: e.type as "DEBIT" | "CREDIT",
      createdAt: e.createdAt
    }))
  }

  async getEntriesByHousehold(householdId: string): Promise<LedgerEntry[]> {
    const entries = await this.prisma.ledgerEntry.findMany({
      where: { householdId }
    })
    return entries.map(e => ({
      id: e.id,
      accountId: e.accountId,
      householdId: e.householdId,
      amount: new Decimal(e.amount.toString()),
      type: e.type as "DEBIT" | "CREDIT",
      createdAt: e.createdAt
    }))
  }
}
