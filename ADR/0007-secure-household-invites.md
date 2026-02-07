# 7. Secure Household Invites

Date: 2026-02-07

## Status

Accepted

## Context

Red Team analysis (`RedTeam/0007-weak-household-codes.md`) identified that the current 6-character invite codes (e.g., "ABC-123") have insufficient entropy (~17.5M combinations), making them vulnerable to brute-force attacks. Access to a household grants full visibility into financial data.

## Decision

We will increase the security of household invite codes by:

1.  **High Entropy**: Replacing the 6-char format with a **12-character** alphanumeric code (e.g., `A7X2-9BWD-4Q8Z`).
2.  **Cryptographic Randomness**: Utilizing `crypto.randomBytes` (or equivalent secure RNG) instead of `Math.random()`.
3.  **Validation**: Retaining the existing checks but ensuring the code complexity makes online brute-force infeasible.

## Consequences

-   **Security**: Increases search space to $36^{12} \approx 4.7 \times 10^{18}$, making brute-force mathematically impossible within reasonable timeframes.
-   **UX**: Codes will be slightly harder to type/share verbally, but safer.
-   **Implementation**: Updates required in `src/server/actions/household.ts`.
