# Mission Statement: Structural Decoupling & Decision-Grade Forecasting

## Objective: Eliminate Dimensional Noise
To stabilize the Nomad Eagle forecasting engine by enforcing a **Ternary Decision Taxonomy**. The objective is to decouple atomic metadata (source/item descriptions) from strategic functional buckets, ensuring that the system's primary KPI—**Liquid Net Flow**—is derived from high-integrity categorical invariants rather than fragmented descriptive noise.

## Active ASRs (Architectural Strategic Requirements)
- **ASR-001: Ternary Categorical Enforcement**: The system MUST restrict top-level planning categories to exactly three decision-grade buckets: `CAPITAL INFLOW`, `FIXED OBLIGATION`, and `VARIABLE ALLOCATION`.
- **ASR-002: Dimensional Decoupling**: Descriptive identifiers (e.g., specific vendors, items) MUST be moved to a secondary metadata/tagging layer, preventing them from polluting the primary forecasting dimensions.
- **ASR-003: Deprecation of Budget Anchors**: The "Budget Anchor" linkage between recurring flows and budget limits is to be removed to reduce entropy and restore deterministic solvency calculations.

## Anti-Objectives (What we will NOT do)
- **Descriptive Pollution**: We will NOT allow atomic-level items (e.g., "Lego") to serve as primary categories.
- **Mixed Dimensions**: We will NOT allow Source and Purpose dimensions to collapse into a single field.

## Success Metric
- reduction of primary planning categories to 3.
- zero secondary fields required for the MVP forecasting projection.
