import { Decimal } from "decimal.js"

export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER"

export interface CreateTransactionCommand {
  date: Date
  amount: Decimal
  description: string
  type: TransactionType
  accountId?: string
  categoryId?: string
  householdId: string
  userId: string
  
  // Relational Pulse: Strategic Handshake
  recurringFlowId?: string
  budgetLimitId?: string
  
  // For Transfers
  fromAccountId?: string
  toAccountId?: string
}

export interface TransactionRepository {
  save(command: CreateTransactionCommand): Promise<string> // Returns transactionId
  delete(id: string): Promise<void>
  getById(id: string): Promise<{
    id: string,
    amount: Decimal,
    description: string,
    type: TransactionType,
    accountId: string | null,
    householdId: string | null,
    recurringFlowId: string | null,
    budgetLimitId: string | null
  } | null>
}

export interface AccountRepository {
  updateBalance(accountId: string, amount: Decimal): Promise<void>
  getAccount(accountId: string): Promise<{ id: string, householdId: string, currency: string, ownerId: string | null } | null>
}
