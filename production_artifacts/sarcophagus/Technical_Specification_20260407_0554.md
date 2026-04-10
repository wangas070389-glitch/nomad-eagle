# 🏗️ Technical Specification: Brand Anchoring & Identity

## ⚛️ Architectural Topology: The Identity & Recall Layer
Pivoting from a "feature landing page" to a "premium financial brand" (Nomad Eagle).

### 🔴 app_build/core/marketing_copy.ts (Identity Invariants)
Rewriting the narrative to enforce the Brand Memory Line.
- **Brand Name**: Standardized as "Nomad Eagle".
- **Brand Memory Line**: "Know your money. Control your future."
- **Trust Section Refactor**: Moving from "Ledger Superpower" to "Why Nomad Eagle is different" (Market Contrast).

### 🟢 app_build/edge/ (The Brand Infrastructure)
- `ui/TopNav.tsx`: **[NEW]** Persistent navigational anchor with blurred glassmorphism.
- `ui/Logo.tsx`: **[NEW]** Minimalist, premium wordmark + N mark lockup.
- `ui/LandingHero.tsx**: Updated to include the micro-brand identity line.
- `ui/TrustSection.tsx**: Refactored for market-differentiation narratives.
- `app_build/core/brand_identity.ts**: **[NEW]** Hermetic brand assets (Naming, Taglines, Primary Colors).

---

## ⚡ Core Invariants
1. **Persistent Anchor**: The Branding (TopNav) MUST be visible at all times during the scroll journey.
2. **Clarity First, Identity Second**: Branding elements MUST NOT compete with primary headlines; they should reinforce them as a background "legitimacy layer".
3. **Market Contrast**: All trust claims MUST explicitly or implicitly contrast Nomad Eagle against "generic budgeting tools".

---

## 🛑 HALT: User Review Required
**@architect**: I have refactored the structural blueprint to establish a durable "Brand Anchor" (Nomad Eagle). This topology ensures that users not only understand the value (Conversion) but remember the identity (Recall).

**Do you approve this Brand Anchoring architecture and topology?**
*(You may modify `Technical_Specification.md` before I proceed to Phase 3 Implementation).*
