# 10. Temporal Budgeting (Protocol 32)

Date: 2026-02-07

## Status

Proposed

## Context

**Current State**: `BudgetLimit` is a static configuration table. It stores "The Limit for Groceries is $500". It does not store "The Limit for Groceries in Jan 2024 was $400".
**Problem**:
1.  **No History**: Changing a budget today changes it for the past. Performance reports for last month are inaccurate if the budget changed.
2.  **No "Reset"**: Users feel the budget doesn't "reset" because there is no record of "This Month's Budget" vs "Last Month's Budget".

## Decision

We will evolve the budgeting system from **Static Configuration** to **Temporal Records** (Time-Series).

### Option A: Snapshotting (Recommended)
Retain `BudgetLimit` as the "Active Plan", but create a `BudgetSnapshot` table that records the performance at the end of every month.
-   *Pros*: Simple query for current month. History is immutable.
-   *Cons*: Requires a cron job or "lazy" snapshotting when a user visits.

### Option B: Time-Series Limits
Add `month` (Date) to `BudgetLimit`.
-   `BudgetLimit { amount: 500, month: "2024-02-01" }`
-   *Pros*: Infinite flexibility.
-   *Cons*: Copying limits forward to new months is tedious (Manual or Automated).

### Protocol 32 Recommendation: "The Ledger of Plans" (Modified Option B)
We will treat Budgets like Transactions. They happen in time.
1.  **Schema Change**: Change `BudgetLimit` unique constraint from `[categoryId, period]` to `[categoryId, period, effectiveDate]`.
2.  **UX Logic**:
    -   When viewing "February", we fetch limits where `effectiveDate <= Feb 1` (latest one wins).
    -   Or, we explicitly clone the previous month's budget to the new month upon first visit (Lazy Migration).

## Implementation Plan (Adaptive Budgeting)

1.  **Schema**: Add `createdAt` / `effectiveDate` management.
2.  **Performance Check**: A generic function `getBudgetPerformance(householdId, month)` that:
    -   Sum transactions for that month.
    -   Compare against the *Budget Limit active at that time*.

## Consequences

-   **Accuracy**: Historical reports become immutable and correct.
-   **Complexity**: Querying "Current Budget" requires sorting by date.
