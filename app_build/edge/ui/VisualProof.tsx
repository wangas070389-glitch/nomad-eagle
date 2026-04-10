"use client"

import { motion } from "framer-motion"

/**
 * @edge / Landing Visual Proof
 * Surfacing the dashboard reality to ground the marketing claims in visual proof.
 */

export function VisualProof() {
  return (
    <section className="relative w-full max-w-6xl mx-auto px-4 pb-24 -mt-24">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        viewport={{ once: true }}
        className="relative group cursor-default shadow-[0_50px_100px_rgba(79,70,229,0.2)] rounded-[2.5rem] overflow-hidden border border-white/10 bg-slate-900/50 backdrop-blur-3xl"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
        
        {/* Dashboard Preview Frame */}
        <div className="relative aspect-[16/7.5] w-full overflow-hidden">
          <img 
            src="/dashboard_preview.png" 
            alt="Nomad Eagle Dashboard - Sovereign Household Proof" 
            className="w-full h-full object-cover object-top opacity-90 group-hover:opacity-100 transition-opacity duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#020617]/80" />
        </div>

        {/* Dynamic Trust Overlay */}
        <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row items-center justify-between text-sm text-slate-400 font-mono">
          <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-full border border-white/5 whitespace-nowrap mb-4 md:mb-0">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            LIVE SIMULATION ENGINE: 100% HEALTHY
          </div>
          <div className="px-4 py-2 rounded-full bg-white/5 border border-white/5">
            LEAVE THE SPREADSHEETS BEHIND.
          </div>
        </div>
      </motion.div>
    </section>
  )
}
