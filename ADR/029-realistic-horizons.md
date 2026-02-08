# ADR 029: Realistic Time Horizons (Project Oracle)

## Status
Accepted

## Context
Project Oracle's initial default of 30-year projections is "optimistic fiction".
-   **Problem**: Predicting wealth 30 years out is mathematically possible but practically useless due to massive cone of uncertainty. It encourages "dreaming" rather than "planning".
-   **Request**: "We have to be realistic... 1yr projection, 3 yrs projection and 5 yrs projection, no more than that."

## Decision
We will **restrict** the Wealth Simulator to three distinct, short-to-medium term horizons.

### 1. Horizons
-   **1 Year (Tactical)**: Focus on immediate liquidity and short-term goals.
-   **3 Years (Strategic)**: Focus on medium-term growth and stability.
-   **5 Years (Visionary)**: The maximum realistic horizon for a personal financial plan.

### 2. Implementation
-   **UI**: Replace any sliders/inputs for duration with a strictly enforced **Toggle/Selector**: `[1Y | 3Y | 5Y]`.
-   **Default**: 1 Year (Immediate realism).

## Consequences
-   **Realism**: Users focus on what they can actually control in the near future.
-   **Reduced Anxiety**: Smaller numbers and tighter uncertainty cones look less daunting/speculative.
