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

-   **Action**: Force install `date-fns` v3 with legacy peer deps.

### Root Cause Analysis (2026-02-07 Addendum)

The build failure is a **Dependency Resolution Conflict (ERESOLVE)**.

* **Atomic Truth:** Your project is running **React 19.2.3**.
* **Structural Flaw:** `react-day-picker@8.10.1` explicitly defines its peer dependency as `^16.8.0 || ^17.0.0 || ^18.0.0`. It does not support React 19.
* **NPM Behavior:** Since npm v7+, peer dependencies are installed by default. When npm encounters a version (19.x) that falls outside the allowed range of a package, it halts the process to prevent potential runtime instability.

### Decision Matrix

| Option | Action | Risk | Recommendation |
| --- | --- | --- | --- |
| **Upgrade Package** | Install `react-day-picker@next` (v9+) | Low (if API is stable) | **Primary Choice (Long Term)** |
| **Bypass Resolution** | Use `--legacy-peer-deps` | Medium (potential runtime crashes) | **Fallback/Quick Fix** |
| **Downgrade React** | Revert to React 18.x | High (affects entire architecture) | **Rejected** |

### Execution Plan (Updated)

#### 1. The Deployment Fix (Vercel)

To resolve this in the Vercel build environment without manual dashboard intervention, we will add an `.npmrc` file.

* **File:** `.npmrc`
* **Content:** `legacy-peer-deps=true`

#### 2. Mission Statement for Dependency Management

> To **synchronize** package versions for the **Application Core** by **enforcing strict peer dependency alignment**, enabling **build-time stability** while adhering to **React 19 Server-First architectural constraints**.

### Red Team Critique

* **Hole:** Version 9 of `react-day-picker` has breaking API changes compared to version 8.
* **Counter-measure:** The `legacy-peer-deps` flag is the only way to deploy v8 with React 19 without a full rewrite. It introduces a "False Positive" build—it works on the server but might fail in the browser if React 19 removed a hook the library relies on (Risk assessed as Low).
