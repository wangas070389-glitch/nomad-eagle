# Addendum to 16. Trusted Household Model

Date: 2026-02-07

## Context

**Issue**: The previous decision (ADR 016) relaxed the *Destination* check but kept the *Source* check strict.
-   Users reported: "Still we have the issue... unable to transfer from partner's account."
-   Use Case: In a family finance tracker, one person often manages the data entry ("Admin"). They need to log transfers *on behalf of* their partner (e.g., "Wife transferred $500 to Joint").
-   Blocker: Strict `ownerId` check prevents logging these valid household events.

## Decision

We will shift the security model for **Transactions** from "Banking Strictness" to "Tracker Trust".

**New Rule**:
If a user is a member of a Household:
1.  They can create transactions (Income, Expense, Transfer) on **ANY** account belonging to that Household.
2.  The `spentByUserId` field is used to attribute the action to the correct person (if they select proper "Spent By").

**Code Change**:
Remove the `ownerId` check on `fromAccount`.
Maintain the `householdId` check (Isolation).

## Red Team Analysis (Data Vandalism)
**Risk**: A user can "drain" a partner's virtual balance or mess up their history.
**Mitigation**:
-   **App Type**: This is a *Tracker*, not a Bank. No real money is moved. The worst case is data noise.
-   **Audit**: We record `spentByUserId` (who *performed* the transaction vs who *spent* it - though currently we might conflate them, we should ensure we track `createdBy`).
-   **Verdict**: Acceptable risk for a collaborative family tool. Trust is a prerequisite for joining a household.

## Consequences
-   **Pros**: Frictionless family finance management.
-   **Cons**: Potential for accidental errors affecting partner's data.

## Red Team Analysis (Data Vandalism Mitigation)
-   **Risk**: Malicious deletion or modification of partner's history.
-   **Defense**: 
    -   We rely on *Household Trust*.
    -   Audit Trail: `transactions` table tracks `spentByUserId` (though imperfect for `createdBy`).
    -   We will consider adding `createdByUserId` in schema future migration (ADR 020).
-   **Verdict**: Proceed. The utility outweighs the risk for this product category.

