# Technical Specification: Real-Time Deterministic Net Cashflow

## Tech Stack
- **Language**: TypeScript (v5+)
- **Computation**: Decimal.js for precise financial variance calculations
- **Architecture**: Domain-Driven Design (Relational Pulse)

## Directory Topology
- `src/domain/projections/service.ts` (The Core): Refactor `ProjectionPoint` to support a `hardenedAmount` field.
- `src/server/actions/cashflow.ts` (The Edge): Refactor the spreadsheet transformation logic to calculate reactive summary rows.

## Hardening Logic: Binary Priority Replacement
The engine MUST enforce a forensic override in the `getDetailedCashFlow` server action:
1. **Reconciliation Loop**: Iterate through all child rows (Inflows).
2. **Override**: For the "Current Month" column, check for linked transactions.
3. **Hardening**: If $Actual > 0$, set $HardenedValue = Actual$. Else, use $Planned$.
4. **Reactive Summary**: The `Σ Total Income`, `Σ Total Expenses`, and `Net Flow Projection` header rows MUST be re-calculated as the final sum of these hardened values, not as a static plan sum.

## Data Structure Refinement
`CashFlowRow.values` currently stores a list of numbers or `ReconciliationCell`. 
Refactor: The "Current Month" index (0) in the summary arrays (`summary.totalIncome`, `summary.netFlow`) must be derived from the computed sum of the child rows' hardened values.

## Core Invariants
- **Dynamic Summation**: Header rows are derivative, not primary. 
- **Deterministic Truth**: In the current cycle, forensic evidence (Actuals) always outranks strategic intent (Planned).
- **Zero Ghosting**: Actual and Planned values for the same entity cannot coexist in the summation of a single month.
