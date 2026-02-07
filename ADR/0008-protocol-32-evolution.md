# Protocol 32 Report: Strategic Evolution & Wardley Analysis

**Date**: 2026-02-07
**Executor**: The Architect (Protocol 32)
**Context**: Post-Security Hardening (Red Team mitigation complete).

## 1. Wardley Map Analysis

We have mapped the current system components against the Evolution Axis:

| Component | Stage | Status |
| :--- | :--- | :--- |
| **Compute / Hosting** | Commodity | **Stable**. Vercel/Next.js handles this efficiently. |
| **Authentication** | Commodity | **Stable**. NextAuth + OAuth is standard. |
| **Database (CRUD)** | Product | **Stable**. Prisma + Postgres is robust, but querying is rigid. |
| **UI System** | Product | **High Quality**. Shadcn/Tailwind provides premium feel. |
| **Financial Logic** | Product | **Good**. Transfers, Investments, Households present. |
| **Insight / Intelligence** | **Genesis** | **MISSING**. System is "dumb"; it stores data but doesn't understand it. |

## 2. Cynefin Framework Analysis

**Domain Classification**: **Complicated (Orderly/Known Unknowns)**

-   **Context**: Implementing Vector Search (`pgvector`) is a solvable engineering problem with clear expert best practices, but it requires specialized knowledge (embeddings, distance metrics).
-   **Characteristics**: Cause and effect are discoverable but not immediately obvious to non-experts.
-   **Architectural Response**: **Sense-Analyze-Respond**.
    -   *Sense*: Assess current data structure (Transactions).
    -   *Analyze*: Determine appropriate embedding model (e.g., `text-embedding-3-small` vs local) and indexing strategy (IVFFlat vs HNSW).
    -   *Respond*: Implement the solution.

**Nuance (The Complex Edge)**:
While the *database* implementation is Complicated, the *interactive* layer (Natural Language Querying) edges into the **Complex** domain (Unknown Unknowns) due to the unpredictability of user prompts and potential "hallucinations" or adversarial inputs (RAG Injection).
-   **Constraint**: We must apply **Enabling Constraints** (Strict Schemas, System Prompts) to force the system back towards the Complicated domain.

## 3. ROI Analysis (The Opportunity)

The current system is a "System of Record" (store data).
The high-value opportunity is moving to a "System of Intelligence".

-   **Problem**: Users currently search transactions by exact text ("Uber") or category ("Transport").
-   **Opportunity**: Users want to ask "How much did I spend on dates last month?" or "Find that coffee shop in Paris".
-   **Tech Gap**: Standard SQL (`LIKE %...%`) cannot solve this.

## 3. The Proposal: Project "Neural-Ledger"

I propose evolving the database architecture to include **Vector Embeddings** (Protocol 5 & 27).

### Technical Leap
-   **What**: Add `pgvector` to the Postgres instance.
-   **Action**: Generate embeddings for every Transaction description + Category + Merchant.
-   **Outcome**: Enable Semantic Search and RAG (Retrieval-Augmented Generation) for an AI Financial Advisor agent.

### ROI
-   **Cost**: Low (pgvector is open source / standard extension).
-   **Value**: Extremely High. Differentiates Nomad Eagle from every generic finance app.

## 4. Security & Mitigation (Red Team Mandates)

Per `RedTeam/0008-vector-risks.md`, the following controls are **MANDATORY**:

### 4.1 Strict Vector Isolation
All vector search queries MUST include a hard filter for `householdId`.
-   **Bad**: `SELECT * FROM items ORDER BY embedding <-> query LIMIT 5`
-   **Good**: `SELECT * FROM items WHERE household_id = current_user_id ORDER BY embedding <-> query LIMIT 5`

### 4.2 RAG Injection Defense
-   **Input Sanitization**: User inputs must be treated as untrusted.
-   **System Prompting**: AI Agents must be instructed to treat retrieved context as "Data" and not "Instructions".
-   **Rate Limiting**: Embedding generation must be rate-limited to prevent cost-based DoS.

## 5. Immediate Next Steps

1.  **ADR 0008**: Formalize decision to adopt `pgvector`.
2.  **Prototype**: Create `embedding.ts` service (using OpenAI or local model).
3.  **Migration**: Add `embedding` column to `Transaction` table.
