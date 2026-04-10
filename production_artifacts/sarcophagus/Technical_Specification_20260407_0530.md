# 🏗️ Technical Specification: High-Conversion Marketing Pivot

## ⚛️ Architectural Topology: The Gravity Well
Maintaining the strict **Core vs. Edge** separation to protect the platform's stability.

### 🔴 app_build/core/ (The Value-First Center)
Rewriting the marketing logic to focus on human benefits.
- `marketing_copy.ts`: Updated with the "Brutal Truth" headline, simplified benefits, and 3-step value flow.
- `benefit_service.ts`: Updated to map technical ledger data to "Clarity, Control, Confidence" narratives.

### 🟢 app_build/edge/ (The High-Fidelity Infrastructure)
- `ui/LandingHero.tsx`: Updated to use the new High-Conversion CTAs ("Start Free").
- `ui/HowItWorks.tsx`: **[NEW]** Implementing the 3-step visualization section.
- `ui/FeatureGrid.tsx`: Updated to use the benefit cards defined in the new PM mission.
- `styles/landing.css`: Premium glassmorphism remains, but visual noise (fake metrics) is removed.

---

## 🛠️ Technology Stack
- **Framework**: Next.js 16.1.4 (Turbopack)
- **UI Architecture**: React Server Components (RSC) for maximum performance.
- **Styling**: Vanilla CSS for hardware-accelerated glassmorphism.
- **Motion**: Framer Motion (optimized for the `edge/` layer).

---

## ⚡ Core Invariants
1. **The conversion ceiling**: No jargon allowed in the `core/` layer without a clear "benefit" mapping.
2. **The 3-Step Flow**: The "How it Works" section must be the primary trust-builder for new users.
3. **The Unidirectional Flux**: **@redauditor** MUST VETO any `core/` file that attempts to import from `edge/`.

---

## 🛑 HALT: User Review Required
**@architect**: I have refactored the structural blueprint to align with the **Brutal Truth** audit. It prioritizes the "Human Experience" while maintaining the aerospace-grade engineering integrity in the background.

**Do you approve this High-Conversion architecture and topology?**
*(You may modify `Technical_Specification.md` before I proceed to Phase 3 Implementation).*
