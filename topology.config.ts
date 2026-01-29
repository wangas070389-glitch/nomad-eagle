export const TOPOLOGY_STANDARD = {
    layers: {
        // LAYER 4: ORCHESTRA
        // - Who: Humans, AI Agents, Cron Jobs
        // - Role: Triggers actions
        orchestra: {
            level: 4,
            allowed_imports: ["edge"],
            forbidden_imports: ["core", "bedrock"], // Must go through Edge
        },
        // LAYER 3: EDGE
        // - Who: REST API, GraphQL, React Components, CLI
        // - Role: Validation, Routing, Rendering
        edge: {
            level: 3,
            allowed_imports: ["core"],
            forbidden_imports: ["bedrock"], // Never touch DB directly
        },
        // LAYER 2: CORE
        // - Who: Business Logic, Pricing Engines, Approval Flows
        // - Role: Pure Logic, Domain State
        core: {
            level: 2,
            allowed_imports: ["bedrock"],
            forbidden_imports: ["edge", "orchestra"], // BLIND to the world
        },
        // LAYER 1: BEDROCK
        // - Who: SQL Clients, Redis Wrappers, File System
        // - Role: Storage, I/O
        bedrock: {
            level: 1,
            allowed_imports: [], // Can import NOTHING
            forbidden_imports: ["core", "edge", "orchestra"],
        },
    },
    // STRICTNESS
    rules: {
        allow_circular: false,
        allow_siblings: true, // Core can import other Core files
    },
} as const;
