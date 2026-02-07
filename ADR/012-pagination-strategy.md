# 12. Reliable Pagination Strategy

Date: 2026-02-07

## Status

Proposed

## Context

**Incident**: After optimizing the dashboard to load only the Top 5 transactions, the "Load More" functionality broke.
**Root Cause**: Mismatched Pagination Logic.
-   **Initial Load**: Page 1, Size 5 (Items 1-5).
-   **Load More**: Requested "Page 2" with standard Size 50.
    -   Standard Page 2 = Skip 50, Take 50 (Items 51-100).
    -   **Result**: Items 6-50 were completely skipped (The "Ghost Gap").

## Decision

We will switch from **Page-Number Pagination** to **Offset-Based Pagination** for the Transaction List key, or ensure Page Size consistency.

### Solution: Dynamic Offset Tracking
The UI component (`TransactionList`) must track `currentCount` (the number of items currently displayed) and use that as the `skip` parameter for the next fetch.

#### Red Team Recommendation (Adopted)
We explicitly acknowledge the "Shift-Duplicate" risk (seeing a duplicate if a new item is added during viewing) as acceptable for the Dashboard MVP.
-   **Why**: Cursor-based pagination (by ID or Date) is more robust but adds significant complexity to the query and frontend state.
-   **Mitigation**: The Dashboard is for "Recent Activity". Strict consistency is enforced in the full ledger view (future work).

1.  **Server Action Update**: Update `getTransactions` to accept an optional `skip` parameter.
    -   If `skip` is provided, use it directly.
    -   If not, fall back to `(page - 1) * pageSize`.
2.  **Component Logic**:
    -   Initial Load: 5 items.
    -   Load More: `getTransactions(skip: items.length, take: 50)`.

## Consequences

-   **Robustness**: Works regardless of initial fetch size.
-   **Correctness**: No missing data.
-   **UX**: Users see a continuous stream of history.
