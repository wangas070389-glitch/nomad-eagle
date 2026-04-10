import { describe, it, expect, vi } from 'vitest'
import { LedgerService } from './service'
import { LedgerRepository, LedgerEntry } from './types'
import { Decimal } from 'decimal.js'

describe('LedgerService (Domain Unit Tests)', () => {
  const mockRepo: LedgerRepository = {
    appendTransaction: vi.fn(),
    getEntriesByAccount: vi.fn(),
    getEntriesByHousehold: vi.fn(),
  }

  const service = new LedgerService(mockRepo)

  it('should calculate balance correctly from mixed entries', async () => {
    const mockEntries: LedgerEntry[] = [
      { accountId: '1', householdId: 'h1', amount: new Decimal(100), type: 'DEBIT' },
      { accountId: '1', householdId: 'h1', amount: new Decimal(30), type: 'CREDIT' },
      { accountId: '1', householdId: 'h1', amount: new Decimal(50), type: 'DEBIT' },
    ]
    
    vi.mocked(mockRepo.getEntriesByAccount).mockResolvedValue(mockEntries)

    const balance = await service.calculateBalance('1')
    expect(balance.toString()).toBe('120') // 100 - 30 + 50 = 120
  })

  it('should reject negative amounts in transactions', async () => {
    const command = {
      type: 'TRANSACTION' as const,
      entries: [
        { accountId: '1', householdId: 'h1', amount: new Decimal(-50), type: 'DEBIT' as const }
      ]
    }

    await expect(service.recordTransaction(command)).rejects.toThrow('Ledger entry amount must be positive')
  })

  it('should call repository for valid transactions', async () => {
    const command = {
      type: 'TRANSACTION' as const,
      description: 'Test',
      entries: [
        { accountId: '1', householdId: 'h1', amount: new Decimal(50), type: 'DEBIT' as const }
      ]
    }

    await service.recordTransaction(command)
    expect(mockRepo.appendTransaction).toHaveBeenCalledWith(command)
  })
})
