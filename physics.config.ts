export const PHYSICS_CONFIG = {
    // 1. THE SOLVER
    engine: "SPRING_DYNAMICS", // Options: SPRING, BOUNCE, INERTIAL
    // 2. GLOBAL CONSTANTS
    constants: {
        stiffness: 120, // Tension of the spring (How fast it wants to return)
        damping: 14, // Friction (How fast it stops oscillating)
        mass: 1.0, // Weight of the UI element
        precision: 0.01, // When to stop calculating (Energy threshold)
    },
    // 3. INTERACTION PROSETS
    presets: {
        snappy: { stiffness: 210, damping: 20 }, // For Buttons/Toggles
        gentle: { stiffness: 100, damping: 30 }, // For Modals/Page Transitions
        bouncy: { stiffness: 400, damping: 10 }, // For Notifications/Alerts
    },
    // 4. PERFORMANCE GATES
    performance: {
        use_hardware_acceleration: true,
        fps_limit: 120,
        disable_on_low_power: false, // Narciso is non-negotiable
    },
} as const;
