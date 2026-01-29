export const METAMORPHOSIS_CONFIG = {
    // PHASE 0: TOURNIQUET (Stabilization)
    tourniquet: {
        // Before touching code, we must capture its behavior.
        require_golden_master: true,
        min_test_cases: 50,
    },
    // PHASE 1: ISOLATION (The Proxy)
    isolation: {
        // The pattern for naming the "Toxic" legacy wrappers
        adapter_prefix: "LegacyAdapter_",
        // If strict, the Legacy Adapter marks all inputs as 'unknown' or 'any'
        mark_types_unsafe: true,
    },
    // PHASE 2: SHADOW MODE (The Test)
    shadow: {
        // How much traffic to send to the New System? (0.0 to 1.0)
        traffic_sample_rate: 1.0,
        // Does the New System write to the Real DB?
        // FALSE = Read-Only / Dry-Run (Safe)
        // TRUE = Dual-Write (Complex, use with caution)
        allow_dual_write: false,
        // If New System throws error, swallow it?
        suppress_shadow_errors: true,
    },
    // PHASE 3: CUTOVER (The Kill)
    cutover: {
        // Conditions to switch traffic 100% to New System
        requirements: {
            error_rate_delta: 0.0, // New system must not error more than old
            latency_max_increase_ms: 50, // New system can be slightly slower
            parity_success_rate: 1.0, // 100% Match on Golden Master
        },
    },
} as const;
