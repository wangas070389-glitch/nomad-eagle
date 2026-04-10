/**
 * @app / Landing Page (Brand Optimized)
 * High-conversion Marketing Architecture with Brand Anchoring.
 */

import { TopNav } from "../../../app_build/edge/ui/TopNav"
import { LandingHero } from "../../../app_build/edge/ui/LandingHero"
import { FeatureGrid } from "../../../app_build/edge/ui/FeatureGrid"
import { HowItWorks } from "../../../app_build/edge/ui/HowItWorks"
import { TrustSection } from "../../../app_build/edge/ui/TrustSection"
import { MarketingCTA } from "../../../app_build/edge/ui/MarketingCTA"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Nomad Eagle | Know your money. Control your future.",
  description: "High-integrity financial clarity for the modern household. See where your money is going—and where your life is heading.",
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30">
      {/* Global Brand Anchor */}
      <TopNav />
      
      {/* Structural Backdrop */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      
      <div className="relative z-10">
        <LandingHero />
        
        {/* Outcome-Driven Flow (Section 02) */}
        <HowItWorks />

        {/* Branded Trust Section (Section 03) */}
        <TrustSection />

        {/* Dynamic Benefits (Section 04) */}
        <FeatureGrid />

        {/* Branded Conversion Footer (Section 05) */}
        <MarketingCTA />

        <footer className="py-24 border-t border-white/5 text-center text-slate-500 text-sm font-mono tracking-[0.4em] uppercase">
          <p>© 2026 Nomad Eagle | The Ledger Standard</p>
        </footer>
      </div>
    </main>
  )
}
