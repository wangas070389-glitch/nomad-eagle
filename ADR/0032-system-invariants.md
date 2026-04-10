# ADR 32: System Invariants & Financial Truth Model

Date: 2026-04-06

## Status
Accepted

## Context
Nomad Eagle is transitioning from a balance-based prototype to a high-integrity financial system. This requires defining non-negotiable engineering invariants to ensure data integrity, consistency, and predictable failure modes.

## Decision: Engineering Invariants

### 1. Financial Truth Model (Ledger-First)
The system MUST be **ledger-based**.
- **Invariant**: Mutable balances (`Account.balance`) are strictly "derived projections" or "cached states."
- **Source of Truth**: The append-only `LedgerEntry` history is the ultimate source of truth.
- **Auditability**: At any point, the system must be able to reconstruct the entire state of an account by replaying its ledger entries.

### 2. Consistency Model
The system enforces hybrid consistency:
- **Strong Consistency (ACID)**: Required for all financial mutations involving **Balances** and **Transactions**. A transaction must never result in a partial state (e.g., a withdrawal without a corresponding ledger entry).
- **Eventual Consistency**: Acceptable for high-latency or non-critical paths:
    - Wealth Simulations (Projections).
    - Vector Search Indexing (Embeddings).
    - Analytics/Reporting aggregates.

### 3. Failure Policy (Deterministic Response)
We define explicit failure modes to prevent "silent corruption" or "zombie states."

| Event | Policy | Invariant |
| :--- | :--- | :--- |
| **DB Write Failure** | **Atomic Rejection** | Never allow partial transaction commits. If the ledger write fails, the entire transaction fails. |
| **Embedding Failure** | **Async Retry** | Background workers handle embedding retries. Core financial logic must never block on vector generation. |
| **Concurrency Conflict** | **Optimistic/Pessimistic Locking** | Use SERIALIZABLE isolation levels (or DB-level locks) to prevent race conditions on balances during high-frequency writes. |

### 4. Risk Model
- **Risk 1: Integrity Breach**: A mismatch between the Ledger and the Balance cache. Mitigation: Nightly reconciliation jobs.
- **Risk 2: Isolation Leak**: Cross-household data access. Mitigation: Mandatory `householdId` filtering in the Domain Layer (Protocol 13).
- **Risk 3: Performance Degradation**: Expensive simulations blocking the main request thread. Mitigation: Async job-based execution (Phase 5).

### 5. Failure Definitions
The system is considered "Failed" if:
1. `SUM(LedgerEntries) != Account.balance`.
2. A user can fetch a `Transaction` or `LedgerEntry` not belonging to their `householdId`.
3. A `Transaction` exists without at least two corresponding `LedgerEntry` records (Double-Entry integrity).

## Consequences
- **Engineering Overhead**: Every financial action now requires multiple DB writes (Transaction + Ledger).
- **Complexity**: Requires a Domain Layer for decoupling from Prisma/Next.js to ensure invariants are enforced regardless of the framework delivery.
- **Improved Trust**: Users and systems can rely on a verifiable, immutable history of all financial events.
