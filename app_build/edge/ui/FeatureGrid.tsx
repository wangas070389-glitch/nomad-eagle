"use client"

import { motion } from "framer-motion"
import { BenefitService } from "../../core/benefit_service"
import { ShieldCheck, Orbit, Lock } from "lucide-react"

/**
 * @edge / Landing Feature Grid (Top 10% Optimized)
 * Dynamically renders the 'Consequential' benefit stack from @core.
 * Pivoted from 'Track, plan, improve' to 'Know, Change, Fix'.
 */

const iconMap: Record<string, any> = {
  ShieldCheck: ShieldCheck,
  Orbit: Orbit,
  Lock: Lock,
}

export function FeatureGrid() {
  const service = new BenefitService()
  const benefits = service.getPrimaryBenefits()

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-indigo-600/5 -z-10 blur-3xl opacity-50 translate-y-24" />
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        {benefits.map((benefit, index) => {
          const Icon = iconMap[benefit.icon] || ShieldCheck
          return (
            <motion.div
              key={benefit.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="p-10 rounded-[3rem] group transition-all duration-500 glass-card bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/30 shadow-2xl shadow-black/20"
            >
              <div className="h-20 w-20 rounded-3xl bg-indigo-600/20 shadow-inner flex items-center justify-center mb-8 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <Icon size={36} />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">
                {benefit.title}
              </h3>
              
              <p className="text-slate-400 leading-relaxed text-lg group-hover:text-slate-200 transition-colors">
                {benefit.description}
              </p>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
