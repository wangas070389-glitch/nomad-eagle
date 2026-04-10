import { Decimal } from "decimal.js"
import { CreateTransactionCommand, TransactionRepository, AccountRepository } from "./types"
import { LedgerService } from "../ledger/service"
import { TaskDomainService } from "../tasks/service"
import { PermissionService } from "../security/permission-service"

/**
 * TransactionDomainService
 * Domain service for managing financial transactions.
 * Orchestrates Transaction creation and Ledger record keeping.
 */
export class TransactionDomainService {
  constructor(
    private transRepo: TransactionRepository,
    private ledgerService: LedgerService,
    private accountRepo: AccountRepository,
    private taskService: TaskDomainService,
    private permissionService: PermissionService
  ) {}

  /**
   * Execute a transaction creation command.
   * This is the "Pure" business logic extracted from Server Actions.
   */
  async execute(command: CreateTransactionCommand): Promise<string> {
    // 0. Security Invariants
    if (command.accountId) {
      const account = await this.accountRepo.getAccount(command.accountId)
      if (!account) throw new Error("Account not found")
      await this.permissionService.ensureHouseholdAccess(command.householdId, account.householdId)
      await this.permissionService.ensureOwnership(command.userId, account.ownerId)
    }

    // 1. Logic for Transaction Creation
    const transactionId = await this.transRepo.save(command)

    // 2. Logic for Ledger Records
    if (command.type === "TRANSFER") {
      if (!command.fromAccountId || !command.toAccountId) {
        throw new Error("Transfers require both fromAccountId and toAccountId.")
      }

      await this.ledgerService.recordTransaction({
        type: "TRANSACTION",
        description: `Transfer: ${command.description}`,
        entries: [
          {
            accountId: command.fromAccountId,
            householdId: command.householdId,
            amount: command.amount,
            type: "CREDIT" // Withdrawal
          },
          {
            accountId: command.toAccountId,
            householdId: command.householdId,
            amount: command.amount,
            type: "DEBIT" // Deposit
          }
        ]
      })

      // 3. Balance Cache Update (Dual Write)
      await this.accountRepo.updateBalance(command.fromAccountId, command.amount.negated())
      await this.accountRepo.updateBalance(command.toAccountId, command.amount)
    } else {
      if (!command.accountId) {
        throw new Error("Income/Expense transactions require an accountId.")
      }

      await this.ledgerService.recordTransaction({
        type: "TRANSACTION",
        description: command.description,
        metadata: {
          transactionId: transactionId,
          categoryId: command.categoryId,
          timestamp: new Date().toISOString()
        },
        entries: [
          {
            accountId: command.accountId,
            householdId: command.householdId,
            amount: command.amount,
            type: command.type === "INCOME" ? "DEBIT" : "CREDIT"
          }
        ]
      })

      // 3. Balance Cache Update (Dual Write)
      const balanceChange = command.type === "INCOME" ? command.amount : command.amount.negated()
      await this.accountRepo.updateBalance(command.accountId, balanceChange)
    }

    // 4. Queue Side-Effects (Durable Outbox)
    await this.taskService.queue({
      type: 'GENERATE_EMBEDDING',
      payload: {
        transactionId: transactionId,
        description: command.description
      }
    })

    return transactionId
  }

  /**
   * Delete a transaction and reverse its impact in the ledger.
   */
  async delete(id: string, householdId: string): Promise<void> {
    const tx = await this.transRepo.getById(id)
    if (!tx) throw new Error("Transaction not found")
    if (tx.householdId !== householdId) throw new Error("Unauthorized")

    // 1. Ledger Reversal
    if (tx.accountId) {
      await this.ledgerService.recordTransaction({
        type: "RECONCILIATION",
        description: `Reverse ${tx.type}: ${tx.description} (Deletion)`,
        metadata: {
          originalTransactionId: id,
          reason: "DELETION",
          timestamp: new Date().toISOString()
        },
        entries: [
          {
            accountId: tx.accountId,
            householdId: householdId,
            amount: tx.amount.abs(),
            type: tx.type === "EXPENSE" ? "DEBIT" : "CREDIT"
          }
        ]
      })

      // 2. Balance Cache Update (Reversal)
      const reverseAmount = tx.type === "EXPENSE" ? tx.amount.abs() : tx.amount.abs().negated()
      await this.accountRepo.updateBalance(tx.accountId, reverseAmount)
    }
    
    // 3. Physical Delete
    await this.transRepo.delete(id)
  }

  /**
   * Update a transaction.
   * Pattern: Revert Old -> Apply New
   */
  async update(id: string, command: CreateTransactionCommand): Promise<string> {
    // 1. Revert Old
    await this.delete(id, command.householdId)

    // 2. Apply New
    return await this.execute(command)
  }
}
