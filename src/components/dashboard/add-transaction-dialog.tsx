"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createTransaction } from "@/server/actions/transactions"
import { updateTransaction } from "@/server/actions/transaction-ops"
import { useActionState, useState, useEffect } from "react"
import { CategorySelect, type CategoryOption } from "./category-select"

import { SafeAccount, AccountOption } from "@/lib/types"

export function AddTransactionDialog({
    accounts,
    categories,
    members = [],
    currentUserId,
    initialData,
    onClose
}: {
    accounts: AccountOption[], // Accept broader SafeAccount is fine too as it extends Option
    categories: CategoryOption[],
    members?: { id: string, name: string | null }[],
    currentUserId?: string,
    initialData?: {
        id?: string
        description: string
        amount: number
        type: "INCOME" | "EXPENSE" | "TRANSFER"
        date: string
        categoryId: string
        accountId: string
        spentByUserId?: string
    },
    onClose?: () => void
}) {
    const [open, setOpen] = useState(false)

    const actionFn = initialData ? updateTransaction.bind(null, initialData.id!) : createTransaction
    const [state, action, isPending] = useActionState(actionFn, {})

    // Auto-open if initialData provided (Edit Mode)
    useEffect(() => {
        if (initialData) setOpen(true)
    }, [initialData])

    // Close on success
    useEffect(() => {
        if (state?.success) {
            setOpen(false)
            if (onClose) onClose()
        }
    }, [state?.success, onClose])

    const handleOpenChange = (val: boolean) => {
        setOpen(val)
        if (!val && onClose) onClose()
    }

    const [selectedCategory, setSelectedCategory] = useState<string>(initialData?.categoryId || "")
    const [type, setType] = useState<"INCOME" | "EXPENSE" | "TRANSFER">(initialData?.type || "EXPENSE")

    const showSpenderSelect = members.length > 1

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            {!initialData && (
                <DialogTrigger asChild>
                    <Button>Add Transaction</Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Transaction</DialogTitle>
                    <DialogDescription>
                        Log income, expense, or transfer.
                    </DialogDescription>
                </DialogHeader>
                <form action={action} className="grid gap-4 py-4">
                    {/* ... other fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <select
                                name="type"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                required
                                value={type}
                                onChange={(e) => setType(e.target.value as any)}
                            >
                                <option value="EXPENSE">Expense</option>
                                <option value="INCOME">Income</option>
                                <option value="TRANSFER">Transfer</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Amount</Label>
                            <Input name="amount" type="number" step="0.01" placeholder="0.00" required defaultValue={initialData ? Number(initialData.amount) : ""} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Date</Label>
                        <Input name="date" type="datetime-local" required defaultValue={initialData?.date ? new Date(initialData.date).toISOString().slice(0, 16) : ""} />
                    </div>

                    {showSpenderSelect ? (
                        <div className="space-y-2">
                            <Label>Spent By</Label>
                            <select
                                name="spentByUserId"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                defaultValue={currentUserId}
                            >
                                {members.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {m.id === currentUserId ? "Me" : m.name || m.id}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <input type="hidden" name="spentByUserId" value={currentUserId} />
                    )}

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Input name="description" placeholder="Walmart, Netflix, etc." required defaultValue={initialData?.description || ""} />
                    </div>

                    <div className="space-y-2">
                        <Label>Category</Label>
                        <input type="hidden" name="categoryId" value={selectedCategory} />
                        <CategorySelect
                            categories={categories}
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                        />
                    </div>

                    {type === "TRANSFER" ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>From Account</Label>
                                <select name="fromAccountId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" required>
                                    <option value="">Select Source</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>
                                            {acc.name} ({acc.currency})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>To Account</Label>
                                <select name="toAccountId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" required>
                                    <option value="">Select Dest</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>
                                            {acc.name} ({acc.currency})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label>Account</Label>
                            <select name="accountId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" required defaultValue={initialData?.accountId || ""}>
                                <option value="">Select Account</option>
                                {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>
                                        {acc.name} ({acc.currency}) {acc.ownerId ? "- Me" : "- Joint"}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}

                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Saving..." : "Save Transaction"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
