# 1. Adopt Modular Monolith Architecture

Date: 2026-02-07

## Status

Accepted

## Context

The project requires a scalable yet manageable architecture that allows for rapid iteration without the complexity of microservices. We need clear boundaries between different business domains (Transactions, Wealth, Auth) while maintaining a single deployable unit.

## Decision

We will adopt a **Modular Monolith** architecture.

-   **Structure**: The codebase is organized by feature/domain (e.g., `components/dashboard`, `components/wealth`, `server/actions`).
-   **Communication**: Modules communicate via direct function calls (Server Actions) rather than network calls, preserving transactional integrity.
-   **Database**: A single shared database (PostgreSQL via Prisma) is used, but domains should ideally own their schema sections.

## Consequences

-   **Pros**: Simplified deployment, easier refactoring, shared types, transactional consistency.
-   **Cons**: Potential for tight coupling if boundaries aren't enforced.
