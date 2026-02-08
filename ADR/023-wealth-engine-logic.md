# ADR 023: Wealth Engine Logic

## Status
Proposed

## Context
Project Oracle aims to shift Nomad Eagle to a "System of Insight" by predicting future wealth. We need a mathematical model for this.
-   **Problem**: Simple linear projections (`Current + (Contribution * Month)`) ignore market volatility and compound interest ("Sequence of Returns Risk").
-   **Goal**: Provide a realistic, probability-based forecast of wealth over time.

## Decision
We will implement a **Multi-Strategy Client-Side Simulation Engine**.

### 1. The "Strategy" Concept
Instead of a single global return rate, the engine will accept an array of `Strategy` objects. This allows modeling a diverse portfolio (e.g., "Safe Bucket" vs "Growth Bucket").
-   **Structure**:
    -   `currentBalance`: Amount currently in this bucket (from user input or mapped from accounts).
    -   `monthlyContribution`: How much of the monthly surplus goes here.
    -   `returnMean`: Expected annual return (e.g., 11% for CETES).
    -   `volatility`: Standard deviation (e.g., 1% for CETES, 18% for Bitcoin).

### 2. Simulation Logic
The engine will simulate each strategy *independently* and aggregate the results for the Total Net Worth.
-   **Loop**: For each Month (0..N):
    -   **For each Strategy**:
        -   Calculate interest/growth (Deterministic or Stochastic).
        -   Add specific `monthlyContribution`.
        -   Update `currentBalance`.
    -   **Aggregate**: Sum all `currentBalances` to get `TotalNetWorth` for that month.

### 3. Modes
-   **Deterministic**: Uses `returnMean` for all strategies.
-   **Stochastic (Monte Carlo)**: Applies generic Brownian motion to *each* strategy independently.
    -   *Note*: This assumes zero correlation between assets (simplification), which actually *underestimates* risk (Correlations tend to 1 in crises), but is acceptably conservative for a personal tool.

## Implementation Details
-   **Language**: TypeScript (in `/lib/wealth-engine.ts`).
-   **Inputs**:
    ```typescript
    interface SimulationRequest {
        strategies: {
            id: string;
            name: string; // "CETES", "S&P 500"
            balance: number;
            contribution: number;
            returnMean: number;
            returnVol: number;
        }[];
        durationMonths: number;
    }
    ```
-   **Performance**: Still trivial. 5 strategies * 1000 iter * 360 months = 1.8M ops. < 100ms.

## Consequences
-   **Pros**:
    -   Supports "Bucketing" (Mental Accounting).
    -   Allows realistic scenarios like "I keep 50% in Safe Assets/CETES and 50% in Stocks".
-   **Cons**:
    -   UI becomes more complex (need a way to add/edit strategies and split contributions).

## Addendum: Red Team Mitigations (Report 025)
To address "Optimism Bias" and "Model Explosion", the following constraints are adopted:
1.  **Default Volatility**: The engine MUST default new strategies to **0.15 (15%)** volatility (S&P 500 standard) to force users to visualize risk. 0% volatility should only be used for Cash/Bonds.
2.  **Real Returns**: All calculations use **Real Rates** (Nominal - Inflation). The default return is **0.07 (7%)**, not 10%.
3.  **Input Capping**: The engine logic *should* gracefully handle or reject inputs > 1000% return to prevent numerical overflows (`Infinity`).
