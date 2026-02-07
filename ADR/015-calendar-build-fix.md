# 15. Corrective: Calendar Component Version Mismatch

Date: 2026-02-07

## Status

Proposed

## Context

**Incident**: The build failed on Vercel with a TypeScript error in `components/ui/calendar.tsx`: `Property 'IconLeft' does not exist on type 'Partial<CustomComponents>'`.
**Root Cause**:
-   We installed `react-day-picker@latest` which is now **v9**.
-   The `shadcn/ui` calendar component code we added provides `IconLeft` and `IconRight`, which are **v8** APIs.
-   v9 introduces breaking changes to component names and styling classes.

## Decision

We will **Downgrade to `react-day-picker` v8.10.1**.

### Rationale
1.  **Stability**: The current `shadcn/ui` implementation is designed and tested for v8.
2.  **Speed**: Adapting the component to v9 requires rewriting the `classNames` mapping and component slots, which introduces UI regression risks.
3.  **Compatibility**: v8 is stable and sufficient for our needs (Date Picking).

### Implementation
-   Command: `npm install react-day-picker@^8.10.1 date-fns` (Ensure date-fns matches).
-   Verify build.

## Consequences

-   **Pros**: Immediate build fix. Consistent styling.
-   **Cons**: We are on an "older" major version (but it is the LTS for Shadcn currently).

## Addendum: React 19 Peer Dependency Conflict (2026-02-07)
**Incident**: `npm install` failed again because `react-day-picker` v8 specifies `peerDependencies: react@^18`, but we are running React 19.
**Resolution**: Use `--legacy-peer-deps`.
-   **Risk**: Low. React 19 is designed to run React 18 components.
-   **Action**: Force install `date-fns` v3 with legacy peer deps.
