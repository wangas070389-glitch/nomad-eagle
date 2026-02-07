# 2. Technology Stack Selection

Date: 2026-02-07

## Status

Accepted

## Context

We need a modern, type-safe, and performant stack for building a full-stack web application.

## Decision

We have selected the following core technologies:

1.  **Framework**: **Next.js (App Router)** for its React Server Components, routing, and full-stack capabilities.
2.  **Language**: **TypeScript** for strict type safety and developer experience.
3.  **Database ORM**: **Prisma** for its intuitive schema definition and type-safe database queries.
4.  **Styling**: **Tailwind CSS** for utility-first styling and rapid UI development.
5.  **Component Library**: **Shadcn UI** (based on Radix UI) for accessible, customizable, and copy-pasteable components.
6.  **Authentication**: **NextAuth.js** for secure and flexible authentication.

## Consequences

-   **Uniformity**: A cohesive ecosystem (React/TS/Tailwind) reduces context switching.
-   **Performance**: Server Components reduce client-side JavaScript.
-   **Velocity**: High-level abstractions (Prisma, Next.js) speed up development.
