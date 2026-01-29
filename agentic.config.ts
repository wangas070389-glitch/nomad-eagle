export const AGENTIC_CONFIG = {
    // 1. DISCOVERY
    discovery: {
        manifest_path: "/public/semantic-manifest.json",
        auto_generate_docs: true,
        supported_llm_formats: ["OPENAI_TOOLS", "ANTHROPIC_TOOLS"],
    },
    // 2. SAFETY (THE AIR GAP)
    safety: {
        human_in_the_loop_threshold: "HIGH_RISK_ONLY", // or "ALWAYS"
        max_tokens_per_interaction: 4096,
        forbidden_verbs: ["DROP", "DELETE_ALL", "GRANT_ADMIN"],
    },
    // 3. SEMANTICS
    metadata: {
        include_descriptions: true,
        provide_example_payloads: true,
        stateful_context: "REDIS_BUFFER", // Where Agent memory is stored
    },
} as const;
