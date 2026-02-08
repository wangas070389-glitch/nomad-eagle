# ADR 024: Simulation UI & Interaction

## Status
Proposed

## Context
Financial simulations can be overwhelming. Users (non-experts) need to understand "When can I stop working?" without getting lost in charts.
-   **Problem**: Raw Monte Carlo data (1000 lines) is noisy and confusing.
-   **Goal**: A UI that answers "When?" (Freedom Date) and "How likely?" (Confidence Interval).

## Decision
We will remove the current static text placeholder and replace it with an **Interactive Wealth Simulator**.

### 1. The Output: "The Freedom Chart"
-   **Visual**: Area Chart (Recharts).
    -   **X-Axis**: Time (Years).
    -   **Y-Axis**: Net Worth ($).
    -   **Areas**:
        -   **Optimistic (Green)**: 90th Percentile -> Median.
        -   **Pessimistic (Red/Orange)**: Median -> 10th Percentile.
        -   **Target Line**: Horizontal line at "Financial Independence Number" (Monthly Expenses * 300 [4% Rule]).
-   **Interaction**: Hovering shows values for that year.

### 2. The Input: "The Control Panel"
-   **Location**: Sidebar or Top Bar (Global Controls).
-   **Inputs (Sliders)**:
    -   **Contribution**: Default to current `Income - Expenses`. Range: 0 to `Income`.
    -   **Risk/Return**: A simplified "Risk Profile" toggle (Conservative/Moderate/Aggressive) mapping to preset Mean/Volatilities.
        -   *Conservative*: 4% Return, 5% Vol.
        -   *Moderate*: 7% Return, 15% Vol.
        -   *Aggressive*: 10% Return, 25% Vol.

### 3. The "Freedom Date" Badge
-   A prominent badge showing the calculated crossover date (where 10th Percentile > Target Number).
-   Example: "Freedom Date: Aug 2038 (12 Years)".

## Implementation Details
-   **Components**: `WealthSimulator`, `SimulationControls`.
-   **State**: Local React State (or URL param for shareability).
-   **Library**: `recharts` (already in use).

## Consequences
-   **Pros**: Gamifies savings ("If I save $500 more, I retire 2 years earlier!").
-   **Cons**: Requires careful mobile responsiveness optimization for the chart.

## Addendum: Red Team Mitigations (Report 025)
To mitigate liability and user misunderstanding:
1.  **Mandatory Disclaimer**: The UI MUST prominently display "Simulations are for educational purposes only. Not financial advice."
2.  **Labeling**: All Rate inputs must be labeled "Real Return (Inflation Adjusted)" to prevent users from double-counting inflation.
3.  **Visualization**: The "Cone of Uncertainty" (P10/P90) is **MANDATORY**, not optional. We must never show a single deterministic line alone.
