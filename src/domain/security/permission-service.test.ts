// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest'
import { PermissionService } from './permission-service'

describe('PermissionService', () => {
  let permissionService: PermissionService

  beforeEach(() => {
    permissionService = new PermissionService()
  })

  describe('ensureHouseholdAccess', () => {
    it('should not throw when actor and entity have the same household ID', async () => {
      const householdId = 'household-123'
      await expect(
        permissionService.ensureHouseholdAccess(householdId, householdId)
      ).resolves.not.toThrow()
    })

    it('should throw an error when actor and entity have different household IDs', async () => {
      await expect(
        permissionService.ensureHouseholdAccess('household-1', 'household-2')
      ).rejects.toThrow('Unauthorized: Entity belongs to another household.')
    })
  })

  describe('ensureOwnership', () => {
    it('should not throw when actor ID matches owner ID', async () => {
      const userId = 'user-123'
      await expect(
        permissionService.ensureOwnership(userId, userId)
      ).resolves.not.toThrow()
    })

    it('should not throw when owner ID is null', async () => {
      await expect(
        permissionService.ensureOwnership('user-123', null)
      ).resolves.not.toThrow()
    })

    it('should throw an error when actor ID does not match owner ID', async () => {
      await expect(
        permissionService.ensureOwnership('user-1', 'user-2')
      ).rejects.toThrow('Unauthorized: User does not own this resource.')
    })
  })
})
