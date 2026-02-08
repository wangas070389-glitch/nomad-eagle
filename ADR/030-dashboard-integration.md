# ADR 030: Dashboard Integration (Cash Flow vs Wealth)

## Status
Accepted

## Context
The Dashboard currently displays the **Wealth Simulator** (Strategic/Stochastic).
-   **Problem**: The Dashboard is the "Command Center" for daily/weekly operations. Users log in to check status, not to dream about 30-year horizons (which belongs on `/wealth`).
-   **Request**: "Here has to be the projected cashflow from the plan."
-   **Misalignment**: Showing a long-term Monte Carlo simulation on the main dashboard distracts from immediate liquidity management.

## Decision
We will **replace** the Wealth Simulator on the Dashboard with the **Cash Flow Projection** (from ADR 028).

### 1. Component Swap
-   **Remove**: `WealthSimulator` (Strategy Engine).
-   **Add**: `CashFlowChart` (Accumulative Liquidity).

### 2. Data Strategy
-   **Source**: `getDetailedCashFlow` (The functionality powering `/plan`).
-   **Integration**: Server-side fetching in `DashboardPage` to ensure instant rendering (no loading spinners) and pass data to the chart component.

## Consequences
-   **Focus**: Dashboard becomes tactical (Liquidity/Runway focus).
-   **Consistency**: The "Projected Balance" graph on the Dashboard matches the "Plan" page exactly.
-   **Performance**: Server-side fetching improves First Contentful Paint (FCP).

## Addendum (Size Correction)
**Request**: "Correct the size for just to fit the graph."
-   **Decision**: Reduced the chart height on the Dashboard from default `400px` to **250px**.
-   **Rationale**: The Dashboard is dense with information. The chart should be a quick visual check ("Am I running out of money?"), not a deep analysis tool. Deep analysis remains on `/plan` (400px).

## Addendum (Analytical Review)
**Observation**: "Plan graph overflowing in Y-axis."
-   **Diagnosis**: Default Recharts config didn't reserve fixed width for Y-Axis labels, causing potential clipping of large currency values on smaller screens.
-   **Fix**:
    -   Set explicit `YAxis width={60}`.
    -   Adjusted `margin` to `{ top: 10, right: 30, left: 0, bottom: 0 }` to balance the layout.
    -   Moved Legend to `verticalAlign="top"` to save vertical space for the graph.

## Addendum (Visual Fit)
**Feedback**: Image showed chart container stretching or having excessive whitespace.
-   **Fix**:
    -   Removed `h-full` from `CashFlowChart` root Card (prevented unwanted grid stretching).
    -   Tightened explicit height to **200px** "just to fit the graph".
