export const TELEMETRY_CONFIG = {
    // 1. TRACING (The Red Thread)
    tracing: {
        provider: "OPENTELEMETRY",
        sampling_rate: 0.1, // 10% of traffic (100% in Dev)
        headers: ["x-trace-id", "x-request-id"],
    },
    // 2. LOGGING (The Context)
    logging: {
        format: "JSON",
        level: "INFO",
        redact: ["password", "ssn", "credit_card"], // Mandatory PII Shield
    },
    // 3. METRICS (The Vital Signs)
    metrics: {
        interval_seconds: 15,
        common_labels: ["environment", "version", "region"],
        custom_slis: ["pension_calc_latency", "db_pool_utilization"],
    },
    // 4. ALERTS (The Sentinel)
    alerts: {
        error_rate_threshold: 0.01, // 1% failure triggers WAR_TIME
        latency_p95_ms: 500,
    },
} as const;
