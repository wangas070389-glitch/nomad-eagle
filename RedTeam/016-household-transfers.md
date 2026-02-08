# Red Team Analysis: Household Transfer Permissions (Report 016)

**Date**: 2026-02-07
**Target**: ADR 016 (Household Intra-Transfer Permission)

## 1. Vulnerability: Unauthorized Debit (The "Robin Hood" Attack)
**Risk**: A user transfers money *from* a partner's personal account to their own.
**Attack Vector**:
-   User selects Partner's "Personal Savings" as Source.
-   User selects Own "Checking" as Destination.
**Defense Analysis**:
-   The proposed logic maintains the *Source* check: `if (fromAccount.ownerId && fromAccount.ownerId !== session.user.id)`.
-   **Verdict**: **Secure**. The attack is blocked by the existing check.

## 2. Vulnerability: Transaction Spamming (The "Nuisance" Attack)
**Risk**: A user floods a household member's account with thousands of micro-transactions ($0.01) with abusive descriptions.
**Attack Vector**:
-   User writes a script to hit the `createTransaction` endpoint in a loop.
-   Target: Partner's account.
**Impact**:
-   Partner's transaction history becomes unusable.
-   Database bloat.
-   Psychological harassment.
**Mitigation**:
-   **Rate Limiting**: (Infrastructure level) Limit API calls per user.
-   **Minimum Amount**: Enforce a minimum transfer amount (e.g., $1.00) to make spamming costly? (Maybe too restrictive).
-   **Block Feature**: Allow users to "Block Transfers" from specific household members? (Overkill for MVP).
-   **Recommendation**: Monitor for high-frequency transaction creation.

## 3. Vulnerability: "Blind Dumping" (The "Hiding Assets" Risk)
**Risk**: A user moves large sums of money to a partner's account to hide it from their own "Net Worth" calculation, knowing they can't see the partner's account details.
**Attack Vector**:
-   User has $10,000 in personal checking.
-   User transfers $10,000 to Partner's account.
-   The money "disappears" from the User's view (since they can't see Partner's balance).
**Impact**:
-   Obfuscation of assets (e.g., during a divorce or audit).
**Mitigation**:
-   **Audit Trail**: The *Transaction* record (`TRANSFER`) remains in the User's history as an *Expense* (Outflow). It doesn't disappear; it just moves.
-   **Verdict**: Acceptable. The transaction history preserves the trail.

## 4. Vulnerability: Information Leakage
**Risk**: Does successful transfer reveal the existence or status of a hidden account?
-   **Scenario**: User guesses an Account ID.
-   **Defense**: The system checks `householdId` first.
    -   `if (toAccount.householdId !== session.user.householdId) return Error`.
-   **Verdict**: **Secure**. You can only transfer to accounts *already* associated with your household. You cannot "probe" for random account IDs outside the household.

## 5. Conclusion
The proposed change in ADR 016 is **Low Risk**.
-   **Critical** (Theft): Blocked.
-   **High** (Data Leak): Blocked.
-   **Medium** (Spam): Possible, but standard for any shared platform.
-   **Recommendation**: Proceed with implementation.
