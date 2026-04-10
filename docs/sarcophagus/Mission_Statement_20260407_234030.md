# Mission Statement: Granular Cash Flow Visualization

## Mission
To **deconstruct** aggregated financial models into **granular line-item histories** for **Sovereign Households** by **splitting inflows and outflows** into individual source/category rows within the Cash Flow Spreadsheet.

## Functional Scope
*   **Dimensional Expansion**: Refactor the server-side projection logic to preserve individual `RecurringFlow` identity instead of pre-aggregating into category totals.
*   **Label Mapping**: Map specific names (e.g., "Sueldo Carlos", "Guarderia Niñas") to their respective projection streams.
*   **UI Hierarchy**: Render individual rows for each inflow and outflow source while maintaining the "Total" summary rows for mathematical grounding.
*   **Dynamic Scaling**: Support households with varying numbers of income streams and expense categories without layout degradation.

## Anti-Objectives
*   **Historical Ledger Split**: Do not attempt to split historical transactions in this view; focus purely on the *projective* model (the future spreadsheet).
*   **Manual Entry UI**: Do not add input fields to the spreadsheet cells.
*   **Tax/Deduction Logic**: Do not implement automatic tax calculations or secondary splits unless explicitly defined in the underlying `RecurringFlow` model.
