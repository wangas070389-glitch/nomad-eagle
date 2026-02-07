# 6. Secure Investment Operations

Date: 2026-02-07

## Status

Accepted

## Context

Red Team analysis (`RedTeam/0001-idor-investments.md`) identified that investment positions could be created in *any* account/household due to missing ownership verification in `createPosition`.

## Decision

We will implement mandatory ownership verification for all investment operations.

1.  **Creation**: Before creating an `InvestmentPosition`, we must fetch the target `Account` and verify it belongs to the user's `householdId`.
2.  **Modification/Deletion**: Verify the existing `InvestmentPosition` (via its `Account`) belongs to the user's `householdId`.

## Consequences

-   **Security**: Mitigates arbitrary data injection into other users' portfolios.
-   **Code Change**: We must update `src/server/actions/investments.ts`.
