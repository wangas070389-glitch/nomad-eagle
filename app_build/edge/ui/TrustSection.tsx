"use client"

import { motion } from "framer-motion"
import { LANDING_PAGE_CONTENT } from "../../core/marketing_copy"
import { ShieldCheck, HardDrive, Lock, AlertCircle, CheckCircle2 } from "lucide-react"

/**
 * @edge / Landing Trust Section (Brand Pivot)
 * Implementing 'Market Contrast' to establish brand authority.
 */

export function TrustSection() {
  const { trust } = LANDING_PAGE_CONTENT

  return (
    <section id="why-us" className="py-32 px-4 relative overflow-hidden bg-slate-900/20">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent" />
      
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex-1 space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold uppercase tracking-widest">
            The Difference
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
            {trust.title}
          </h2>
          
          <p className="text-xl text-slate-400 leading-relaxed max-w-xl">
            {trust.description}
          </p>

          <div className="space-y-4 pt-4">
               <div className="flex items-start gap-4 p-4 rounded-2xl bg-red-500/5 border border-red-500/10 grayscale hover:grayscale-0 transition-all duration-500">
                   <AlertCircle className="text-red-500 mt-1 shrink-0" size={20} />
                   <div className="space-y-1">
                       <p className="font-bold text-slate-300">Generic Tools</p>
                       <p className="text-sm text-slate-500">Guessing your balance based on Fragmented, delayed data.</p>
                   </div>
               </div>
               <div className="flex items-start gap-4 p-4 rounded-3xl bg-indigo-500/10 border border-indigo-500/20">
                   <CheckCircle2 className="text-indigo-500 mt-1 shrink-0" size={20} />
                   <div className="space-y-1">
                       <p className="font-bold text-white">Nomad Eagle</p>
                       <p className="text-sm text-slate-400">Verifying every transaction against a high-integrity financial ledger.</p>
                   </div>
               </div>
          </div>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.8, delay: 0.2 }}
           viewport={{ once: true }}
           className="flex-1 w-full"
        >
          <div className="glass-card p-8 md:p-14 rounded-[3.5rem] border border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden shadow-2xl shadow-indigo-500/10">
            <h3 className="text-sm font-bold text-indigo-400 tracking-wider uppercase mb-12 flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              {trust.provenanceLabel}
            </h3>

            <div className="space-y-6">
              {[
                { label: "Cryptographic Integrity", value: "VERIFIED", icon: <ShieldCheck size={18} /> },
                { label: "Immutable Provenance", value: "HEALTHY", icon: <HardDrive size={18} /> },
                { label: "Zero-Trust Isolation", value: "ACTIVE", icon: <Lock size={18} /> }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-black/40 border border-white/5 group hover:border-indigo-500/30 transition-colors">
                  <div className="flex items-center gap-4 text-white font-medium">
                    <span className="text-indigo-400 group-hover:scale-110 transition-transform">{item.icon}</span>
                    {item.label}
                  </div>
                  <div className="px-3 py-1.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold tracking-tighter">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
