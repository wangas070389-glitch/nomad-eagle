# Technical Specification: Locked Planner Sovereignty

## Tech Stack
- **Language**: TypeScript (v5+)
- **ORM**: Prisma (PostgreSQL)
- **Math**: Decimal.js for financial precision
- **Architecture**: Domain-Driven Design (Relational Pulse)

## Directory Topology
Following a strict physical boundary:
- `src/domain/projections/`: The **Core**. Pure mathematical engine for future solvency simulation.
- `src/server/actions/cashflow.ts`: The **Edge**. I/O boundary that fetches database state and transforms domain points into UI-safe spreadsheet rows.
- `src/components/planning/`: The **View**. React components for deterministic spreadsheet rendering.

## Data Schema
Refining the use of existing models:
- **`RecurringFlow`**: primary source for "Income Planner" and "Expense Planner" rows.
- **`BudgetLimit`**: primary source for "Budget Caps" (liability) rows.
- **`Transaction`**: used ONLY for reconciliation where `recurringFlowId` or `budgetLimitId` is present.

## Core Invariants
1. **Source of Truth**: The spreadsheet MUST NOT generate any row that does not correlate 1:1 with an entity in the Planner database (Flows or Limits).
2. **Heuristic Exclusion**: The `ProjectionDomainService` MUST be stripped of historical averaging logic (System Margin) to ensure absolute determinism.
3. **Reconciliation Strictness**: Tactical "Actuals" in the current month column MUST only be summed from Transactions that have an explicit `recurringFlowId` or `budgetLimitId` handshake. Unlinked transactions are mathematically ignored in the planning view.

## Execution Topology
- **Core Update**: Refactor `ProjectionDomainService.generateHardenedProjection` to remove `getHistoricalAverages`.
- **Edge Update**: Refactor `getDetailedCashFlow` to strictly map domain breakdown items to physical planner IDs.
