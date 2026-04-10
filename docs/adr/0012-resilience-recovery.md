# ADR-0012: Resilience and Disaster Recovery for Nomad Eagle Ledger

## Status
Proposed (Phase 10)

## Context
As Nomad Eagle transitions to a high-integrity Ledger-based system, the divergence between the "Account Cache" (optimized for fast reads) and the "Ledger Provenance" (immutable truth) becomes a potential risk if not monitored and self-healed.

## Decision
We implement a multi-layered Resilience Strategy:

1.  **Observability (Phase 4/7)**: Real-time integrity monitoring via at-least-once reconciliation in the Dashboard.
2.  **Durable Execution (Phase 5)**: Task Outbox pattern to ensure asynchronous side-effects (embeddings) are never lost.
3.  **Self-Healing (Phase 8)**: A manual/scheduled `reconcile-balances.ts` script that forces the Account Cache to align with Ledger Truth.

## Consequences
- **Positive**: High trust in financial data. System can recover from partial write failures.
- **Negative**: Manual reconciliation requires operational overhead (or a future cron job).

## Recovery Workflow
If the Integrity Panel shows a "RECONCILIATION FAILURE":
1.  Run `npx tsx scripts/reconcile-balances.ts`.
2.  Audit the Ledger entries to find the root cause of the mutation skip.
3.  Fix the drift and verify via the Integrity Panel.
