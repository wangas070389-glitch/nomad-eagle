# 🏗️ Technical Specification: Nomad Eagle Landing Page Ecosystem

## ⚛️ Architectural Topology: The Gravity Well
Following the strict **Phase 2 Architectural Physics** mandate, all code will be bisected by the physical "Gravity Well" to prevent I/O and Framework contamination of the core business rules.

### 🔴 app_build/core/ (The Deterministic Center)
Contains the irreducible marketing logic and state-less rules.
**No Imports Allowed**: React, Next.js, Framer Motion, Axios, or Prisma.
- `benefit_service.ts`: Logic to map technical features (immutable ledger) to user-centric benefits (financial peace).
- `cta_handler.ts`: Logic to define the "Sovereign Path" (Sign-up state vs. Re-engagement).
- `marketing_copy.ts`: The immutable source-of-truth for headlines, subheaders, and benefit bullets.

### 🟢 app_build/edge/ (The High-Fidelity Infrastructure)
Contains the frameworks, UI, and performance-optimized adapters.
- `ui/`: High-performance React components with Framer Motion integrations.
- `adapters/`: Logic to bridge Core business rules with Next.js Server Actions and SEO metadata.
- `styles/`: Standardized glassmorphism utilities.

---

## 🛠️ Technology Stack
- **Framework**: Next.js 16.1.4 (Turbopack)
- **UI Architecture**: React Server Components (RSC) for maximum LCP performance.
- **Styling**: Vanilla CSS for premium, hardware-accelerated glassmorphism.
- **Motion**: Framer Motion (optimized for the `edge/` layer).
- **SEO**: Dynamic OpenGraph and JSON-LD generation.

---

## 📊 Marketing Data Schema
While the Landing Page is primarily static for performance, we will define a `MarketingLead` model in the `edge/` persistence layer to track intent before conversion.

```prisma
model MarketingLead {
  id        String   @id @default(cuid())
  email     String   @unique
  intent    String?  // Source attribute (e.g., "LedgerHardeningPlan")
  converted Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

---

## ⚡ Core Invariants
1. **The Performance Ceiling**: No asset or library can be added if it drops the Lighthouse Performance score below **90**.
2. **The Aesthetic Standard**: Every `Card` must utilize the `glass-card` hardware-accelerated utility.
3. **The Unidirectional Flux**: **@redauditor** MUST VETO any `core/` file that attempts to import from `edge/`.

---

## 🛑 HALT: User Review Required
**@architect**: I have finalized the structural blueprint. It enforces a strict separation between our high-conversion marketing psychology and our robust financial engineering.

**Do you approve this architecture and directory topology?**
*(You may modify `Technical_Specification.md` before I proceed to Phase 3 Implementation).*
