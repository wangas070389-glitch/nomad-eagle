# Weak Household Invite Codes

Date: 2026-02-07

## Status

IDENTIFIED

## Context

The `generateInviteCode` function in `src/server/actions/household.ts` generates a 6-character code (Format: `AAA-000`) for joining households.

```typescript
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const nums = "0123456789"
// ... 3 chars + 3 nums
```

## Vulnerability

**Low Entropy / Brute-Force Susceptibility**

-   **Entropy**: The search space is $26^3 \times 10^3 = 17,576,000$ combinations.
-   **Attack Vector**: An attacker can enumerate codes to randomly join households.
-   **Impact**: Successful joining grants **full access** to the household's financial data (accounts, transactions, balances), representing a catastrophic privacy breach.
-   **Missing Controls**: There appears to be no rate limiting on the `joinHousehold` action.

## Mitigation

1.  **Increase Entropy**: Use longer codes (e.g., 8-10 chars alphanumeric) or signed JWTs.
2.  **Rate Limiting**: Implement strict rate limits on the `joinHousehold` endpoint (e.g., 5 attempts per IP per hour).
3.  **Approval Workflow**: Require the Household Owner to "Approve" a join request, rather than auto-joining via code.
