export const BEDROCK_CONFIG = {
    // 1. IDENTITY (The Time-Ordered Law)
    identity: {
        primary_key: "UUIDv7", // Mandatory: Time-ordered, decentralized, sortable
        naming_convention: "snake_case",
        enforce_foreign_keys: true,
    },
    // 2. PERSISTENCE ENGINE
    storage: {
        type: "DISTRIBUTED_SQL", // e.g., Postgres, CockroachDB, TiDB
        migrations: "DECLARATIVE", // Schema as code
        transaction_isolation: "SERIALIZABLE", // Maximum safety
    },
    // 3. SEMANTIC MEMORY (AI Integration)
    vector: {
        provider: "INTEGRATED", // Vectors live inside the relational DB (e.g., pgvector)
        dimensions: 1536, // Standard for modern LLM embeddings
        index_type: "HNSW", // Trade-off: High memory usage for extreme speed
    },
    // 4. RETENTION & AUDIT
    retention: {
        soft_delete: true, // Never 'DELETE'; use 'deleted_at'
        temporal_tracking: true, // 'created_at' and 'updated_at' on every row
        audit_logging: "CDC", // Change Data Capture for history
    },
} as const;
