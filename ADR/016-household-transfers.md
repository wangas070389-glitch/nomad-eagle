# 16. Household Intra-Transfer Permission

Date: 2026-02-07

## Status

Proposed

## Context

**Problem**: 
Currently, the `createTransaction` (TRANSFER) logic enforces strict ownership checks on **both** the source (`fromAccount`) and destination (`toAccount`).
```typescript
if ((fromAccount.ownerId && fromAccount.ownerId !== session.user.id) ||
    (toAccount.ownerId && toAccount.ownerId !== session.user.id)) {
    return { error: "Unauthorized access to one of the accounts" }
}
```
This prevents a user from transferring money to a household member (e.g., "Paying back for dinner") if the destination account is personally owned by that member. The user gets an "Unauthorized access" error.

**Requirement**: 
Users must be able to move money **to** any account within their household, facilitating debt settlement or shared funding, without needing write access to the recipient's entire transaction history.

## Decision

We will **Relax the Ownership Check for the Destination Account** in transfer transactions.

### New Logic Rule
1.  **Scope**: Both accounts must belong to the user's active `householdId`.
2.  **Debit Authority (Source)**: The user must own the `fromAccount` (or it must be a Joint account).
3.  **Credit Authority (Destination)**: The user does **not** need to own the `toAccount`. As long as it is within the same household, they can deposit funds into it.

### Revised Code Logic
```typescript
// Debit Check: Must own source or be Joint
if (fromAccount.ownerId && fromAccount.ownerId !== session.user.id) {
     return { error: "Unauthorized: You do not own the source account" }
}

// Destination Check: Must be in same household (already verified), essentially "Open Deposit" logic.
// No ownership check required for toAccount.
```

## Consequences

-   **Pros**:
    -   Enables natural household financial flows (reimbursements, allowances).
    -   Maintains security of the *source* account (cannot drain partner's account).
-   **Cons**:
    -   Users can "spam" a partner's account with weird transactions (low risk, audit trail exists).
    -   Does not solve "Requesting" money, only sending.

## Red Team Analysis (Report 016)
**Date**: 2026-02-07
-   **Security**: The "Robin Hood" attack (stealing from partner) is blocked by the source ownership check.
-   **Spam Risk**: Identified risk of transaction spamming (e.g., 100x $0.01 transfers).
    -   *Mitigation*: Relies on infrastructure-level rate limiting (WAF/Vercel) rather than application logic for MVP.
-   **Audit Trail**: "Blind Dumping" (hiding assets) is mitigated because the transfer remains visible as an outflow in the sender's history.

## References
-   [Red Team Report 016](../RedTeam/016-household-transfers.md)
