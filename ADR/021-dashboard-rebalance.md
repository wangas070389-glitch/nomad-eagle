# ADR 021: Dashboard Metrics Rebalance

## Status
Accepted

## Context
The previous dashboard layout used a 4-column grid for metrics cards. With only two metrics ("Household Cash" and "Investments"), this left significant empty whitespace on large screens, creating an unbalanced and "unfinished" look. Users requested a "rebalance" of this section.

## Decision
We have shifted the dashboard top-section layout to a **3-Column Grid** and introduced a third metric card: **Net Worth**.

### 1. 3-Column Grid
-   **Change**: `grid-cols-4` -> `grid-cols-3`.
-   **Reasoning**: Three cards provide a symmetrical, balanced look that fills the width effectively on standard desktop screens (1080p+).

### 2. Net Worth Metric
-   **Definition**: A calculated value representing the sum of "Household Cash" (USD) and "Investments" (converted to USD).
-   **Visualization**: Displayed in the third slot.
-   **Value**: Provides an immediate "bottom line" number for the user's financial health, aggregating their liquid and invested assets.

## Implementation
-   **File**: `src/app/(dashboard)/page.tsx`
-   **Logic**:
    -   `Cash (USD)` + `(Investments (MXN) / ExchangeRate)` = `Net Worth (USD)`
    -   No persistent storage required; calculated on-the-fly during page render.

## Consequences
-   **Pros**:
    -   Visually balanced dashboard.
    -   High-value "Net Worth" insight immediately visible.
    -   Reduces "empty state" feeling.
-   **Cons**:
    -   Relies on the investment exchange rate being accurate for the Net Worth total to be meaningful.
