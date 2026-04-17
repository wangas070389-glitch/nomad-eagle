import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TransactionDomainService } from './service'
import { TransactionRepository, AccountRepository, CreateTransactionCommand } from './types'
import { LedgerService } from '../ledger/service'
import { TaskDomainService } from '../tasks/service'
import { PermissionService } from '../security/permission-service'
import { Decimal } from 'decimal.js'

describe('TransactionDomainService', () => {
  let transRepo: any
  let ledgerService: any
  let accountRepo: any
  let taskService: any
  let permissionService: any
  let service: TransactionDomainService

  beforeEach(() => {
    transRepo = {
      save: vi.fn(),
      delete: vi.fn(),
      getById: vi.fn(),
    }
    ledgerService = {
      recordTransaction: vi.fn(),
    }
    accountRepo = {
      updateBalance: vi.fn(),
      getAccount: vi.fn(),
    }
    taskService = {
      queue: vi.fn(),
    }
    permissionService = {
      ensureHouseholdAccess: vi.fn(),
      ensureOwnership: vi.fn(),
    }

    service = new TransactionDomainService(
      transRepo as unknown as TransactionRepository,
      ledgerService as unknown as LedgerService,
      accountRepo as unknown as AccountRepository,
      taskService as unknown as TaskDomainService,
      permissionService as unknown as PermissionService
    )
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('execute', () => {
    it('should throw Account not found if getAccount returns null', async () => {
      accountRepo.getAccount.mockResolvedValue(null)
      const command: CreateTransactionCommand = {
        date: new Date(),
        amount: new Decimal(100),
        description: 'Test',
        type: 'INCOME',
        accountId: 'acc1',
        householdId: 'h1',
        userId: 'u1'
      }

      await expect(service.execute(command)).rejects.toThrow('Account not found')
    })

    it('should throw error if Transfer is missing fromAccountId or toAccountId', async () => {
      accountRepo.getAccount.mockResolvedValue({ id: 'acc1', householdId: 'h1', ownerId: 'u1' })
      permissionService.ensureHouseholdAccess.mockResolvedValue()
      permissionService.ensureOwnership.mockResolvedValue()

      const command: CreateTransactionCommand = {
        date: new Date(),
        amount: new Decimal(100),
        description: 'Test',
        type: 'TRANSFER',
        accountId: 'acc1',
        householdId: 'h1',
        userId: 'u1'
      }

      await expect(service.execute(command)).rejects.toThrow('Transfers require both fromAccountId and toAccountId.')
    })

    it('should throw error if Income/Expense is missing accountId', async () => {
      const command: CreateTransactionCommand = {
        date: new Date(),
        amount: new Decimal(100),
        description: 'Test',
        type: 'INCOME',
        householdId: 'h1',
        userId: 'u1'
      }

      await expect(service.execute(command)).rejects.toThrow('Income/Expense transactions require an accountId.')
    })

    it('should successfully execute a transfer transaction', async () => {
      accountRepo.getAccount.mockResolvedValue({ id: 'acc1', householdId: 'h1', ownerId: 'u1' })
      permissionService.ensureHouseholdAccess.mockResolvedValue()
      permissionService.ensureOwnership.mockResolvedValue()
      transRepo.save.mockResolvedValue('tx1')

      const command: CreateTransactionCommand = {
        date: new Date(),
        amount: new Decimal(100),
        description: 'Test Transfer',
        type: 'TRANSFER',
        accountId: 'acc1', // For security check
        fromAccountId: 'acc1',
        toAccountId: 'acc2',
        householdId: 'h1',
        userId: 'u1'
      }

      const result = await service.execute(command)

      expect(result).toBe('tx1')
      expect(ledgerService.recordTransaction).toHaveBeenCalledWith(expect.objectContaining({
        type: 'TRANSACTION',
        description: 'Transfer: Test Transfer',
        entries: [
          { accountId: 'acc1', householdId: 'h1', amount: new Decimal(100), type: 'CREDIT' },
          { accountId: 'acc2', householdId: 'h1', amount: new Decimal(100), type: 'DEBIT' }
        ]
      }))

      // We expect updateBalance to be called twice: once negative, once positive
      expect(accountRepo.updateBalance).toHaveBeenCalledWith('acc1', expect.any(Decimal))
      // Verify first call arg is negated
      expect(accountRepo.updateBalance.mock.calls[0][1].toString()).toBe('-100')
      expect(accountRepo.updateBalance).toHaveBeenCalledWith('acc2', new Decimal(100))

      expect(taskService.queue).toHaveBeenCalledWith({
        type: 'GENERATE_EMBEDDING',
        payload: { transactionId: 'tx1', description: 'Test Transfer' }
      })
    })

    it('should successfully execute an income transaction', async () => {
      accountRepo.getAccount.mockResolvedValue({ id: 'acc1', householdId: 'h1', ownerId: 'u1' })
      permissionService.ensureHouseholdAccess.mockResolvedValue()
      permissionService.ensureOwnership.mockResolvedValue()
      transRepo.save.mockResolvedValue('tx2')

      const command: CreateTransactionCommand = {
        date: new Date(),
        amount: new Decimal(100),
        description: 'Test Income',
        type: 'INCOME',
        accountId: 'acc1',
        categoryId: 'cat1',
        householdId: 'h1',
        userId: 'u1'
      }

      const result = await service.execute(command)

      expect(result).toBe('tx2')
      expect(ledgerService.recordTransaction).toHaveBeenCalledWith(expect.objectContaining({
        type: 'TRANSACTION',
        description: 'Test Income',
        metadata: expect.objectContaining({
          transactionId: 'tx2',
          categoryId: 'cat1'
        }),
        entries: [
          { accountId: 'acc1', householdId: 'h1', amount: new Decimal(100), type: 'DEBIT' }
        ]
      }))

      expect(accountRepo.updateBalance).toHaveBeenCalledWith('acc1', new Decimal(100))

      expect(taskService.queue).toHaveBeenCalledWith({
        type: 'GENERATE_EMBEDDING',
        payload: { transactionId: 'tx2', description: 'Test Income' }
      })
    })

    it('should successfully execute an expense transaction', async () => {
      accountRepo.getAccount.mockResolvedValue({ id: 'acc1', householdId: 'h1', ownerId: 'u1' })
      permissionService.ensureHouseholdAccess.mockResolvedValue()
      permissionService.ensureOwnership.mockResolvedValue()
      transRepo.save.mockResolvedValue('tx3')

      const command: CreateTransactionCommand = {
        date: new Date(),
        amount: new Decimal(100),
        description: 'Test Expense',
        type: 'EXPENSE',
        accountId: 'acc1',
        categoryId: 'cat1',
        householdId: 'h1',
        userId: 'u1'
      }

      const result = await service.execute(command)

      expect(result).toBe('tx3')
      expect(ledgerService.recordTransaction).toHaveBeenCalledWith(expect.objectContaining({
        type: 'TRANSACTION',
        description: 'Test Expense',
        metadata: expect.objectContaining({
          transactionId: 'tx3',
          categoryId: 'cat1'
        }),
        entries: [
          { accountId: 'acc1', householdId: 'h1', amount: new Decimal(100), type: 'CREDIT' }
        ]
      }))

      expect(accountRepo.updateBalance).toHaveBeenCalledWith('acc1', expect.any(Decimal))
      expect(accountRepo.updateBalance.mock.calls[0][1].toString()).toBe('-100')

      expect(taskService.queue).toHaveBeenCalledWith({
        type: 'GENERATE_EMBEDDING',
        payload: { transactionId: 'tx3', description: 'Test Expense' }
      })
    })
  })

  describe('delete', () => {
    it('should throw Transaction not found if getById returns null', async () => {
      transRepo.getById.mockResolvedValue(null)
      await expect(service.delete('tx1', 'h1')).rejects.toThrow('Transaction not found')
    })

    it('should throw Unauthorized if householdId mismatch', async () => {
      transRepo.getById.mockResolvedValue({ id: 'tx1', householdId: 'h2' })
      await expect(service.delete('tx1', 'h1')).rejects.toThrow('Unauthorized')
    })

    it('should successfully delete an expense transaction', async () => {
      transRepo.getById.mockResolvedValue({
        id: 'tx1',
        type: 'EXPENSE',
        amount: new Decimal(100),
        accountId: 'acc1',
        householdId: 'h1',
        description: 'Test Expense'
      })

      await service.delete('tx1', 'h1')

      expect(ledgerService.recordTransaction).toHaveBeenCalledWith(expect.objectContaining({
        type: 'RECONCILIATION',
        description: 'Reverse EXPENSE: Test Expense (Deletion)',
        metadata: expect.objectContaining({
          originalTransactionId: 'tx1',
          reason: 'DELETION'
        }),
        entries: [
          { accountId: 'acc1', householdId: 'h1', amount: new Decimal(100), type: 'DEBIT' }
        ]
      }))

      // Expense reversed = balance increases
      expect(accountRepo.updateBalance).toHaveBeenCalledWith('acc1', new Decimal(100))
      expect(transRepo.delete).toHaveBeenCalledWith('tx1')
    })

    it('should successfully delete an income transaction', async () => {
      transRepo.getById.mockResolvedValue({
        id: 'tx2',
        type: 'INCOME',
        amount: new Decimal(100),
        accountId: 'acc1',
        householdId: 'h1',
        description: 'Test Income'
      })

      await service.delete('tx2', 'h1')

      expect(ledgerService.recordTransaction).toHaveBeenCalledWith(expect.objectContaining({
        type: 'RECONCILIATION',
        description: 'Reverse INCOME: Test Income (Deletion)',
        entries: [
          { accountId: 'acc1', householdId: 'h1', amount: new Decimal(100), type: 'CREDIT' }
        ]
      }))

      // Income reversed = balance decreases
      expect(accountRepo.updateBalance).toHaveBeenCalledWith('acc1', expect.any(Decimal))
      expect(accountRepo.updateBalance.mock.calls[0][1].toString()).toBe('-100')
      expect(transRepo.delete).toHaveBeenCalledWith('tx2')
    })
  })

  describe('update', () => {
    it('should successfully update a transaction by reverting old and applying new', async () => {
      // Mocking for delete (revert old)
      transRepo.getById.mockResolvedValue({
        id: 'tx1',
        type: 'EXPENSE',
        amount: new Decimal(100),
        accountId: 'acc1',
        householdId: 'h1',
        description: 'Old Expense'
      })

      // Mocking for execute (apply new)
      accountRepo.getAccount.mockResolvedValue({ id: 'acc1', householdId: 'h1', ownerId: 'u1' })
      permissionService.ensureHouseholdAccess.mockResolvedValue()
      permissionService.ensureOwnership.mockResolvedValue()
      transRepo.save.mockResolvedValue('tx-new')

      const newCommand: CreateTransactionCommand = {
        date: new Date(),
        amount: new Decimal(150),
        description: 'Updated Expense',
        type: 'EXPENSE',
        accountId: 'acc1',
        householdId: 'h1',
        userId: 'u1'
      }

      const result = await service.update('tx1', newCommand)

      expect(result).toBe('tx-new')

      // Verify delete was called
      expect(transRepo.delete).toHaveBeenCalledWith('tx1')

      // Verify execute side-effects were applied
      expect(ledgerService.recordTransaction).toHaveBeenCalledWith(expect.objectContaining({
        type: 'TRANSACTION',
        description: 'Updated Expense'
      }))

      expect(transRepo.save).toHaveBeenCalledWith(newCommand)
    })
  })
})
