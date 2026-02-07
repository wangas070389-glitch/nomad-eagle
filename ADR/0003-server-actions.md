# 3. Use Server Actions for Data Mutations

Date: 2026-02-07

## Status

Accepted

## Context

We need a standard way to handle form submissions and data mutations (Create, Update, Delete). API routes can be verbose and require separate client-side fetching logic.

## Decision

We will primarily use **React Server Actions** for all data mutations.

-   Actions are defined in `src/server/actions`.
-   They are invoked directly from client components (via `useActionState` or form `action` prop).
-   They handle input validation (Zod), authorization, and database interaction.

## Consequences

-   **Simplicity**: No need to manually define API endpoints or manage `fetch` calls.
-   **Type Safety**: Arguments and return types are fully typed.
-   **Progressive Enhancement**: Works without JS if designed correctly (though verify application requirements).
