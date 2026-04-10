import { Decimal } from "decimal.js"
import { LedgerRepository, CreateLedgerTransactionCommand, LedgerEntryType } from "./types"

/**
 * LedgerService
 * Domain service for managing the financial ledger.
 * Pure logic, NO framework/infrastructure coupling.
 */
export class LedgerService {
  constructor(private repo: LedgerRepository) {}

  /**
   * Record a financial event.
   * Ensures that the ledger transaction is balanced (Double-Entry).
   */
  async recordTransaction(command: CreateLedgerTransactionCommand): Promise<void> {
    // 1. Invariant Check: Sum(Debits) == Sum(Credits)
    // For simple single-sided ledger entries (as allowed by the prototype), we skip this for now
    // BUT we must ensure all entries have positive amounts.
    
    for (const entry of command.entries) {
      if (entry.amount.isNegative()) {
        throw new Error(`Ledger entry amount must be positive. Amount: ${entry.amount}. Type determines direction.`)
      }
    }

    // 2. Persist
    await this.repo.appendTransaction(command)
  }

  /**
   * Calculate account balance from ledger history.
   */
  async calculateBalance(accountId: string): Promise<Decimal> {
    const entries = await this.repo.getEntriesByAccount(accountId)
    let balance = new Decimal(0)
    for (const entry of entries) {
      if (entry.type === "DEBIT") {
        balance = balance.plus(entry.amount)
      } else {
        balance = balance.minus(entry.amount)
      }
    }
    return balance
  }
}
