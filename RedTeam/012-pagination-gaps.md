# Red Team Analysis: Pagination Integrity (Report 012)

**Date**: 2026-02-07
**Target**: ADR 012 (Offset-Based Pagination)

## 1. Vulnerability: The "Ghost Gap" (Confirmed)
**Scenario**: User loads 5 items. Requests "Page 2" (size 50).
**Result**: Items 6-50 are skipped. This is a Logic Flaw in mixing "Pages" with "Variable Fetch Sizes".
**Fix Status**: Adopting **Offset-Based** (Skip/Take) solves this deterministic gap.

## 2. New Risk: The "Shift-Duplicate" Anomaly
**Scenario (Offset Strategy)**:
1.  User loads items 1-5.
2.  **In another tab**, User adds a *new* transaction (Item 0).
3.  The list shifts down by 1.
4.  User clicks "Load More" (Skip 5).
    -   Original Item 5 is now at position 6.
    -   The fetch starts at position 6.
    -   **Result**: Item 5 is shown *again* (Duplicate).
**Severity**: Low (Annoyance, not Data Loss). Better than a Gap.

## 3. Alternative Risk: The "Shift-Miss" Anomaly
**Scenario**:
1.  User loads items 1-5.
2.  User *deletes* Item 1.
3.  The list shifts up.
4.  User clicks "Load More" (Skip 5).
    -   Item 6 moves to position 5.
    -   The fetch starts at position 6 (skipping the new position 5).
    -   **Result**: Item 6 is missed.

## 4. Recommendation
**Cursor-Based Pagination** (using `id` or `date`) is the only way to be 100% robust against shifts.
-   *Query*: "Give me 50 items where `date < LastVisibleDate`".

**However**, for the MVP Dashboard:
-   **Offset-Based** is acceptable if we acknowledge the minor "Shift" risks.
-   **Mitigation**: The Dashboard is for "Recent Activity". The "View All" page should use robust filtering.
-   **Conclusion**: Proceed with **Offset-Based** for simplicity in fixing the current bug, but note Cursor-Based as a future evolution (Protocol 33).

## 5. Implementation Plan
1.  Update `getTransactions` to accept `skip` argument.
2.  Update `TransactionList` to maintain `offset` state (current length of list).
