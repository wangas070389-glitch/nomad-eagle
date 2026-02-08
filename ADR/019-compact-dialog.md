# 19. Compact Transaction Dialog Layout

Date: 2026-02-07

## Status

Proposed

## Context

**Problem**: The "Add Transaction" dialog overflows the viewport on standard screens. 
**Constraint**: The user explicitly rejected a "Scrollable" solution (ADR 017). The requirement is "everything fits in the box with aesthetics".
**Analysis**: The current layout stacks most fields vertically, wasting horizontal space.

## Decision

We will refactor the `AddTransactionDialog` form to use a **Dense Grid Layout**.

### Layout Strategy
1.  **Grid Optimization**: Group related fields on the same row.
    -   *Row 1*: Type (30%) | Amount (70%)
    -   *Row 2*: Date (50%) | Spent By (50%) [or Category if Spent By is hidden]
    -   *Row 3*: Category (Full or 50%)
    -   *Row 4*: Account Selection (Source -> Dest or Single Account)
    -   *Row 5*: Description (Full Width)
2.  **Spacing**: Reduce `gap-4` to `gap-3` or `gap-2` where appropriate.
3.  **Labels**: Use smaller text or compact labels if needed, but standard labels usually fit.

### Aesthetic Goal
Achieve a "Dashboard Control Panel" feel rather than a "Long Form" feel.

## Consequences
-   **Pros**: No scrolling required. Information is denser and easier to scan. Bountiful aesthetic.
-   **Cons**: Inputs are narrower.
