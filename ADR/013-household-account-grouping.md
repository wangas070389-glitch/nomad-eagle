# 13. Household Account Grouping

Date: 2026-02-07

## Status

Proposed

## Context

**Problem**: As the household grows, the "Your Accounts" section on the dashboard becomes cluttered. A couple might have 10+ accounts combined (Credit Cards, Savings, Investments). Displaying them all in a single grid makes it hard to quickly see "My Cash Position" vs "Partner's Cash Position".

**User Request**: "I dont want to see all the accounts... have like a tab by household member".

### Refined Decision (Red Team Adopted)
1.  **Client-Side Filtering**: We will fetch all accounts and filter in the browser for instant switching.
2.  **Tab Structure**:
    -   **All** (Default): Shows every account.
    -   **Joint** (Dynamic): Shows accounts with `ownerId = null`.
    -   **[Member Name]**: Shows accounts with `ownerId = member.id`.
3.  **Safety Rule**: "Joint" accounts must always appear in "All".

### Implementation
-   **Component**: `AccountListTabs` (New Client Component).
-   **Props**: `accounts`, `members`, `currentUserId`.
-   **State**: `activeTab` (default "all").

### Impact
-   **Clarity**: Users can focus on their own finances or audit their partner's accounts separately (within the transparent household model).
-   **Scalability**: Supports N members without UI explosion.
