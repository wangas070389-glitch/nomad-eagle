# Mission: Locked Planner Sovereignty

## Mission
To enforce a deterministic capital allocation view for Nomad Eagle users by ensuring the Cash Flow spreadsheet reflects only explicitly authorized strategic planning items.

## Functional Scope
- **Planner-Only Reconciliation**: The Cash Flow spreadsheet MUST exclusively display rows derived from the "Income Planner" and "Expense Planner" (RecurringFlows) and "Budget Caps" (BudgetLimits).
- **Relational Integrity Enforcement**: Any transaction not linked to an existing planner item (recurringFlowId or budgetLimitId) MUST be excluded from the spreadsheet's tactical reconciliation view.
- **System Margin Removal**: Remove all heuristic or "System Margin" historical averages from the spreadsheet to ensure 100% deterministic alignment with the user's intended plan.
- **Categorical Sync**: Ensure categories in the spreadsheet are derived directly from the flows and limits defined in the planners.

## Anti-Objectives
- **Heuristic Averaging**: The system MUST NOT inject probabilistic "burn rates" into the final spreadsheet view; it is a ledger of intent, not an estimate.
- **Orphaned Row Injection**: The system MUST NOT show "Uncategorized" or generic system rows for activity that has not been strategically pre-authorized in the planners.
