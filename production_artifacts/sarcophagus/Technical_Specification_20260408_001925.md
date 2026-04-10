# Technical Specification: Household Financial Solvency Engine

## Tech Stack
*   **Engine**: Next.js 16.1.4 (Turbopack)
*   **Logic**: TypeScript + Decimal.js (Multi-decimal precision for solvency floors)
*   **Infrastructure**: Neon Serverless Postgres + Prisma (Ledger-backed identity)

## Directory Topology
*   `app_build/core/`:
    *   `src/domain/projections/service.ts`: Update `generateHardenedProjection` to treat budget limits as high-priority liabilities.
*   `app_build/edge/`:
    *   `src/server/actions/cashflow.ts`: Orchestrate the extraction of `BudgetLimit` models into the projection engine.

## Architectural Physics: The Solvency Algorithm
The engine will transition from probabilistic tracking to deterministic floor projection.

### 1. Hardened Variable Calculation
The engine will no longer rely solely on historical averages for projected outflows. 
**Formula**: `ProjectedOutflow = Outflow_fixed + MAX(ΣBudgetLimits, HistoricalAverage_outflow)`
*   This ensures that even if historical spending is low, the "Floor" reflects the maximum authorized risk.
*   `NetFlow = Inflow_min - ProjectedOutflow`

### 2. Implementation Logic (ProjectionDomainService)
*   **Input**: Expand `generateHardenedProjection` to accept `budgetLimits: { name: string, amount: Decimal }[]`.
*   **Execution**: Inside the monthly loop, the engine will:
    1. Sum all $Inflow$.
    2. Sum all $FixedOutflow$.
    3. Sum all $BudgetLimits$.
    4. Apply the Solvency Formula.
    5. Append $BudgetLimits$ to the `breakdown` array to ensure UI transparency.

### 3. State Variance Management
*   The UI must clearly communicate that the "Projected Balance" is now a **Deterministic Floor**.

---
**Do you approve this architecture and topology?**
"Yes" or "Approved" to proceed to Phase 3.
