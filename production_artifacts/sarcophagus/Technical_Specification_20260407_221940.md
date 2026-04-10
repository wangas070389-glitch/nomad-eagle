# 🏗️ Technical Specification: Sovereign Household Simulation

## ⚛️ Architectural Topology: The High-Fidelity Data Layer
Pivoting from an "empty shell" to a "Sovereign Household Proof".

### 🔴 prisma/seed.js (Generation Engine)
Implementing a deterministic simulation engine for 60-day historical data.
- **Users**: Admin (Commander), Partner (Wingman).
- **Accounts**:
  - `Nomad Joint Checking`: The primary Debit/Checking hub for Household flows.
  - `Nomad Obsidian Card`: High-limit Credit Card for lifestyle leverage and recurring expenses.
  - `Commander's Wallet`: Admin's personal liquid account.
  - `Wingman's Vault`: Partner's personal savings/investment account.
- **Categories**: Standardized set (Housing, Food, Transport, Tech/Security, Health, Consulting).
- **Transactions**:
  - **Incomes**: Bi-weekly salaries, monthly consulting fees.
  - **Expenses**: End-of-month Rent ($2,200), Utilities ($150), Groceries (Weekly), Tech-gear ($500 one-time).
- **Ledger Invariants**: EVERY transaction MUST generate a set of `LedgerEntry` (Double-Entry Debit/Credit) to maintain a 100% integrity score.
- **Limits**: `BudgetLimit` entries for 'Food' ($800/mo) and 'Entertainment' ($400/mo).

### 🟢 app_build/core/equity_seeder.ts [NEW]
A specific utility for seeding complex investment positions.
- **Asset**: Siemens (SIE).
- **History**: Initial purchase 60 days prior at $165.00 (Qty: 50).
- **Valuation**: Integrate `PriceHistory` for the last 60 days to allow for portfolio chart rendering.

---

## ⚡ Core Invariants
1. **Verifiable Integrity**: The "Ledger Superpower" MUST show 100% integrity after seeding. This means transaction sums match ledger entry offsets.
2. **Temporal Consistency**: Dates MUST be distributed naturally across the last 60 days (including weekends for personal expenses).
3. **Visibility**: Category limits MUST be established to ensure the "Fix it with simple changes" visualization in the `/plan` view is non-zero.

---

## 🛑 HALT: User Review Required
**@architect**: I have refactored the structural blueprint to achieve a "Sovereign Household Proof" via **60-Day Historical Simulation**. This topology ensures the platform is fully actionable and auditable.

**Do you approve this Household Simulation architecture and topology?**
*(You may modify `Technical_Specification.md` before I proceed to Phase 3 Implementation).*
