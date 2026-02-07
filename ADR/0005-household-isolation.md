# 5. Enforce Strict Household Isolation

Date: 2026-02-07

## Status

Accepted

## Context

Red Team analysis (`RedTeam/0002-idor-transactions.md`) revealed that cross-household transactions were possible because authorization checks relied solely on personal ownership (`ownerId`), ignoring the `householdId` scope. This allows users to potentially interact with "Joint Accounts" of other households.

## Decision

We will enforce strict **Household Isolation** for all resource access.

1.  **Rule**: All database queries for resources (Accounts, Transactions, Categories) must include a filter for `householdId` matching the current user's session.
2.  **Implementation**:
    -   When fetching an updated/deleted resource, verify `resource.householdId === session.user.householdId`.
    -   When creating a resource linked to a parent (e.g., Transaction -> Account), verify the parent belongs to the session's household.

## Consequences

-   **Security**: Prevents horizontal privilege escalation (IDOR) between households.
-   **Performance**: Adds a slight overhead for extra checks, but negligible.
-   **Refactoring**: Requires updating existing server actions (`transactions.ts`, `accounts.ts`) to include these checks.
