export const STRATEGY_CONFIG = {
    // 1. SOLVENCY THRESHOLDS (Internal Health)
    solvency: {
        solvent_threshold: 90, // Above this, we are Green
        bankrupt_threshold: 50, // Below this, we are Dead
    },
    // 2. GRAVITY DEFINITIONS (External Demand)
    gravity: {
        high_pull_indicators: [
            "retention_gt_40_percent",
            "organic_growth_gt_10_percent_mom",
            "critical_user_dependency", // Users lose money if down
        ],
        low_push_indicators: [
            "high_churn",
            "sales_driven_growth",
            "commodity_market",
        ],
    },
    // 3. VECTOR DEFINITIONS (The Output)
    vectors: {
        VECTOR_A: {
            name: "AFTERBURNER",
            mode: "PEACE_TIME",
            action: "SCALE_AGGRESSIVELY",
            feature_freeze: false,
        },
        VECTOR_B: {
            name: "STABILIZER",
            mode: "WAR_TIME",
            action: "REFACTOR_CORE",
            feature_freeze: true,
        },
        VECTOR_C: {
            name: "EJECTION",
            mode: "TERMINATION",
            action: "SALVAGE_AND_SHUTDOWN",
            feature_freeze: true,
        },
    },
} as const;
