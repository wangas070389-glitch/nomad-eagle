# 9. Semantic Search Interface

Date: 2026-02-07

## Status

Proposed

## Context

We have successfully implemented **Project Neural-Ledger** (ADR 0008), which stores vector embeddings for transactions. However, this capability is currently inaccessible to users. The current search functionality is limited to exact keyword matches.

## Decision

We will implement a **Natural Language Search Interface** that allows users to query their financial history using semantic phrases (e.g., "Coffee in Paris" or "Uber rides last month").

### Technical Architecture

1.  **Server Action**: `searchTransactions(query: string)`
    -   Generates embedding for the `query`.
    -   Executes a cosine similarity search (`<->`) against the `Transaction` table.
    -   **CRITICAL**: Must apply a strict `WHERE householdId = session.user.householdId` filter (See ADR 0005 & Rec Team Report 0008).

2.  **UI Component**: `SemanticSearch`
    -   A specialized search bar in the Dashboard/Transactions view.
    -   Displays results ranked by similarity score.

## Consequences

-   **UX**: Significantly improved discovery of historical data.
-   **Security**: Requires strict adherence to Vector Isolation to prevent data leakage.
-   **Cost**: Embedding generation for queries incurs a negligible API cost per search.

## Compliance

This ADR enforces **Protocol 32 (Value Chain)** by moving the product up the value stack, and **Protocol 5 (Bedrock)** by keeping the logic secure in the server action.
