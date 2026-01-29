"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createPosition } from "@/server/actions/investments"
import { useActionState, useState } from "react"

import { SafeAccount } from "@/lib/types"

export function AddInvestmentDialog({ accounts }: { accounts: SafeAccount[] }) {
    const [open, setOpen] = useState(false)
    const [state, action, isPending] = useActionState(createPosition, {})
    const [isManual, setIsManual] = useState(false)

    if (state?.success && open) {
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Add Investment</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Investment Position</DialogTitle>
                </DialogHeader>
                <form action={action} className="grid gap-4 py-4">
                    <div className="flex gap-4">
                        <Button
                            type="button"
                            onClick={() => setIsManual(false)}
                        >
                            Ticker (Auto)
                        </Button>
                        <Button
                            type="button"
                            onClick={() => setIsManual(true)}
                        >
                            Manual
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label>Account</Label>
                        <select name="accountId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" required>
                            <option value="">Select Account</option>
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Asset Class</Label>
                            <select name="assetClass" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" required>
                                <option value="EQUITY">Equity / Stock</option>
                                <option value="CRYPTO">Crypto</option>
                                <option value="FIXED_INCOME">Fixed Income</option>
                                <option value="REAL_ESTATE">Real Estate</option>
                                <option value="PENSION">Pension / Afore</option>
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

                    {!isManual && (
                        <div className="space-y-2">
                            <Label>Ticker Symbol</Label>
                            <Input name="ticker" placeholder="VOO, AAPL, BTC-USD" required={!isManual} />
                            <p className="text-xs text-muted-foreground">Yahoo Finance symbol.</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input name="name" placeholder={isManual ? "Apt 4B" : "Vanguard S&P 500"} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Quantity</Label>
                            <Input name="quantity" type="number" step="0.000001" placeholder="10" required />
                        </div>
                        <div className="space-y-2">
                            <Label>Cost Basis (Unit Price)</Label>
                            <Input name="costBasis" type="number" step="0.01" placeholder="350.00" required />
                        </div>
                    </div>

                    {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}

                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Adding..." : "Add Position"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
