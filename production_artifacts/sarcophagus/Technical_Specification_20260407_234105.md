# Technical Specification: Granular Cash Flow Visualization

## Tech Stack
*   **Engine**: Next.js 16.1.4 (Turbopack)
*   **UI Framework**: Shadcn UI + Tailwind CSS (Amber-styled modifiers)
*   **Data Logic**: TypeScript + Decimal.js (Preserving precision across splits)
*   **Sovereignty Layer**: Prisma ORM (RecurringFlow identity preservation)

## Directory Topology
*   `app_build/core/`:
    *   `src/domain/projections/service.ts`: Updated to include `flowBreakdown` in `ProjectionPoint`.
*   `app_build/edge/`:
    *   `src/server/actions/cashflow.ts`: Orchestration layer to map individual flow streams into the `DetailedCashFlow` UI structure.
    *   `src/components/planning/cash-flow-table.tsx`: UI layer to render dynamic line items.

## Data Schema (Modified Logic)
*   **ProjectionPoint Extension**:
    ```typescript
    export interface ProjectionPoint {
      date: Date
      inflow: Decimal
      outflow: Decimal
      balance: Decimal
      breakdown: {
        name: string
        amount: Decimal
        type: 'INCOME' | 'EXPENSE'
      }[]
    }
    ```
*   **Transformation Engine**:
    *   The `getDetailedCashFlow` action will now iterate through the `breakdown` arrays of the projection points to assemble individual row data for EVERY unique flow name.

## Core Invariants
*   **Summative Integrity**: The sum of all individual line items MUST EQUAL the `Total Inflow/Outflow (Hardened)` values exactly.
*   **Unlabeled Buffer**: Any "Variable Buffer" derived from ledger history that does not match a user-defined flow name must be rendered as a "System Margin (Ledger-Derived)" row to preserve the 100% integrity score.

---
**Do you approve this architecture and topology?**
"Yes" or "Approved" to proceed to Phase 3.
