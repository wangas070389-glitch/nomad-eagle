# Technical Specification: High-Friction Deterministic Allocation Engine

## Tech Stack
*   **Engine**: Next.js 16.1.4 (Turbopack)
*   **Database**: Neon Postgres (Prisma ORM)
*   **Precision**: Decimal.js for global recursive wealth impacts.

## Database Schema Upgrade: The Relational Bridge
The current schema identifies categories but lacks the **Atomic UUID Linkage** required for deterministic reconciliation. 

### 1. [REFACTOR] Transaction Model
We will implement an optional polymorphic-style link in the `Transaction` table to support strict mapping.
*   **New Migration**: Add `plannedItemId String?` to `Transaction`.
*   **New Relationship**: This will serve as a **logical foreign key** to either a `BudgetLimit.id` or a `RecurringFlow.id`.

### 2. The "PlannedItem" Abstraction
To support the **Triple View** (Planned vs Actual vs Remaining) across diverse types (Fixed Expenses vs variable Limits), we will implement a unified server-side resolver.

## Architectural Physics: The Deterministic Loop
Every `POST /api/transactions` will trigger a **Global Recalculation Event**.

### Logic Flow:
1.  **Friction-Check**: UI forces selection of a `plannedItemId` from a hierarchical dropdown (Categorized by Atomic Entity).
2.  **Solvency Adjustment**: 
    -   Lookup: $E_{limit}$ (The pre-authorized boundary).
    -   Aggregate: $\sum T_{actual}$ (All transactions linked to this UUID in the current period).
    -   Calculate: $E_{remaining} = E_{limit} - \sum T_{actual}$.
3.  **Future wealth recalibration**: The core projection engine recalculates the 2045 balance using the new delta.

## Directory Topology
*   `app_build/core/`:
    *   `src/domain/reconciliation/engine.ts`: Logic for calculating entity variance.
*   `app_build/edge/`:
    *   `src/app/api/transactions/route.ts`: API endpoint enforcing mandatory linkage.
    *   `src/components/ledger/manual-entry-form.tsx`: High-Friction UI with the relationship selector.

---
**Do you approve this architecture and topology?**
"Yes" or "Approved" to proceed to Phase 3.
