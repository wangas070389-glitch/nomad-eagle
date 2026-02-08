# Protocol 32 Report: Phase 2 Strategic Evolution

**Date**: 2026-02-07
**Executor**: The Architect
**Context**: "System of Record" established. Household support active. Vector Search enabled.

## 1. Wardley Map Analysis (Phase 2)

| Component | Stage | Evolution Trend | Status |
| :--- | :--- | :--- | :--- |
| **Transaction Storage** | Product | -> Commodity | **Stable**. Core CRUD is robust. |
| **Search / Querying** | Product | -> Commodity | **Advanced**. Semantic Search implemented (ADR 0009). |
| **Household Mgmt** | Product | -> Commodity | **Stable**. Trusted Household model active (ADR 016). |
| **Wealth Projection** | **Genesis** | -> Custom Build | **Blocked**. Currently a placeholder component. |
| **Data Ingestion** | Manual | -> Utility | **Friction**. Manual entry is the bottleneck. |

**Strategic Observation**:
The system is excellent at *looking backward* (What did I spend?) but lacks capability in *looking forward* (Will I be rich?). The "Wealth Projection" component is the missing link to complete the "Nomad Eagle" vision.

## 2. Cynefin Framework Analysis

**Target Domain**: **Complex (Emergent Practice)**
-   **Problem**: "Will I have enough money?" is non-deterministic. It depends on market returns, inflation, savings rate changes, and life events.
-   **Current State**: We are treating this as "Simple" (Static Net Worth card).
-   **Required Response**: **Probe-Sense-Respond**.
    -   *Probe*: Build a simulator that accepts variable inputs (Growth Rate, Monthly Contribution).
    -   *Sense*: Visualize the divergence of outcomes (Best/Worst case).
    -   *Respond*: User adjusts behavior (saves more/spends less) based on the simulation.

## 3. The Proposal: Project "Oracle" (Wealth Engine)

I propose focusing the next architectural leap on **Deterministic & Stochastic Wealth Simulation**.

### Technical Leap
-   **Client-Side Simulation Engine**: Build a lightweight Monte Carlo engine in TypeScript.
-   **Input**:
    -   Current Net Worth (Auto-derived from Dashboard).
    -   Monthly Net Flow (Income - Expense).
    -   Configurable Variables: Market Return (%), Inflation (%), Time Horizon (Years).
-   **Output**:
    -   Interactive Chart (Recharts) showing linear vs compound growth.
    -   "Freedom Date" calculation (Crossover point where Passive Income > Expenses).

### ROI
-   **Value**: Moves the app from a "Passive Tracker" to an "Active Planner".
-   **Cost**: Time (Frontend complexity). Low infrastructure cost (client-side math).

### Alternative Consideration: Automated Data Ingestion (Bank Sync)
-   *Why not this?* Bank Sync (Plaid/Teller) introduces high recurring costs ($$) and massive security scope (handling credentials). For a "Sovereign" app, CSV import or receipt scanning is preferred later. "Oracle" provides higher immediate user value.

## 4. Red Team Preparation (Pre-Analysis)
-   **Risk**: "Optimism Bias". The app might incorrectly tell a user they are safe when they are not.
-   **Control**: Disclaimer requirements. Conservative default assumptions (e.g., 6% growth, 3% inflation).
-   **Risk**: "Data Exposure". Projecting wealth 30 years out creates sensitive data artifacts.
-   **Control**: Simulation parameters should be ephemeral (client-state) or stored encrypted if saved.

## 5. Execution Plan
1.  **ADR 022**: Formalize Project "Oracle".
2.  **Engine Core**: Implement `wealth-engine.ts` (Compound interest logic).
3.  **UI Integration**: Replace the placeholder `WealthSimulator` component with the real engine.
4.  **Verification**: Test with various financial scenarios.
