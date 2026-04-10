/**
 * @core / Brand Identity Invariants
 * Hermetic source-of-truth for the Nomad Eagle brand.
 */

export const BRAND_IDENTITY = {
  name: "Nomad Eagle",
  tagline: "Know your money. Control your future.",
  shortTagline: "Financial clarity for your household.",
  theme: {
    primary: "#4f46e5", // Indigo 600
    background: "#020617", // Slate 950
  },
  navigation: {
    links: [
      { label: "Features", href: "#features" },
      { label: "Why us", href: "#why-us" },
    ],
    actions: {
      signIn: { label: "Sign in", href: "/sign-in" },
      start: { label: "Start my plan", href: "/sign-up" },
    }
  }
};
