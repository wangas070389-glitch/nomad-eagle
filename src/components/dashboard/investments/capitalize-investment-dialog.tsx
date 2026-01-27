"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DollarSign } from "lucide-react"
import { useState } from "react"
import { capitalizeInvestment } from "@/server/actions/investments"

export function CapitalizeInvestmentDialog({ position, accounts }: { position: any, accounts: any[] }) {
    const [open, setOpen] = useState(false)
    const [units, setUnits] = useState(position.quantity)
    const [price, setPrice] = useState(position.currentPrice || 0)
    const [targetAccountId, setTargetAccountId] = useState("")

    // Reset state when dialog opens
    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen) {
            setUnits(position.quantity)
            setPrice(position.currentPrice || 0)
            setTargetAccountId("")
            setSuccess(false)
        }
        setOpen(newOpen)
    }

    const totalValue = units * price
    const [isPending, setIsPending] = useState(false)

    const [success, setSuccess] = useState(false)

    // Filter for CASH accounts only (Checking/Savings)
    const bankAccounts = accounts.filter(a => a.type === "CHECKING" || a.type === "SAVINGS" || a.type === "CASH")

    const handleCapitalize = async () => {
        setIsPending(true)
        const formData = new FormData()
        formData.append("investmentId", position.id)
        formData.append("units", units.toString())
        formData.append("salePrice", price.toString())
        formData.append("targetAccountId", targetAccountId)

        const res = await capitalizeInvestment(formData)
        setIsPending(false)
        if (res?.success) {
            setSuccess(true)
        } else {
            alert("Failed to sell")
        }
    }

    if (success) {
        const targetAccountName = bankAccounts.find(a => a.id === targetAccountId)?.name
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                        <DollarSign className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <div className="flex flex-col items-center justify-center py-6 space-y-4 text-center">
                        <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-emerald-900">Sale Confirmed!</h3>
                            <p className="text-sm text-muted-foreground">
                                Successfully sold {units} units of {position.ticker || position.name}.
                            </p>
                        </div>
                        <div className="w-full rounded-lg bg-slate-50 p-4 border border-emerald-100">
                            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Deposited</div>
                            <div className="text-2xl font-bold text-emerald-600">
                                +{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalValue)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                to {targetAccountName}
                            </div>
                        </div>
                        <Button onClick={() => setOpen(false)} className="w-full bg-emerald-600 hover:bg-emerald-700">
                            Done
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                    <DollarSign className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Capitalize Investment</DialogTitle>
                    <DialogDescription>
                        Sell your holdings and deposit the cash into a bank account.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Units to Sell</Label>
                            <Input
                                type="number"
                                value={units}
                                onChange={(e) => setUnits(Number(e.target.value))}
                                max={position.quantity}
                            />
                            <p className="text-[10px] text-muted-foreground">Max: {position.quantity}</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Sale Price (per unit)</Label>
                            <Input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Deposit To Account</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={targetAccountId}
                            onChange={(e) => setTargetAccountId(e.target.value)}
                        >
                            <option value="">Select an account...</option>
                            {bankAccounts.map(account => (
                                <option key={account.id} value={account.id}>
                                    {account.name} ({account.currency})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="rounded-lg bg-emerald-50 p-3 text-center">
                        <div className="text-xs text-emerald-600 font-medium uppercase tracking-wide">Total Cash Value</div>
                        <div className="text-2xl font-bold text-emerald-800">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalValue)}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleCapitalize} disabled={isPending || !targetAccountId} className="w-full bg-emerald-600 hover:bg-emerald-700">
                        {isPending ? "Processing..." : "Confirm Sale"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
