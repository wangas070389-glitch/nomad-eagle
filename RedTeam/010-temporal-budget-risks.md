# Red Team Analysis: Temporal Budgeting (ADR 010)

**Date**: 2026-02-07
**Target**: Dashboard Budget Tracker Logic

## 1. Threat Modeling

Moving from "Static" to "Temporal" budgeting (calculating progress based on date ranges) introduces specific logic flaws.

### Risk A: Timezone Drift (The "Lost Day")
-   **Vector**: Server is UTC, User is UTC-6.
-   **Scenario**: User spends on "Feb 1st 01:00 AM" (UTC).
    -   In UTC-6, it's Jan 31st 19:00 PM.
-   **Impact**: Transaction counts towards the WRONG month's budget.
-   **Mitigation**: ALL date comparisons must be timezone-aware or use strictly defined boundaries (e.g., `startOfDay(userTimezone)`).

### Risk B: Date Manipulation via API
-   **Vector**: User sends `date: "2099-01-01"` for a transaction.
-   **Scenario**: The transaction is valid but disappears from the "Current Month" view.
-   **Impact**: Budget progress bar shows 0% spent, misleading the user.
-   **Mitigation**: Dashboard must validate that `transaction.date` falls within the period being displayed.

### Risk C: Recurrence Overlap
-   **Vector**: A recurring bill set for the 31st of the month.
-   **Scenario**: February only has 28 days.
-   **Impact**: The bill might be skipped or double-counted in March.
-   **Mitigation**: Robust recurrence library (e.g., `rrule`) must handle short months correctly.

## 2. Conclusion

The "Not Resetting" bug described by the user is likely a simple **Date Filter Error** (Risk A/B variant).
-   If the query is `WHERE date > startOfMonth`, ensure `startOfMonth` is calculated correctly.

**Recommendation**: Use a robust date library (e.g., `date-fns`) for all boundary calculations.
