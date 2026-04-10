# Technical Specification: Budget Integral Visualization

## Tech Stack
*   **Engine**: Next.js 16.1.4 (Turbopack)
*   **Sovereignty Layer**: Prisma ORM (PostgreSQL)
*   **UI Framework**: Tailwind CSS + Shadcn UI
*   **Data Logic**: TypeScript 5.x + Decimal.js (High-precision finance)

## Directory Topology
*   `app_build/core/`:
    *   (Existing) `ProjectionDomainService`: Mathematical engine for cash flow trajectories.
*   `app_build/edge/`:
    *   `src/server/actions/cashflow.ts`: Orchestration layer responsible for fetching budget limits and formatting spreadsheet rows.
    *   `src/components/planning/cash-flow-table.tsx`: UI layer for rendering the outflows matrix.

## Data Schema (Modified Logic)
*   **Source**: `prisma.budgetLimit` (Monthly period constraints).
*   **Transformation**:
    1.  Fetch all active `BudgetLimit` objects for the Household.
    2.  Aggregate `amount` into a single `TotalBudgetLimits` value.
    3.  Generate a 12-month array where each element = `TotalBudgetLimits`.
    4.  Append as a `CashFlowRow` named "Target Budget Limits" to the `outflows` collection.

## Core Invariants
*   **Summation Neutrality**: Budget limits are "soft caps" and MUST NOT be subtracted from the `Net Flow` calculation. The `Net Flow` remains purely based on `Total Inflow (Hardened)` and `Total Outflow (Hardened)`.
*   **Currency Precision**: All budget aggregations must use `Decimal.js` before being cast to numbers for the frontend to prevent floating-point drift in large-scale projections.

---
**Do you approve this architecture and topology?**
"Yes" or "Approved" to proceed to Phase 3.
