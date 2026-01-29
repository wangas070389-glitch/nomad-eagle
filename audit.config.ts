export const AUDIT_CONFIG = {
    // PHASE 1: EXISTENTIAL (Strategy)
    strategy: {
        // If >20% of code is Auth/Billing/UI-Lib, we are building a commodity.
        max_commodity_ratio: 0.20,
        // Ratio of Services to Developers. >0.5 means too many microservices.
        max_service_dev_ratio: 0.5,
    },
    // PHASE 2: STRUCTURAL (Architecture)
    architecture: {
        // Zero tolerance for circular dependencies.
        allow_circular_dependencies: false,
        // Strict Layer Definition (The Gravity Well).
        layers: [
            { name: "bedrock", allowImports: [] },
            { name: "core", allowImports: ["bedrock"] },
            { name: "edge", allowImports: ["core"] },
            { name: "orchestra", allowImports: ["edge"] },
        ],
    },
    // PHASE 3: IMPLEMENTATION (Code)
    code: {
        // Strict Type Safety.
        forbid_any_type: true,
        forbid_ts_ignore: true,
        // Performance Limits.
        max_bundle_size_kb: 200,
        max_cyclomatic_complexity: 10,
    },
    // PHASE 4: RESILIENCY (Security)
    security: {
        block_on_critical_vuln: true,
        require_sbom: true,
        require_zero_trust_headers: true,
    },
} as const;
