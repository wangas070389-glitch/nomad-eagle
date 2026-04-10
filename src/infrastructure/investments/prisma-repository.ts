import { PrismaClient } from "@prisma/client"
import { InvestmentRepository, InvestmentPosition, AssetClass } from "../../domain/investments/types"
import { Decimal } from "decimal.js"

export class PrismaInvestmentRepository implements InvestmentRepository {
  constructor(private prisma: PrismaClient) {}

  async getById(id: string): Promise<InvestmentPosition | null> {
    const p = await this.prisma.investmentPosition.findUnique({
      where: { id }
    })
    if (!p) return null
    return {
      id: p.id,
      name: p.name,
      ticker: p.ticker || undefined,
      quantity: new Decimal(p.quantity.toString()),
      costBasis: new Decimal(p.costBasis.toString()),
      assetClass: p.assetClass as AssetClass,
      currency: p.currency,
      accountId: p.accountId,
      householdId: p.householdId,
      ownerId: p.ownerId
    }
  }

  async save(data: Partial<InvestmentPosition>): Promise<string> {
    const p = await this.prisma.investmentPosition.create({
      data: {
        name: data.name!,
        ticker: data.ticker || null,
        quantity: data.quantity ? new Decimal(data.quantity.toString()) : 0,
        costBasis: data.costBasis ? new Decimal(data.costBasis.toString()) : 0,
        assetClass: data.assetClass as any,
        currency: data.currency as any,
        accountId: data.accountId!,
        householdId: data.householdId!,
        ownerId: data.ownerId || null
      }
    })
    return p.id
  }

  async update(id: string, data: Partial<InvestmentPosition>): Promise<void> {
    await this.prisma.investmentPosition.update({
      where: { id },
      data: {
        quantity: data.quantity ? data.quantity : undefined,
        costBasis: data.costBasis ? data.costBasis : undefined
      }
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.investmentPosition.delete({ where: { id } })
  }
}
