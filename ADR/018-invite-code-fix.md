# 18. Household Invite Code Format Fix

Date: 2026-02-07

## Status

Proposed

## Context

**Problem**: The "Join Another Household" input box in the settings page has a hardcoded `maxLength={8}` constraint.
**Backend Reality**: The `generateInviteCode` action (updated in a previous security patch, ADR 0007) now produces **High Entropy Codes** with the format `XXXX-XXXX-XXXX` (12 alphanumeric characters + 2 hyphens = 14 characters total).
**Impact**: Users cannot type or paste the full invite code, making it impossible to join a household using the new secure codes.

## Decision

We will update the Client-Side Input to support the new secure format.

### Changes
1.  **Increase Max Length**: Update `maxLength` from `8` to `14` (or `16` for safety).
2.  **Visual Feedback**: Update the placeholder to `XXXX-XXXX-XXXX` to indicate the expected format.
3.  **Input Formatting**: The existing `onChange` uppercasing logic is correct and will be preserved.

## Verification
-   Generate a new code: `ABCD-1234-EFGH`.
-   Attempt to type it into the input box.
-   Verify it accepts all characters.

## Consequences
-   **Pros**: Restores functionality for joining households.
-   **Cons**: None.
