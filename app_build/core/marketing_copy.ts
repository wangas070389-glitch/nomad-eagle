import { BRAND_IDENTITY } from "./brand_identity";

/**
 * @core / Precision-Tuned Marketing Copy (TTU Optimization)
 * Enforcing forced line breaks and high-conversion micro-copy.
 * Target: 100% Time-to-Understanding (TTU).
 */

export const LANDING_PAGE_CONTENT = {
  hero: {
    brandPrefix: BRAND_IDENTITY.shortTagline,
    title: "See where your money is going—\nand where your life is heading.",
    subtitle: BRAND_IDENTITY.tagline,
    ctaLabel: BRAND_IDENTITY.navigation.actions.start.label,
    ctaMicrocopy: "Free • Takes 60 seconds",
    secondaryCta: "See my future (60s)"
  },
  howItWorks: {
    title: "How it works",
    steps: [
      {
        id: "step-1",
        label: "01",
        title: "Add your money",
        description: "Add your income, expenses, and goals in under 2 minutes. Simple, fast, and no spreadsheets."
      },
      {
        id: "step-2",
        label: "02",
        title: "See your future instantly",
        description: "Know immediately if you're on track or falling behind. See the direct trajectory of your wealth."
      },
      {
        id: "step-3",
        label: "03",
        title: "Fix it with simple changes",
        description: "Adjust your spending and see the long-term impact on your net worth immediately."
      }
    ]
  },
  benefits: [
    {
      id: "clarity",
      title: "Your money, fully organized",
      description: "Stop guessing. Every transaction is in one place, automatically tracked and categorized for absolute clarity.",
      icon: "ShieldCheck"
    },
    {
      id: "confidence",
      title: "See your future before it happens",
      description: "Test different financial decisions and see how they change your future net worth instantly.",
      icon: "Orbit"
    },
    {
      id: "trust",
      title: "Numbers you can trust",
      description: "Built on a financial-grade ledger that keeps every transaction accurate, verifiable, and 100% private.",
      icon: "Lock"
    }
  ],
  trust: {
    title: `Why ${BRAND_IDENTITY.name} is different`,
    description: "Most apps guess your balance based on fragmented data. Nomad Eagle uses a high-integrity financial ledger to ensure every transaction is accurate and verifiable. It's the standard for those who take their future seriously.",
    provenanceLabel: "100% Cryptographically Verified Integrity Score",
    buttonLabel: "Read the Whitepaper"
  }
};
