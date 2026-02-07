# Red Team Analysis: Account Grouping (Report 013)

**Date**: 2026-02-07
**Target**: ADR 013 (Household Account Tabs)

## 1. Vulnerability: The "Lost Account" (UX)
**Scenario**: An account exists but has `ownerId = NULL` (system migration or error) or is a legacy "Household" account.
**Risk**: If tabs are strict filters ("Show only matching ownerId"), these accounts might **disappear** from individual tabs.
**Mitigation**:
-   Ensure an "All" tab always exists.
-   Ensure "Joint" or "Unassigned" accounts appear in a fallback tab or in *both* partners' tabs if deemed "Shared".

## 2. Behavioral Risk: Financial Friction
**Scenario**: Explicitly separating "John's Money" vs "Jane's Money" in the UI.
**Risk**: This might contradict the "Household" philosophy if not handled carefully. It emphasizes separation over unity.
**Mitigation**:
-   Keep the "All" tab as the **Default** view.
-   Label the tabs as filters, not "ownership assertions" (e.g., "Filtered by Owner" vs "My Money").

## 3. Implementation Flaw: Client-Side vs Server-Side
**Risk**: If we filter Client-Side (fetch all, hide some), performance is same as before. If we filter Server-Side, we add latency when switching tabs.
**Recommendation**: **Client-Side Filtering**. The dataset (accounts) is small (< 50). Fetch all, filter in UI for instant switching.

## 4. Conclusion
Proceed with Client-Side Tabs.
**Critical Rule**: "Joint" accounts (no specific owner) MUST appear in the "All" tab and potentially a specific "Joint" tab. They must not be hidden.
