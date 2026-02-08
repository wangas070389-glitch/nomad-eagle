# ADR 020: Implicit Budgeting View

## Status
Accepted

## Context
Currently, the "Active Budgets" dashboard widget only displays categories that have an explicit `BudgetLimit` set. This hides spending in categories where the user hasn't set a budget, potentially masking financial leaks. The user requested that *any* category with spending in the current period should appear in the list.

## Decision
We will modify the `getBudgetProgress` server action to adopt an "Implicit Budgeting" model:

1.  **Union Data Source**: The list will be composed of:
    -   All categories with an explicit `BudgetLimit` (Active Budgets).
    -   All categories with > 0 spending in the current period (Active Spending).
2.  **Unbudgeted Representation**:
    -   Categories with spending but no limit will be displayed with a `limit` of 0.
    -   Visual indication: "Over Budget" (technically true) or a distinct "Unbudgeted" status.
    -   For the MVP, we will treat them as standard budget items with `limit: 0`, which will result in >100% usage (Red status). Use logic will handle the display (e.g., "$500 / --").

## Implementation Details
-   **Server Action**: `getBudgetProgress`
    -   Fetch `BudgetLimits`.
    -   Fetch `Transaction` sums grouped by category.
    -   Fetch `Category` details for the unbudgeted items (to get names).
    -   Merge the lists.
-   **UI**: `BudgetProgress` component
    -   Handle `limit === 0` gracefully to avoid division by zero errors (though JS returns Infinity, we want clean UI).
    -   Render unbudgeted items effectively.

## Consequences
-   **Pros**: Complete visibility of monthly outflow.
-   **Cons**: The list might become long if the user spends in many small categories.
