# Technical Specification: Nomad Eagle Ledger-Based Transformation

## ⚙️ Phase 0: Non-Negotiables & Invariants
Establish the fundamental laws of the system before any code modification.

### 1. Financial Truth Model
- **Transition**: Move from **Balance-Based** (mutable `Account.balance`) to **Ledger-Based** (immutable append-only `LedgerEntry`).
- **Core Principle**: An account's balance is a derived projection of its ledger history.

### 2. Consistency Model
- **Strong Consistency**: Required for `LedgerEntry` creation, `AccountBalance` cache updates, and `Transaction` records.
- **Eventual Consistency**: Acceptable for Wealth Simulations, Search Indexing (Vector), and Analytics.

### 3. Failure Policy
- **Database Write Failure**: Reject the entire transaction. Partial states (e.g., Transaction record exists but Ledger does not) are strictly forbidden.
- **Async Failure (Embedding/Search)**: Non-blocking. Retry using background workers. Failures must not prevent the core financial mutation.

---

## 🧱 Phase 1: Data Integrity (The Foundation)
Implement the append-only ledger and reconciliation engine with a zero-loss migration.

### 1.1 Ledger Schema
```prisma
model LedgerTransaction {
  id          String   @id @default(cuid())
  type        String   // OPENING_BALANCE | TRANSACTION | RECONCILIATION
  description String?
  createdAt   DateTime @default(now())
  entries     LedgerEntry[]
}

model LedgerEntry {
  id            String   @id @default(cuid())
  accountId     String
  householdId   String
  amount        Decimal  @db.Decimal(19, 4)
  type          String   // DEBIT | CREDIT
  ledgerTxId    String
  createdAt     DateTime @default(now())

  ledgerTx  LedgerTransaction @relation(fields: [ledgerTxId], references: [id])
  account   Account   @relation(fields: [accountId], references: [id])
  household Household @relation(fields: [householdId], references: [id])
}
```

### 1.2 Migration Design (Backfill)
1. **Step 1 — Introduce Ledger**: Add schema entities but maintain `Account.balance`.
2. **Step 2 — Backfill**: Create `OPENING_BALANCE` entries for all accounts using the current `Account.balance`.
3. **Step 3 — Dual Write**: Update both the Ledger and `Account.balance` for every new transaction.
4. **Step 4 — Verification**: Confirm `SUM(ledger entries) == Account.balance` for 100% of accounts.
5. **Step 5 — Cutover**: Stop writing to `Account.balance`. Convert it to a projection or cached field.
6. **Step 6 — Reconciliation**: Nightly job to recompute balances from the ledger.

---

## 🧩 Phase 2: Domain Architecture (Decoupling)
Remove framework dependencies from core business logic (The "Anti-Rot" Strategy).

### 2.1 Domain Purity Rules
- **Allowed**: `Decimal.js` (financial precision), `date-fns` (minimal utilities), pure native TS logic.
- **Conditionally Allowed**: `zod` (ONLY at input boundaries; never inside core logic).
- **Forbidden**: `Prisma`, `Next.js`, external APIs, HTTP clients.
- **Golden Rule**: Core domain MUST be runnable in isolation without a database or framework.

---

## 🧪 Phase 3: Testing (Survival)
A 3-tier strategy focusing on feedback speed and determinism.

- **Stack**: 
  - **Vitest**: Unit + Integration (Fast, Native TS).
  - **Playwright**: E2E (Deterministic, Auth-aware).
  - **Testcontainers**: Real PostgreSQL for DB testing (No mocking Prisma for core logic).
- **Coverage Targets**:
  - Ledger Invariants: 100%
  - Transaction Flows: 100%
  - Wealth Engine: High
  - Auth/Household Isolation: Required.

---

## 📡 Phase 4: Observability
Enable "True Sight" into system operations.

- **Structured Logging**: Replace `console.log` with a JSON-based logging utility including `traceId`, `userId`, and `householdId`.
- **Tracing**: Implement request-to-DB tracing for performance bottleneck identification.

---

## ⚡ Phase 5: Performance & Execution
Optimize heavy computation.

- **Simulation Decoupling**: Wealth simulations should be cached and computed asynchronously if they exceed 100ms.
- **Vector Hardening**: Replace `executeRawUnsafe` with type-safe vector queries and implement fallback search logic.

---

## 🔐 Phase 6: Security Hardening
Establish a Zero-Trust environment.

- **Secrets**: Transition to managed secrets (e.g., Vercel Secrets or AWS Secrets Manager).
- **Auth Audit**: Verify `householdId` filtering in 100% of queries.
- **Rate Limiting**: Apply limits to `/api/search` and simulation endpoints.

---

## 🚀 Phase 7: Deployment Maturity
- **CI/CD**: Enforce `lint` -> `test` -> `build` pipeline.
- **Migration**: Schema changes (Phase 1) must be validated against production-sized datasets.

---

## 📊 Phase 8: Scalability
- **Caching**: Introduce a caching layer for frequent read operations (e.g., Dashboard stats).
- **Workers**: Use background workers for reconciliation and simulation updates.

---

## 🧠 Phase 9: Product Hardening
- **UX**: Graceful degradation when async services (like Vector Search) are lagging.
- **Trust Elements**: Display "Last Reconciled" timestamps to users for financial peace of mind.
