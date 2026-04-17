import { describe, it, expect, vi, beforeEach } from 'vitest'
import { InvestmentDomainService } from './service'
import { InvestmentRepository, InvestmentPosition } from './types'
import { TransactionDomainService } from '../transactions/service'
import { PermissionService } from '../security/permission-service'
import { Decimal } from 'decimal.js'

describe('InvestmentDomainService', () => {
  let investRepo: ReturnType<typeof vi.mocked<InvestmentRepository>>
  let transService: ReturnType<typeof vi.mocked<TransactionDomainService>>
  let permissionService: ReturnType<typeof vi.mocked<PermissionService>>
  let service: InvestmentDomainService

  beforeEach(() => {
    investRepo = {
      getById: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    } as any

    transService = {
      execute: vi.fn(),
      delete: vi.fn(),
      update: vi.fn()
    } as any

    permissionService = {
      ensureHouseholdAccess: vi.fn(),
      ensureOwnership: vi.fn()
    } as any

    service = new InvestmentDomainService(
      investRepo as InvestmentRepository,
      transService as TransactionDomainService,
      permissionService as PermissionService
    )
  })

  describe('Basic operations', () => {
    it('create should call investRepo.save', async () => {
      const positionData = { name: 'Vanguard 500 Index Fund' }
      vi.mocked(investRepo.save).mockResolvedValue('new-id')

      const result = await service.create(positionData)

      expect(investRepo.save).toHaveBeenCalledWith(positionData)
      expect(result).toBe('new-id')
    })

    it('update should call investRepo.update', async () => {
      const updateData = { name: 'Updated Name' }

      await service.update('inv-123', updateData)

      expect(investRepo.update).toHaveBeenCalledWith('inv-123', updateData)
    })

    it('delete should call investRepo.delete', async () => {
      await service.delete('inv-123')

      expect(investRepo.delete).toHaveBeenCalledWith('inv-123')
    })
  })

  describe('capitalize', () => {
    const mockPosition: InvestmentPosition = {
      id: 'inv-123',
      name: 'Vanguard 500 Index Fund',
      ticker: 'VOO',
      quantity: new Decimal(100),
      costBasis: new Decimal(300),
      assetClass: 'EQUITY',
      currency: 'USD',
      accountId: 'inv-acc-1',
      householdId: 'h-1',
    }

    const validCommand = {
      investmentId: 'inv-123',
      unitsToSell: new Decimal(10),
      salePrice: new Decimal(400),
      targetAccountId: 'bank-acc-1',
      householdId: 'h-1',
      userId: 'u-1'
    }

    beforeEach(() => {
      vi.mocked(investRepo.getById).mockResolvedValue(mockPosition)
      vi.mocked(transService.execute).mockResolvedValue('tx-123')
    })

    it('should successfully capitalize (Happy Path)', async () => {
      const result = await service.capitalize(validCommand)

      // 1. Verify getById was called
      expect(investRepo.getById).toHaveBeenCalledWith(validCommand.investmentId)

      // 2. Verify permission checks
      expect(permissionService.ensureHouseholdAccess).toHaveBeenCalledWith(validCommand.householdId, mockPosition.householdId)

      // 3. Verify physical position update
      expect(investRepo.update).toHaveBeenCalledWith(validCommand.investmentId, {
        quantity: new Decimal(90) // 100 - 10
      })

      // 4. Verify financial event recording via transService
      expect(transService.execute).toHaveBeenCalledWith(expect.objectContaining({
        amount: new Decimal(4000), // 10 * 400
        description: 'Sold 10u of VOO',
        type: 'INCOME',
        accountId: validCommand.targetAccountId,
        householdId: validCommand.householdId,
        userId: validCommand.userId
      }))

      // 5. Verify return value
      expect(result).toBe('tx-123')
    })

    it('should throw error if position not found', async () => {
      vi.mocked(investRepo.getById).mockResolvedValue(null)

      await expect(service.capitalize(validCommand)).rejects.toThrow('Investment position not found.')
    })

    it('should throw error if insufficient quantity', async () => {
      const commandWithTooManyUnits = {
        ...validCommand,
        unitsToSell: new Decimal(200) // greater than 100
      }

      await expect(service.capitalize(commandWithTooManyUnits)).rejects.toThrow('Insufficient quantity. Owned: 100, Selling: 200')
    })

    it('should respect household invariant check (simulate permission service throwing for position)', async () => {
      // Simulate permission service rejecting access for the position's household
      vi.mocked(permissionService.ensureHouseholdAccess)
        .mockRejectedValueOnce(new Error('Unauthorized: Entity belongs to another household.'))

      await expect(service.capitalize(validCommand)).rejects.toThrow('Unauthorized: Entity belongs to another household.')
    })

    it('should respect household invariant check for target account (simulate transService throwing)', async () => {
      // Simulate transService (which internally checks the targetAccountId's household) rejecting access
      vi.mocked(transService.execute).mockRejectedValue(new Error('Unauthorized: Entity belongs to another household.'))

      await expect(service.capitalize(validCommand)).rejects.toThrow('Unauthorized: Entity belongs to another household.')
    })

    it('should reject zero units to sell', async () => {
      const commandZeroUnits = {
        ...validCommand,
        unitsToSell: new Decimal(0)
      }

      await expect(service.capitalize(commandZeroUnits)).rejects.toThrow('Units to sell must be positive.')
    })

    it('should reject negative units to sell', async () => {
      const commandNegativeUnits = {
        ...validCommand,
        unitsToSell: new Decimal(-5)
      }

      await expect(service.capitalize(commandNegativeUnits)).rejects.toThrow('Units to sell must be positive.')
    })

    it('should reject negative sale price', async () => {
      const commandNegativePrice = {
        ...validCommand,
        salePrice: new Decimal(-100)
      }

      await expect(service.capitalize(commandNegativePrice)).rejects.toThrow('Sale price cannot be negative.')
    })

    it('should handle small fractional decimal precision correctly', async () => {
      const fractionalCommand = {
        ...validCommand,
        unitsToSell: new Decimal('0.00000001'),
        salePrice: new Decimal('0.00000001')
      }

      await service.capitalize(fractionalCommand)

      expect(investRepo.update).toHaveBeenCalledWith(validCommand.investmentId, {
        quantity: new Decimal('99.99999999')
      })

      expect(transService.execute).toHaveBeenCalledWith(expect.objectContaining({
        amount: new Decimal('0.0000000000000001') // 0.00000001 * 0.00000001
      }))
    })

    it('should propagate error if transService fails (Dependency Failure)', async () => {
      const dbError = new Error('Database disconnected')
      vi.mocked(transService.execute).mockRejectedValue(dbError)

      await expect(service.capitalize(validCommand)).rejects.toThrow('Database disconnected')

      // Note: we can also verify that the position update was attempted but the transaction failed.
      expect(investRepo.update).toHaveBeenCalled()
      expect(transService.execute).toHaveBeenCalled()
    })
  })
})
