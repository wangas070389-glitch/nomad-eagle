# Mission Statement: Real-Time Deterministic Net Cashflow

## Mission
To architect a **Real-Time Solvency Engine** that eliminates financial ambiguity by enforcing a **Dynamic Inflow Override**. The objective is to calculate **Net Cashflow** using a binary priority logic: substituting "Planned" placeholders with "Actual" realized capital the moment it is confirmed. 

## Objectives
- **Component-Level Replacement**: For any Inflow Entity ($i$), the system must prioritize forensic evidence ($Actual_i$) over strategic hypothesis ($Planned_i$).
- **Calculated Aggregate Headers**: The `Σ Total Income` and `Net Flow Projection` rows must be computed dynamically as a function of the hardened entity values, not as static sums of the plan.
- **Forensic Accuracy**: Ensure the system's primary KPI—**Liquid Net Flow**—is a forensic reflection of current-month reality.

## Functional Scope
- **Dynamic Variable Inflow**: Implement the logic: $Value_i = Actual_i > 0 ? Actual_i : Planned_i$.
- **Reactive Summary Rows**: The header rows in the Cash Flow spreadsheet must update in real-time as transactions are added/reconciled.
- **Visual Hardening**: Distinguish between "Aspirational" (Planned) capital and "Realized" (Actual) capital in the summary views.

## Anti-Objectives
- **Ghost Capital Accumulation**: The system MUST NOT sum both planned and actual values for the same entity in the same month.
- **Static Summaries**: Header rows MUST NOT remain static if their children have realized actuals.
