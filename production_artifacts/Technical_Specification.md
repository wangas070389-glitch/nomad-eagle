# Technical Specification: Structural Decoupling & Ternary Taxonomy

## 1. Traceability Matrix
| Technical Choice | Governing Mission Requirement | Originating ASR |
| :--- | :--- | :--- |
| Ternary Enum | Ternary Categorical Enforcement | ASR-001: Ternary Categorical Enforcement |
| Tagging Metadata | Dimensional Decoupling | ASR-002: Dimensional Decoupling |
| Relational Purge | Deprecation of Budget Anchors | ASR-003: Deprecation of Budget Anchors |

## 2. Tech Stack Definition
- **Language**: TypeScript
- **ORM**: Prisma (PostgreSQL)
- **UI Framework**: Next.js + Tailwind CSS

## 3. Directory Topology (The Gravity Well)
```text
app_build/
├── core/                  # ZERO dependencies. Deterministic forecasting.
│   └── use_cases/         # Ternary-aware cash flow simulation
└── edge/                  # Frameworks and Delivery
    ├── database/          # Prisma schema with ternary enums
    └── ui/                # Entry modal with restricted decision buckets
```

## 4. Data Schema Evolution
```prisma
enum StrategicBucket {
  CAPITAL_INFLOW
  FIXED_OBLIGATION
  VARIABLE_ALLOCATION
}

model RecurringFlow {
  // ... existing fields ...
  bucket   StrategicBucket
  tags     String[]        // Descriptive identifiers
  // [DELETED] budgetLimitId
}

model Transaction {
  // ... existing fields ...
  bucket   StrategicBucket
  tags     String[]        // Descriptive identifiers
  // [DELETED] budgetLimitId
}
```

## 5. Core Invariants
1. **Categorical Scarcity**: Only three primary buckets exist for forecasting.
2. **Metadata Isolation**: Atomic descriptions (Lego, AWS, Starlink) are strictly treated as tags and cannot alter the primary categorical sums.
3. **Forensic Primacy**: Net Flow is calculated as `CAPITAL_INFLOW - (FIXED_OBLIGATION + VARIABLE_ALLOCATION)`.

---
Traceability complete. **Do you approve this architecture and topology?** You can modify `Technical_Specification.md` before I proceed.
