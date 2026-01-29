export const CORE_CONFIG = {
    // 1. PURITY RULES
    logic: {
        enforce_pure_functions: true, // No side effects in business math
        allow_direct_io: false, // Core cannot call 'fetch' or 'fs' directly
    },
    // 2. VALIDATION
    validation: {
        input_strategy: "ZOD_SCHEMA", // Every entry point must be validated
        strict_null_checks: true,
    },
    // 3. ERROR HANDLING
    errors: {
        use_domain_exceptions: true, // Errors must be 'InsufficientFunds', not '400 Bad Request'
        traceability: "MANDATORY",
    },
    // 4. DEPENDENCY INVERSION
    injection: {
        use_interfaces: true, // Core depends on Interfaces, not Implementations
    },
} as const;
