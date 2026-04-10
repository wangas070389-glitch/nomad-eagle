"use client"

import { motion } from "framer-motion"
import { BRAND_IDENTITY } from "../../core/brand_identity"

/**
 * @edge / Marketing CTA (Brand Optimized)
 * High-intent primary footer CTA with Brand Memory Line.
 */

export function MarketingCTA() {
  return (
    <section className="py-48 px-4 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-5xl mx-auto glass-card p-24 rounded-[4.5rem] border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-transparent shadow-2xl shadow-indigo-500/10"
      >
        <span className="text-indigo-400 font-bold uppercase tracking-[0.3em] mb-12 block">
          {BRAND_IDENTITY.name}
        </span>

        <h2 className="text-4xl md:text-7xl font-bold mb-10 text-white tracking-tight">
          Start your plan in 60 seconds—no spreadsheets, no stress.
        </h2>
        
        <p className="text-slate-400 mb-14 text-2xl leading-relaxed max-w-2xl mx-auto font-medium">
          Join the households that are taking control of their trajectory before it's too late.
        </p>

        <div className="flex flex-col items-center gap-8 justify-center">
          <a href="/sign-up" className="px-20 py-6 rounded-full bg-white text-black text-2xl font-bold hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/5">
            Start my plan
          </a>
          <p className="text-indigo-500/60 font-mono text-sm tracking-widest uppercase">
            {BRAND_IDENTITY.tagline}
          </p>
        </div>
      </motion.div>
    </section>
  )
}
