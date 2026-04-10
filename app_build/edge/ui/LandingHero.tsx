"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { LANDING_PAGE_CONTENT } from "../../core/marketing_copy"
import Link from "next/link"
import { VisualProof } from "./VisualProof"

/**
 * @edge / Landing Hero (Precision Tuned)
 * Optimizing for Time-to-Understanding (TTU) via Scale & Spacing.
 * Ratio: 35/20/45.
 */

export function LandingHero() {
  const { hero } = LANDING_PAGE_CONTENT

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden pt-32">
      {/* Background Ambience - Reduced vertical intensity */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[500px] bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.12),transparent)]" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center space-y-4 max-w-[800px] mb-12"
      >
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-1">
          <span className="h-1 w-1 rounded-full bg-indigo-500 animate-pulse" />
          {hero.brandPrefix}
        </div>

        {/* Scaled & Restricted Headline */}
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-white leading-[1.15] whitespace-pre-line">
          {hero.title}
        </h1>
        
        {/* Tightened Subtitle */}
        <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-[700px] leading-relaxed px-4">
          {hero.subtitle}
        </p>

        {/* High-Intent CTA with Microcopy */}
        <div className="pt-6 flex flex-col items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/sign-up">
              <Button size="lg" className="h-16 px-12 text-xl bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95">
                {hero.ctaLabel}
              </Button>
            </Link>
            <Button variant="ghost" size="lg" className="h-16 px-10 text-lg rounded-full border border-white/10 hover:bg-white/5 backdrop-blur-sm">
              {hero.secondaryCta}
            </Button>
          </div>
          <span className="text-xs font-mono text-slate-500 tracking-widest uppercase">
            {hero.ctaMicrocopy}
          </span>
        </div>
      </motion.div>

      {/* Proof Layer - Pull-up integrated via component mapping */}
      <VisualProof />
    </section>
  )
}
