/**
 * PermissionService
 * Domain service for enforcing data ownership and access control.
 * Pure logic, NO framework/infrastructure coupling.
 */
export class PermissionService {
  /**
   * Ensure that the actor (user) belongs to the same household as the entity.
   */
  async ensureHouseholdAccess(actorHouseholdId: string, entityHouseholdId: string): Promise<void> {
    if (actorHouseholdId !== entityHouseholdId) {
      throw new Error("Unauthorized: Entity belongs to another household.")
    }
  }

  /**
   * Ensure that the actor is the owner of the entity (for personal accounts).
   */
  async ensureOwnership(actorId: string, ownerId: string | null): Promise<void> {
    if (ownerId && actorId !== ownerId) {
      throw new Error("Unauthorized: User does not own this resource.")
    }
  }
}
