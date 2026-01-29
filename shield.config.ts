export const SHIELD_CONFIG = {
    // 1. IDENTITY & AUTH
    auth: {
        provider: "OIDC_COMPLIANT",
        token_expiry_seconds: 3600, // 1 Hour
        mfa_required: true,
        allow_anonymous_access: false,
    },
    // 2. DATA PROTECTION
    encryption: {
        algorithm: "AES-256-GCM",
        key_rotation_days: 30,
        pii_fields: ["email", "ssn", "phone", "salary"],
    },
    // 3. TRAFFIC DEFENSE
    network: {
        rate_limit_per_minute: 100,
        cors_allowed_origins: ["https://app.example.com"],
        enforce_https: true,
    },
    // 4. THREAT RESPONSE
    forensics: {
        log_all_denials: true,
        auto_block_on_suspicious_activity: true,
    },
} as const;
