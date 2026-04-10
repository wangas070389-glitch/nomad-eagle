import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { TestDbManager } from './test-db-manager'
import { PrismaLedgerRepository } from '../../infrastructure/ledger/prisma-repository'
import { LedgerService } from '../../domain/ledger/service'
import { Decimal } from 'decimal.js'

describe('Ledger Invariants (PostgreSQL Integration)', () => {
  let prisma: any
  let ledgerService: LedgerService
  let householdIdRef: string
  let accountIdRef: string

  beforeAll(async () => {
    const res = await TestDbManager.start()
    prisma = res.prisma
    const repo = new PrismaLedgerRepository(prisma)
    ledgerService = new LedgerService(repo)
  }, 120000) // 2 Min timeout for container start

  afterAll(async () => {
    await TestDbManager.stop()
  })

  beforeEach(async () => {
    // Clear data or isolate
    await prisma.ledgerEntry.deleteMany()
    await prisma.ledgerTransaction.deleteMany()
    await prisma.account.deleteMany()
    await prisma.household.deleteMany()

    // Seed base data
    const hh = await prisma.household.create({ data: { name: 'Test Household' } })
    const acc = await prisma.account.create({
      data: {
        name: 'Test Checking',
        balance: 0,
        type: 'CHECKING',
        currency: 'MXN',
        householdId: hh.id
      }
    })
    householdIdRef = hh.id
    accountIdRef = acc.id
  })

  it('should enforce debit/credit math in the real DB', async () => {
    await ledgerService.recordTransaction({
      type: 'TRANSACTION',
      description: 'Test Inflow',
      entries: [
        { accountId: accountIdRef, householdId: householdIdRef, amount: new Decimal(1000), type: 'DEBIT' }
      ]
    })

    await ledgerService.recordTransaction({
      type: 'TRANSACTION',
      description: 'Test Outflow',
      entries: [
        { accountId: accountIdRef, householdId: householdIdRef, amount: new Decimal(400), type: 'CREDIT' }
      ]
    })

    const balance = await ledgerService.calculateBalance(accountIdRef)
    expect(balance.toNumber()).toBe(600)
  })

  it('should handle large batches correctly', async () => {
    const entries = Array.from({ length: 100 }, (_, i) => ({
      accountId: accountIdRef,
      householdId: householdIdRef,
      amount: new Decimal(10),
      type: i % 2 === 0 ? 'DEBIT' : 'CREDIT'
    }))

    await ledgerService.recordTransaction({
      type: 'OPENING_BALANCE',
      entries: entries as any
    })

    const balance = await ledgerService.calculateBalance(accountIdRef)
    expect(balance.toNumber()).toBe(0) // 50 * 10 - 50 * 10
  })
})
