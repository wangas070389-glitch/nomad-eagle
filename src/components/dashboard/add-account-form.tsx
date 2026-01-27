"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createAccount } from "@/server/actions/accounts"
import { useActionState, useState } from "react"

export function AddAccountForm({ onSuccess }: { onSuccess?: () => void }) {
    const [state, action, isPending] = useActionState(createAccount, null)

    return (
        <form action={action} className="space-y-4">
            <div className="space-y-2">
                <Label>Account Name</Label>
                <Input name="name" placeholder="Chase Checking" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Type</Label>
                    <select name="type" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" required>
                        <option value="CHECKING">Checking</option>
                        <option value="SAVINGS">Savings</option>
                        <option value="CREDIT_CARD">Credit Card</option>
                        <option value="INVESTMENT">Investment</option>
                        <option value="CASH">Cash</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <Label>Currency</Label>
                    <select name="currency" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" required>
                        <option value="USD">USD</option>
                        <option value="MXN">MXN</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Ownership</Label>
                <select name="ownership" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" required>
                    <option value="PERSONAL">Personal ("Me")</option>
                    <option value="JOINT">Joint</option>
                </select>
            </div>

            <div className="space-y-2">
                <Label>Initial Balance</Label>
                <Input name="balance" type="number" step="0.01" placeholder="0.00" />
            </div>

            {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}

            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Adding..." : "Add Account"}
            </Button>
        </form>
    )
}
