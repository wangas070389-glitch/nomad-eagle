"use client"

import { motion } from "framer-motion"
import { Logo } from "./Logo"
import { BRAND_IDENTITY } from "../../core/brand_identity"
import Link from "next/link"
import { Button } from "@/components/ui/button"

/**
 * @edge / Landing Top Navigation
 * Persistent navigational anchor with blurred glassmorphism.
 * Establishing brand legitimacy and orientation.
 */

export function TopNav() {
  const { navigation } = BRAND_IDENTITY

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 inset-x-0 z-50 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between p-3 px-6 rounded-full border border-white/10 bg-black/40 backdrop-blur-3xl shadow-2xl shadow-indigo-500/10">
        <Logo />
        
        <nav className="hidden md:flex items-center gap-10">
          {navigation.links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-slate-400 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          <Link href={navigation.actions.signIn.href} className="text-white hover:text-indigo-400 text-sm font-bold transition-colors">
            {navigation.actions.signIn.label}
          </Link>
          <Link href={navigation.actions.start.href}>
            <Button className="h-10 px-6 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20">
              {navigation.actions.start.label}
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  )
}
