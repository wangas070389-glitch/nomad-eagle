import { Decimal } from "decimal.js"

export type LedgerEntryType = "DEBIT" | "CREDIT"
export type LedgerTransactionType = "OPENING_BALANCE" | "TRANSACTION" | "RECONCILIATION"

export interface LedgerEntry {
  id?: string
  accountId: string
  householdId: string
  amount: Decimal
  type: LedgerEntryType
  createdAt?: Date
}

export interface CreateLedgerTransactionCommand {
  type: LedgerTransactionType
  description?: string
  metadata?: any // JSON blob for audit
  entries: {
    accountId: string
    householdId: string
    amount: Decimal
    type: LedgerEntryType
  }[]
}

/**
 * LedgerRepository
 * Infrastructure-agnostic interface for persisting ledger data.
 */
export interface LedgerRepository {
  appendTransaction(command: CreateLedgerTransactionCommand): Promise<void>
  getEntriesByAccount(accountId: string): Promise<LedgerEntry[]>
  getEntriesByHousehold(householdId: string): Promise<LedgerEntry[]>
}
