# ADR 027: Separation of Budgeting and Wealth Simulation

## Status
Accepted

## Context
Initially, the **Wealth Simulator** (Project Oracle) was integrated into the **Plan Page** (`/plan`) alongside the budgeting tools (Income/Expense flows).
-   **Problem**: Users found this mixed view confusing. "Budgeting" (Short-term, Operational) and "Wealth Simulation" (Long-term, Strategic) are distinct mental modes.
-   **Feedback**: "It isn't clear, rollback this and separate them."

## Decision
We will enforce a strict **Separation of Concerns** between Operational and Strategic Finance.

### 1. Plan Page (`/plan`)
-   **Focus**: Operational Finance (Monthly Cash Flow).
-   **Time Horizon**: Current Month to 1 Year.
-   **Components**: Recurring Flows, Budget Limits, Cash Flow Table (Spreadsheet).
-   **Goal**: "Am I positive this month?"

### 2. Wealth Page (`/wealth`)
-   **Focus**: Strategic Finance (Net Worth Projection).
-   **Time Horizon**: 1 Year to 30+ Years.
-   **Components**: Wealth Simulator, Monte Carlo Cone, Investment Strategies.
-   **Goal**: "When can I retire?"

## Implementation
-   **Remove** `WealthSimulator` from `src/app/(dashboard)/plan/page.tsx`.
-   **Retain** `WealthSimulator` exclusively in `src/app/(dashboard)/wealth/page.tsx`.
-   **Navigation**: Keep distinct links in the sidebar/header.

## Consequences
-   **Clarity**: Reduced cognitive load for the user.
-   **Focus**: Each page has a single, clear purpose.
-   **Code Removal**: The `/plan` page code becomes simpler (no need for `strategies` state or complex simulation props).
