# 🏗️ Technical Specification: Hero Precision Tuning (TTU)

## ⚛️ Architectural Topology: The Cognition & Hierarchy Layer
Pivoting from "Visual Drama" to "Decision-Making Interface".

### 🔴 app_build/core/marketing_copy.ts (Forced Structure)
Enforcing controlled rhythm and line breaks in the headline.
- **Headline**: "See where your money is going—\nand where your life is heading."
- **CTA Microcopy**: "Free • Takes 60 seconds."

### 🟢 app_build/edge/ (The Precision UI Layer)
- `ui/LandingHero.tsx`: Refactored for scale and layout ratio.
  - **Scale**: `font-size: 48-56px`, `font-weight: 600-700`, `line-height: 1.15-1.2`.
  - **Width**: `max-width: 800px`.
  - **Spacing**: Vertical gaps/margins reduced by ~30%.
- `ui/VisualProof.tsx`: Integrated elevation with negative margins or position-relative shifts to achieve the 45% viewport visibility goal.

---

## 🛠️ Technology Stack
- **Framework**: Next.js 16.1.4 (Turbopack)
- **Styling**: Vanilla CSS for precision scale-tuning.
- **Visuals**: Optimized `dashboard_preview.png` with brightness/contrast enhancements and subtle shadow-glow.

---

## ⚡ Core Invariants
1. **The 35/20/45 Rule**: The Hero Section MUST distribute vertical space to allow Headline (35%), Subtext+CTA (20%), and Product Preview (45%) concurrently in a standard 1080p viewport.
2. **Product First Visibility**: The dashboard preview MUST be clearly visible and grounded before the user finishes reading the subheadline.
3. **Scanability**: The headline MUST be restricted in width (~800px) to ensure rapid optical scanning.

---

## 🛑 HALT: User Review Required
**@architect**: I have refactored the structural blueprint to achieve "Top 10%" performance via **Precision Tuning**. This topology ensures "read + see" simultaneity and removes the cognitive load caused by excessive scale.

**Do you approve this Hero Precision Tuning architecture and topology?**
*(You may modify `Technical_Specification.md` before I proceed to Phase 3 Implementation).*
