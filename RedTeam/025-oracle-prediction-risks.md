# Red Team Report: Project Oracle (Wealth Prediction Risks)

**Date**: 2026-02-07
**Component**: Wealth Engine & Simulator
**Risk Level**: Medium (User Trust / liability)

## 1. Executive Summary
Project Oracle introduces "Future State" predictions. Unlike historical records (which are factual), predictions are probabilistic. The primary risk is **Optimism Bias** leading to poor financial decisions by the user, and **Liability** if the user treats simulations as guaranteed financial advice.

## 2. Identified Risks

### 2.1 The "Happy Path" Trap (Optimism Bias)
-   **Risk**: Users may see the "Median" line (Deterministic) as a guarantee.
-   **Impact**: User under-saves, assuming 7% returns are constant.
-   **Mitigation**:
    -   **Cone of Uncertainty**: We explicitly visualize P10 (Bad Case) and P90 (Good Case).
    -   **Default Volatility**: We default to 15% volatility (S&P 500 standard) rather than 0% or low volatility, forcing the user to see the "jagged" nature of reality.

### 2.2 Inflation Misunderstanding
-   **Risk**: Users confusing "Nominal" vs "Real" dollars. $1M in 2055 is worth much less than $1M today.
-   **Impact**: User hits their "Number" nominally but fails in purchasing power.
-   **Mitigation**:
    -   **UI Labeling**: All inputs/outputs should be labeled as "Real (Inflation-Adjusted) Returns".
    -   **Default Rate**: Default return is set to 7% (Real) rather than 10% (Nominal S&P average), baking in ~3% inflation automatically.

### 2.3 Model "Explosion"
-   **Risk**: Strategy returning ridiculous numbers (e.g., user inputs 100% monthly return).
-   **Impact**: NaN or Infinity values crash the UI.
-   **Mitigation**:
    -   [Pending] Input capping on `WealthSimulator` (Max return: 1000%, Max duration: 100 years).

## 3. Required Actions
1.  **Add Disclaimers**: The UI must state "Simulations are for educational purposes only."
2.  **Input Capping**: Restrict Return % inputs to reasonable bounds (-99% to +500%).
3.  **Mobile Sensitivity**: Ensure the chart doesn't break on small screens (Verified via ResponsiveContainer).

## 4. Verdict
**Approved for Release**, provided Disclaimers are visible.
