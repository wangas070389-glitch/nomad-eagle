# Technical Specification: In-Place Relational Pulse

This specification defines the architectural evolution from a bifurcated planning/execution UI to a **Unified In-Place Reconciliation Engine**.

## Tech Stack
*   **Framework**: Next.js 16 (App Router)
*   **Database**: PostgreSQL via Prisma 5.10
*   **Styling**: Tailwind CSS
*   **UI Primitives**: Radix UI (Dialog, Popover, Tooltip)
*   **Mathematics**: Decimal.js for financial precision

## Directory Topology (Sovereign Abstraction)

*   `src/domain/` (**Core**): Pure logic, variance calculus, and relational invariants.
*   `src/components/planning/` (**Edge**): Interactive spreadsheet and reconciliation triggers.
*   `src/server/actions/` (**Edge**): Deterministic I/O and relational enforcement.

## Data Schema Evolution

### [MODIFY] `RecurringFlow`
Enforce relational anchoring for income and expense plans.
*   **NEW** `categoryId`: `String?` (Link to Category for reporting/budgeting).
*   **NEW** `budgetLimitId`: `String?` (Link to a specific budget boundary for threshold enforcement).

### [UNIFIED] `Transaction`
Already contains the necessary Relational Bridge (`budgetLimitId`, `recurringFlowId`).

## Core Invariants

1.  **Deterministic Runway**: `Runway = Planned - Actual`.
2.  **Zero-Orphan Consumption**: Every manual allocation MUST be linked to an atomic entity ID (Flow ID or Limit ID).
3.  **Reflexive Updates**: Logging a transaction must immediately trigger a `revalidatePath("/plan")` to update the deterministic cells.

## Interaction Architecture: "The Pulse"

1.  **Trigger**: User clicks a "Triple View" cell (Planned/Actual/Runway) in the `CashFlowTable`.
2.  **Handshake**: A `QuickReconciliationDialog` appears, pre-populated with:
    *   `plannedItemId` (Contextually derived from the row).
    *   `type` (Contextually derived from the entity).
3.  **Commit**: Submission executes `reconcileManualTransaction` and closes the overlay.
4.  **Consolidation**: The standalone "Manual Allocation" sidebar and complex "Category Budgets" grid are removed/simplified to minimize cognitive drift.

---

## 🛑 HALT: APPROVAL REQUIRED
**Do you approve this architecture and topology? You can modify `Technical_Specification.md` before I proceed.**
