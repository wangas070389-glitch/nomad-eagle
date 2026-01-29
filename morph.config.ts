export const MORPH_CONFIG = {
    // 1. TRANSITION STRATEGY
    strategy: {
        type: "VIEW_TRANSITIONS_API", // Native browser support where available
        fallback: "FLIP_ANIMATION", // First, Last, Invert, Play
        duration_scaling: "NON_LINEAR", // Longer paths take slightly more time
    },
    // 2. ELEMENT MATCHING
    matching: {
        attribute: "data-morph-id", // The unique key to link elements across views
        enforce_unique_keys: true,
    },
    // 3. MORPH BEHAVIORS
    behaviors: {
        crossfade_threshold: 0.3, // When to swap internal content during morph
        stagger_children: true, // List items entrance/exit delay
        stagger_delay_ms: 20,
    },
} as const;
