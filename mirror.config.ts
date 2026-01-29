export const MIRROR_CONFIG = {
    // 1. COLOR SPACE (The P3 Standard)
    color: {
        space: "OKLCH",
        gamut: "P3", // Wide color support required
        base_luminance: 0.15, // Perfect dark mode baseline
    },
    // 2. MATERIALS
    material: {
        glass: {
            blur_radius: "12px",
            opacity: 0.7,
            border_opacity: 0.1,
        },
        shadows: {
            color: "oklch(0% 0 0 / 0.25)",
            blur_step: 4, // Multiplier for depth layers
        },
    },
    // 3. ELEVATION TOKENS
    elevation: {
        surface: "0px",
        raised: "4px", // Small lift
        floating: "16px", // Modals
        emergency: "64px", // Critical alerts/Toasts
    },
} as const;
