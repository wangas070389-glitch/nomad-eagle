import { Decimal } from "decimal.js"
import { InvestmentRepository, InvestmentPosition } from "./types"
import { TransactionDomainService } from "../transactions/service"
import { PermissionService } from "../security/permission-service"

/**
 * InvestmentDomainService
 * Domain service for managing financial investments and capitalization.
 */
export class InvestmentDomainService {
  constructor(
    private investRepo: InvestmentRepository,
    private transService: TransactionDomainService,
    private permissionService: PermissionService
  ) {}

  /**
   * Capitalize an investment (Sell units for cash).
   * Orchestrates:
   * 1. Reducing investment position quantity.
   * 2. Creating an INCOME transaction in the bank account.
   * 3. (Implicitly) Updating Ledger via TransactionDomainService.
   */
  async capitalize(command: {
    investmentId: string,
    unitsToSell: Decimal,
    salePrice: Decimal,
    targetAccountId: string,
    householdId: string,
    userId: string
  }): Promise<string> {
    const position = await this.investRepo.getById(command.investmentId)
    if (!position) throw new Error("Investment position not found.")

    // 0. Security Invariants
    await this.permissionService.ensureHouseholdAccess(command.householdId, position.householdId)

    if (command.unitsToSell.gt(position.quantity)) {
      throw new Error(`Insufficient quantity. Owned: ${position.quantity}, Selling: ${command.unitsToSell}`)
    }

    const totalCashValue = command.unitsToSell.times(command.salePrice)

    // 1. Physical Position Update
    const newQuantity = position.quantity.minus(command.unitsToSell)
    await this.investRepo.update(command.investmentId, { quantity: newQuantity })

    // 2. Financial Event Recording
    // This calls the TransactionDomainService which handles:
    // - Transaction Record
    // - Ledger Injection
    // - Balance Cache Update
    const transactionId = await this.transService.execute({
      date: new Date(),
      amount: totalCashValue,
      description: `Sold ${command.unitsToSell}u of ${position.ticker || position.name}`,
      type: "INCOME",
      accountId: command.targetAccountId,
      householdId: command.householdId,
      userId: command.userId
    })

    return transactionId
  }

  async create(data: Partial<InvestmentPosition>): Promise<string> {
    return await this.investRepo.save(data)
  }

  async update(id: string, data: Partial<InvestmentPosition>): Promise<void> {
    await this.investRepo.update(id, data)
  }

  async delete(id: string): Promise<void> {
    await this.investRepo.delete(id)
  }
}
