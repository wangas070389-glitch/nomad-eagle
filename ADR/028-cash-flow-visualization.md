# ADR 028: Operational Cash Flow Visualization

## Status
Accepted

## Context
After separating the **Wealth Simulator** (Strategic) from the **Plan Page** (Operational) in [ADR 027](ADR/027-separation-plan-wealth.md), the Plan Page now focuses solely on monthly cash flow management.
-   **Problem**: The current "Spreadsheet" view is excellent for detail but poor for trends. Users cannot easily see if their net flow is improving or declining over the year.
-   **Request**: "I also want my cashflow projection to be visualized as table and graph."

## Decision
We will upgrade the **Plan Page** to include a dual-view visualization of the Operational Budget.

### 1. Visualization Strategy
-   **Component**: `CashFlowVisualizer` (Wrapper)
-   **Views**:
    -   **Table**: The existing `CashFlowTable` (Detailed row-by-row breakdown).
    -   **Chart**: A new Composed Chart (Recharts) showing:
        -   **Bars**: Income (Green) and Expenses (Red).
        -   **Line**: Net Flow (Black/Bold), showing the "Hump" of liquidity.

### 2. Data Source
-   Both views will consume the same `DetailedCashFlow` object fetched from `getDetailedCashFlow`.
-   **No new API calls required**: The existing server action already returns 12 months of projected data arrays.

## Implementation
-   Create `src/components/planning/cash-flow-chart.tsx`.
-   Update `src/app/(dashboard)/plan/page.tsx` to include a Tab switcher (Visual | Spreadsheet) similar to the old design, but scoped strictly to *Cash Flow* (not Wealth).

## Consequences
-   **Insight**: Users can instantly spot liquidity gaps (negative months) visually.
-   **Consistency**: Restores the "Visual vs Spreadsheet" pattern users liked, but applied to the correct domain (Budgeting).

## Addendum (Visual Refinement)
**Request**: "It has to be an accumulative graph, and make it aesthetic with the colors of the app."

### Decision
-   **Chart Type**: Switch from Discrete Bar Chart (Monthly Flow) to **Accumulative Area Chart** (Projected Balance).
-   **Rationale**: Users care more about their *growing liquidity* (Runway) than individual monthly ups/downs.
-   **Aesthetics**: Use the application's **Violet/Indigo** brand palette with gradients, dropping the generic Red/Green bars.

