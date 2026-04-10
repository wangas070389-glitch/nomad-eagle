# Nomad Eagle: Application DNA & System Compendium

This document serves as the absolute source of truth for the **Nomad Eagle** project. It synthesizes architectural vision, governing protocols, data structures, features, and operational workflows into a single unified reference.

---

## 1. System Overview & Mission

### **Current Mission: Granular Cash Flow Visualization**
To **deconstruct** aggregated financial models into **granular line-item histories** for **Sovereign Households** by splitting inflows and outflows into individual source/category rows within the Cash Flow Spreadsheet.

### **Core Objectives**
*   **Dimensional Expansion**: Refactor server-side projection logic to preserve individual `RecurringFlow` identity instead of pre-aggregating.
*   **Label Mapping**: Map specific names (e.g., "Salary", "Rent") to their respective projection streams.
*   **UI Hierarchy**: Render individual rows for each inflow and outflow source while maintaining "Total" summary rows for mathematical grounding.
*   **Visual Trends**: Provide a dual-view (Table & Chart) experience. The chart utilizes an **Accumulative Area Chart** (Recharts) to visualize projected balance (Runway) over time.

---

## 2. Architecture & Tech Stack

Nomad Eagle is built as a **Modular Monolith** following a **Server-First** paradigm.

*   **Engine**: Next.js 16.1.4 (Turbopack)
*   **Sovereignty Layer**: Prisma ORM (PostgreSQL) with `pgvector` for semantic analysis.
*   **UI Framework**: React 19, Tailwind CSS, Shadcn UI, and Radix UI.
*   **Data Logic**: TypeScript + `Decimal.js` for high-precision financial operations.
*   **Communication**: Modules communicate via direct function calls (Server Actions), preserving transactional integrity.

---

## 3. Onboarding Process

### **1. Registration & The Velvet Rope**
*   **Capacity Guard**: Prevents registrations if `PENDING` users exceed **8 slots**.
*   **Identity**: Passwords hashed via `bcryptjs`. Initial status: `PENDING`.

### **2. Household Initialization**
*   **Self-Sovereign**: Automates creation of a new Household if no `inviteCode` is provided.
*   **Joint Sovereignty**: Links user to an existing Household via `inviteCode`.

### **3. First-Run Experience**
*   Users without a household are routed to `OnboardingForms` to **Create** or **Join** a household unit.

---

## 4. Feature Mapping

### **Financial Core**
*   **Dashboard**: Command center for balances, activity, and budget progress.
*   **Accounts**: Management of CHECKING, SAVINGS, INVESTMENT, CREDIT_CARD, and CASH. Supports **Joint** and **Personal** ownership.
*   **Historical Ledger**: Full CRUD for transactions with automatic balance reconciliation.
*   **Semantic Search**: AI-powered intent-based lookup for transaction history.

### **Planning & Projections**
*   **Cash Flow Table**: 12-month granular projection matrix.
*   **Recurring Flows**: Definition of future income/expense streams.
*   **Budget Limits**: Spending caps per category with temporal history support.

### **Wealth & Strategy**
*   **Portfolio Tracking**: Real-time asset summary and cost basis analysis.
*   **Net Worth Simulator**: Strategic projection tool for wealth trajectories.

---

## 5. Architectural Decision Records (ADR) Mapping

This section tracks the evolutionary memory of the system's architecture.

| ID | Decision / Title | Status |
| :--- | :--- | :--- |
| **0000** | Record architecture decisions | Accepted |
| **0001** | Adopt Modular Monolith Architecture | Accepted |
| **0002** | Technology Stack Selection | Accepted |
| **0003** | Use Server Actions for Data Mutations | Accepted |
| **0004** | Protocol-Driven Governance | Accepted |
| **0005** | Enforce Strict Household Isolation | Accepted |
| **0006** | Secure Investment Operations | Accepted |
| **0007** | Secure Household Invites | Accepted |
| **0008** | Protocol 32: Strategic Evolution & Wardley Analysis | Active |
| **0009** | Semantic Search Interface | Accepted |
| **010** | Temporal Budgeting (Protocol 32) | Proposed |
| **012** | Reliable Pagination Strategy | Accepted |
| **013** | Household Account Grouping | Accepted |
| **014** | Simplified Transaction Date Picker | Accepted |
| **015** | Calendar Component Version Mismatch Fix | Accepted |
| **016** | Household Intra-Transfer Permission | Accepted |
| **016-A** | Addendum: Trusted Household Model | Active |
| **017** | Error Visibility & Dialog Overflow Fix | Accepted |
| **018** | Household Invite Code Format Fix | Accepted |
| **019** | Compact Transaction Dialog Layout | Accepted |
| **020** | Implicit Budgeting View | Accepted |
| **021** | Dashboard Metrics Rebalance | Accepted |
| **022** | Protocol 32: Phase 2 Strategic Evolution | Active |
| **023** | Wealth Engine Logic | Accepted |
| **024** | Simulation UI & Interaction | Accepted |
| **026** | Gravity Well Prevention & Data Density | Accepted |
| **027** | Separation of Budgeting and Wealth Simulation | Accepted |
| **028** | Operational Cash Flow Visualization | Accepted |
| **029** | Realistic Time Horizons (Project Oracle) | Accepted |
| **030** | Dashboard Integration (Cash Flow vs Wealth) | Accepted |
| **031** | Mobile First & PWA Strategy | Proposed |
| **032** | System Invariants & Financial Truth Model | Accepted |

---

## 6. Governing Laws (The Protocols)

### **The Machine Constitution (Protocol 0)**
*   **Sovereign Cognition**: Agents write code; humans oversee.
*   **Zero Insertion**: No manual code changes outside the protocol.

### **Topology & Structural Integrity (Protocols 4, 5, 6, & 7)**
*   **The Gravity Well**: Unidirectional dependency flow: **Bedrock → Core → Edge**.
*   **Hermetic Determinism**: Pure business logic in the Core, dependency-free.
*   **The Granite Standard**: Database is "dumb"; UUIDv7 for scalability.
*   **The Airlock**: Edge layer sanitizes inputs via Zod.

### **Shield (Protocol 13)**
*   **Zero-Trust**: Mandatory `householdId` filtering on all database queries.

---

## 7. Immunological DNA (Security & Risks)

### **Red Team Findings**
*   **IDOR (0001, 0002)**: Vulnerabilities in resource creation. **Mitigated** via strict isolation logic.
*   **Weak Credentials (0007)**: Short codes. **Mitigated** via cryptographic tokens.
*   **Temporal Risks (010)**: Accuracy of historical reports. **Mitigated** via snapshotting logic.

---

## 8. Directory Topology

```
C:\Users\wanga\.gemini\antigravity\playground\nomad-eagle\
├── ADR/                    # Evolutionary Decision Memory
├── CODEX-DNA/              # Core System Documentation
├── context/                # Philosophical & Structural Guides
├── docs/                   # Mission & History
├── prisma/                 # Database Blueprint
├── production_artifacts/   # Active Technical Specs
├── RedTeam/                # System Immune System
├── src/                    # Source Code
│   ├── app/                # Edge: UI Routes & API
│   ├── components/         # Edge: Presentation Layer
│   ├── domain/             # Core: Hermetic Logic
│   ├── lib/                # Bedrock: Utilities & Client
│   └── server/             # Edge: Actions & Orchestration
└── topology.config.ts      # Configuration
```

---
**Status**: ACTIVE
**Integrity**: VERIFIED
**Sovereignty**: ESTABLISHED
