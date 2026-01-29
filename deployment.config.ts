export const GITOPS_CONFIG = {
    // 1. STRATEGY
    strategy: {
        type: "BLUE_GREEN", // or CANARY, or ROLLING
        auto_rollback: true, // Revert if Health Check fails
        health_check_timeout: 300, // Seconds to wait for stability
    },
    // 2. INFRASTRUCTURE AS CODE (IaC)
    provisioning: {
        tool: "TERRAFORM", // or CLOUDFORMATION, or PULUMI
        drift_detection: "BLOCK", // Block PRs if manual changes exist
    },
    // 3. ENVIRONMENTS
    environments: {
        staging: { branch: "develop", auto_deploy: true },
        production: { branch: "main", require_approval: true },
    },
    // 4. ARTIFACTS
    artifacts: {
        base_image: "alpine-node:20", // Lightweight & Secure
        registry: "ghcr.io/org/app",
    },
} as const;
