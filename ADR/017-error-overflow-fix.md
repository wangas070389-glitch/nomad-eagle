# 17. Error Visibility & Dialog Overflow Fix

Date: 2026-02-07

## Status

Accepted

## Context

**Problem 1: Generic Transaction Failure**
User reports receiving a "Transaction failed" error when attempting a household transfer.
-   The current code catches all exceptions and returns a generic string: `return { error: "Transaction failed" }`.
-   This makes debugging impossible without access to server logs.
-   The validation logic (`zod`) seems to pass (otherwise "Invalid input" would be returned), implying a database-level exception (e.g., Foreign Key constraint, triggers, or specific data issues).

**Problem 2: UI Overflow**
The "Add Transaction" dialog is overflowing the viewport on some screens, causing buttons/inputs to be cut off or "overflow from the box".
-   The current dialog does not explicit enforce scrollability for tall content (like the transfer form with multiple dropdowns).

## Decision

### 1. Enhanced Error Reporting
We will modify the `createTransaction` action to return the specific error message from the exception.
-   **Old**: `return { error: "Transaction failed" }`
-   **New**: `return { error: e instanceof Error ? e.message : "Transaction failed" }`
-   *Security Note*: In production, this can leak internal details, but for this internal tool/MVP, observability is priority.

### 2. Dialog Layout Fix
We will update the `TransactionDialog` styling to ensure it fits within the viewport.
-   **Action**: Apply `max-h-[85vh]` and `overflow-y-auto` to the `DialogContent`.
-   **Action**: Ensure inputs have consistent width and don't force horizontal scroll.

### 3. Verification of Data Integrity
We will verify if `spentByUserId` or `householdId` usage in `prisma.create` is causing relation errors.

## Consequences

-   **Pros**: Immediate visibility into the root cause of the transfer failure. Better UX on smaller screens.
-   **Cons**: Minor security risk exposing DB error messages (acceptable for current stage).

---

## Addendum: Decoupled AI Embedding Pattern (2026-02-07)
The `25P02` (current transaction is aborted) error persisted for strict Income/Expense transactions. We have established a **System-Wide Pattern** for AI Embeddings:

> **Decision**: AI Embedding generation MUST occur **outside** the primary database transaction block.

### Implementation Pattern
1.  **DB Transaction**: Validate logic -> Create Record -> Update Balances -> Commit.
2.  **Async/Post-Commit**: Generate Embedding -> Update Record with Vector.
3.  **Failure Handling**: If embedding fails, the transaction remains valid. The record will simply lack vector search capability until a background job (future) retries it. This prioritizes Data Integrity over AI features.
