"use client"

import { BRAND_IDENTITY } from "../../core/brand_identity"

/**
 * @edge / Nomad Eagle Logo
 * Minimalist, premium vector mark (N / NE) for brand anchoring.
 */

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 font-bold text-white tracking-widest ${className}`}>
      {/* Abstract N Mark */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 text-indigo-500"
      >
        <path
          d="M4 20L4 4L16 20L16 4"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="18" cy="6" r="2" fill="white" />
      </svg>
      
      <span className="text-xl uppercase">{BRAND_IDENTITY.name}</span>
    </div>
  )
}
