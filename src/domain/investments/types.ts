import { Decimal } from "decimal.js"

export type AssetClass = "CASH" | "EQUITY" | "FIXED_INCOME" | "CRYPTO" | "REAL_ESTATE" | "OTHER"

export interface InvestmentPosition {
  id: string
  name: string
  ticker?: string
  quantity: Decimal
  costBasis: Decimal
  assetClass: AssetClass
  currency: string
  accountId: string
  householdId: string
  ownerId?: string | null
}

export interface InvestmentRepository {
  getById(id: string): Promise<InvestmentPosition | null>
  save(position: Partial<InvestmentPosition>): Promise<string>
  update(id: string, data: Partial<InvestmentPosition>): Promise<void>
  delete(id: string): Promise<void>
}
