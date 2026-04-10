# 🚀 Nomad Eagle | Mission Statement: Sovereign Household Simulation

## Mission Statement
**To** establish a high-fidelity proof-of-concept **for** the Admin and Partner users **by** seeding 60 days of realistic financial history, category limits, and an active Siemens (SIE) equity position, ensuring the application demonstrates 100% data integrity and actionable intelligence.

## Core Functional Scope

*   **Financial History (60 Days)**:
    *   **Historical Transactions**: Populate the `Transaction` table with authentic income streams (Salary, Consulting) and expenses (Housing, Food, Utilities, Transport, Tech).
    *   **Diverse Accounts**: Seed specific Account types including **Debit (Checking)** for liquidity and **Credit Card** for lifestyle leverage.
    *   **User Roles**: Simulate distinct spending and income profiles for `admin@nomad.com` (Commander) and `partner@nomad.com` (Wingman).
*   **Ledger Sovereignty**:
    *   **Integrity Mapping**: Every seeded transaction MUST have a corresponding set of `LedgerEntry` records (Double-Entry Debit/Credit) to maintain a 100% verified integrity score.
*   **Portfolio Enrichment**:
    *   **SIE Equity**: Seed an active investment position for Siemens (SIE) with a cost basis reflecting a 60-day historical holding period.
*   **Boundary Enforcement (Limits)**:
    *   **Category Limits**: Establish monthly `BudgetLimit` entries for core categories (e.g., Food, Entertainment) to exercise the visual progress and trajectory tracking layers.

## Anti-Objectives
*   **No Fragmented Data**: Avoid seeding transactions without ledger entries; all data must be auditable.
*   **No Random Noise**: All simulated data must follow a logical household pattern (e.g., end-of-month rent, bi-weekly salaries).
*   **No Generic Categories**: Use specific categories that reflect the "Sovereign Household" mission (Security, Infrastructure, Education).

## Handoff
Simulation Strategy defined by **@pm**. Yielding to **@architect** for Data Topology Specification.
