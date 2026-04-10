# Mission Statement: Budget Integral Visualization

## Mission
To **unify** target financial constraints with projective cash flow models for **Sovereign Households** by **integrating aggregated budget limits** directly into the Cash Flow Spreadsheet's outflow matrix.

## Functional Scope
*   **Data Aggregation**: Extract active monthly budget limits from the database within the `getDetailedCashFlow` server action.
*   **Dimensional Alignment**: Map aggregated budget totals across the 12-month projection timeline.
*   **UI Integration**: Inject a "Total Budget Limits" row into the "Outflows" section of the Cash Flow Spreadsheet.
*   **Visual Parity**: Match the logic used in the "Monthly Snapshot" card to ensure data consistency between summary views and detailed spreadsheets.

## Anti-Objectives
*   **Transactional Rebranding**: Do not modify the underlying historical transaction ledger.
*   **Budget Management UI**: Do not add forms for editing budgets within the spreadsheet view.
*   **Projection Logic Alteration**: Do not change the calculation of the "Net Flow" or "Projected Balance" categories, as budget limits are for visualization/comparison, not fixed expenditures.
