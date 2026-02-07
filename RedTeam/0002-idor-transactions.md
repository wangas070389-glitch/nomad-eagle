# IDOR in Transaction Creation (Cross-Household)

Date: 2026-02-07

## Status

IDENTIFIED

## Context

The `createTransaction` action in `src/server/actions/transactions.ts` performs ownership checks, but they are incomplete.

```typescript
// Standard Logic
if (account.ownerId && account.ownerId !== session.user.id) {
    return { error: "Unauthorized access to this account" }
}
```

## Vulnerability

The current check only verifies personal ownership (`ownerId`). It **does not verify Household membership**.

If an account is a "Joint Account" (where `ownerId` is typically null), the check `(account.ownerId && ...)` evaluates to `false` (safe), effectively bypassing the blocking condition.

This means a user from **Household A** could create a transaction in a Joint Account of **Household B** if they guess the `accountId`.

## Impact

-   **Financial Integrity**: Attackers can drain or pollute the transaction history of other households' joint accounts.
-   **Severity**: High.

## Mitigation

Enforce strict Household isolation:

```typescript
if (account.householdId !== session.user.householdId) {
    return { error: "Unauthorized: Account belongs to another household" }
}
```
