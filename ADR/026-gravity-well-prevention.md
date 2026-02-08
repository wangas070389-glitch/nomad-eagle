# ADR 026: Gravity Well Prevention & Data Density

## Status
Accepted

## Context
During **Protocol 33 System Audit** (Ref: `RedTeam/026-protocol-33-audit.md`), we identified a critical architectural risk termed a "**Gravity Well**".
-   **Definition**: A query pattern where data accumulates unbounded in server memory (`O(N)`) before being processed.
-   **Incident**: The `getTripDetails` action was fetching *all* transactions for a trip to calculate "Total Spent" in JavaScript.
-   **Risk**: A single "Whale" user (or trip with 10k items) could cause a `Memory Limit Exceeded` crash, affecting the entire node.

## Decision
We will enforce a **"Database-First Aggregation"** policy for all statistical data.

### 1. Ban on Client-Side Aggregation
-   **Anti-Pattern**: Fetching a list (`findMany`) and using `.reduce()` or `.filter()` in application code for statistics.
-   **Required Pattern**: Use Prisma's `aggregate`, `groupBy`, or `count` to perform calculations at the database layer.

### 2. Mandatory Pagination
-   **Rule**: No `findMany` query is allowed to run without a `take` limit (or a strict `where` clause on a small bounded set like `householdId` *if* the set is guaranteed small).
-   **Limit**: Default `take` for UI lists is **50**.

### 3. Waterfall Prevention
-   **Rule**: Asynchronous data needs that don't depend on each other MUST be fetched in parallel using `Promise.all`.
-   **Check**: Code reviews must explicitly scan `page.tsx` for sequential `await` patterns.

## Implementation (Trips Example)
The `Trips` module was refactored to comply:
-   **Before**: Fetched 100% of transactions.
-   **After**:
    1.  `prisma.transaction.groupBy` -> Gets sums per user.
    2.  `prisma.transaction.findMany({ take: 50 })` -> Gets display list.

## Consequences
-   **Pros**:
    -   **O(1) Memory Usage**: Server load remains constant regardless of dataset size.
    -   **Scalability**: The system can handle users with 1M transactions without refactoring.
-   **Cons**:
    -   **Complexity**: Aggregation queries are often more complex to write and type-check than simple JS arrays.
    -   **N+1 Risk**: Care must be taken not to trigger N+1 queries when fetching related data for aggregations (though `groupBy` usually handles this).
