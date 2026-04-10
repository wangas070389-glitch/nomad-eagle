"use client"

import { motion } from "framer-motion"
import { LANDING_PAGE_CONTENT } from "../../core/marketing_copy"

/**
 * @edge / Landing How It Works (Top 10% Optimized)
 * Outcome-driven high-conversion flow (Add -> Know -> Fix).
 */

export function HowItWorks() {
  const { howItWorks } = LANDING_PAGE_CONTENT

  return (
    <section className="py-24 px-4 bg-slate-900/40 relative">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
      <div className="max-w-6xl mx-auto">
        <h2 className="text-sm font-bold tracking-widest text-indigo-400 uppercase text-center mb-24 font-mono">
          {howItWorks.title}
        </h2>
        
        <div className="grid md:grid-cols-3 gap-16 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-[40px] left-[15%] right-[15%] h-px bg-white/5 border-t border-dashed border-white/10 -z-10" />

          {howItWorks.steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center space-y-8"
            >
              <div className="h-20 w-20 rounded-[2rem] bg-indigo-600 border border-indigo-500 shadow-2xl shadow-indigo-500/40 flex items-center justify-center text-2xl font-bold text-white mb-2 rotate-3 hover:rotate-0 transition-transform duration-300">
                {step.label}
              </div>
              
              <div className="space-y-4">
                <h3 className="text-3xl font-bold text-white">
                  {step.title}
                </h3>
                <p className="text-slate-400 leading-relaxed text-lg px-2">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
