# IDOR in Investment Position Creation

Date: 2026-02-07

## Status

IDENTIFIED

## Context

The `createPosition` server action in `src/server/actions/investments.ts` accepts an `accountId` from the form data to link the new investment position.

```typescript
const accountId = formData.get("accountId") as string
// ...
await prisma.investmentPosition.create({
    data: {
        // ...
        accountId
    }
})
```

## Vulnerability

There is **no verification** that the provided `accountId` belongs to the current user's household or is owned by the user. An attacker could inspect the network request, change the `accountId` to a valid ID from another user/household, and successfully create an investment position in that target account.

## Impact

-   **Integrity**: Attackers can inject data into other users' portfolios.
-   **Confidentiality**: Low (doesn't reveal data directly), but could be used to probe for valid IDs.

## Mitigation

Add a database check before creation:

```typescript
const account = await prisma.account.findUnique({ where: { id: accountId } })
if (!account || account.householdId !== session.user.householdId) {
    return { error: "Unauthorized account" }
}
```
