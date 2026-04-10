/**
 * @core / Benefit Service
 * Pure business logic for mapping technical data to user-centric benefits.
 * Zero external imports allowed.
 */

import { LANDING_PAGE_CONTENT } from "./marketing_copy";

export interface BenefitItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export class BenefitService {
  /**
   * Returns the primary benefit stack for the landing page.
   * This is a deterministic pure function.
   */
  getPrimaryBenefits(): BenefitItem[] {
    return LANDING_PAGE_CONTENT.benefits.map(b => ({
      id: b.id,
      title: b.title.toUpperCase(), // Presentation logic for the specific "Tactical" feel
      description: b.description,
      icon: b.icon
    }));
  }

  /**
   * Logic to determine the active CTA based on the lead context.
   */
  determineCTAType(context?: { hasHistory: boolean }): string {
    if (context?.hasHistory) return "RECONNECT_TO_HOUSEHOLD";
    return "INITIALIZE_NEW_SOVEREIGN_HOUSEHOLD";
  }
}
