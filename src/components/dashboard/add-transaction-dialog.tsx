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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createTransaction } from "@/server/actions/transactions"
import { updateTransaction } from "@/server/actions/transaction-ops"
import { useActionState, useState, useEffect } from "react"
import { CategorySelect, type CategoryOption } from "./category-select"
import { SmartDatePicker } from "./smart-date-picker"

import { SafeAccount, AccountOption } from "@/lib/types"

export function AddTransactionDialog({
    accounts,
    categories,
    plannerCategories = [],
    members = [],
    currentUserId,
    initialData,
    onClose
}: {
    accounts: AccountOption[], // Accept broader SafeAccount is fine too as it extends Option
    categories: CategoryOption[],
    plannerCategories?: Array<{ id: string, name: string, icon: string, type: string, isPlannerItem: boolean }>,
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
        recurringFlowId?: string
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
    const [selectedPlannerFlow, setSelectedPlannerFlow] = useState<string>(initialData?.recurringFlowId || "")
    const [selectedAccount, setSelectedAccount] = useState<string>(initialData?.accountId || "")
    const [fromAccount, setFromAccount] = useState<string>("")
    const [toAccount, setToAccount] = useState<string>("")
    const [selectedSpender, setSelectedSpender] = useState<string>(currentUserId || "")

    // Reset logic if needed when type changes, but simple is better for now.
    const [type, setType] = useState<"INCOME" | "EXPENSE" | "TRANSFER">(initialData?.type || "EXPENSE")
    const [date, setDate] = useState<Date | undefined>(initialData?.date ? new Date(initialData.date) : new Date())

    const showSpenderSelect = members.length > 1

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            {!initialData && (
                <DialogTrigger asChild>
                    <Button>Add Transaction</Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Transaction</DialogTitle>
                    <DialogDescription>
                        Log income, expense, or transfer.
                    </DialogDescription>
                </DialogHeader>
                <form action={action} className="grid gap-4 py-4">
                    {/* ... other fields */}
                    {/* Compact Grid Layout - Optimized for 600px width */}
                    <div className="grid gap-4 p-1">

                        {/* Row 1: Type (30%) + Amount (70%) */}
                        <div className="flex gap-4">
                            <div className="w-[140px] space-y-1.5">
                                <Label className="text-xs text-muted-foreground font-medium">Type</Label>
                                <Select
                                    name="type"
                                    value={type}
                                    onValueChange={(v: any) => setType(v)}
                                    required
                                >
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EXPENSE">Expense</SelectItem>
                                        <SelectItem value="INCOME">Income</SelectItem>
                                        <SelectItem value="TRANSFER">Transfer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex-1 space-y-1.5">
                                <Label className="text-xs text-muted-foreground font-medium">Amount</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                    <Input
                                        name="amount"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        required
                                        defaultValue={initialData ? Number(initialData.amount) : ""}
                                        className="h-9 pl-7 text-lg font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Date (Full Width) */}
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground font-medium">Date</Label>
                            <SmartDatePicker date={date} setDate={setDate} />
                            <input type="hidden" name="date" value={date ? date.toISOString() : ""} />
                        </div>

                        {/* Row 3: Account Selection (Where) */}
                        {type === "TRANSFER" ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground font-medium">From</Label>
                                    <input type="hidden" name="fromAccountId" value={fromAccount} />
                                    <Select value={fromAccount} onValueChange={setFromAccount} required>
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder="Source Account" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accounts.map(acc => (
                                                <SelectItem key={acc.id} value={acc.id}>
                                                    {acc.name} ({acc.currency})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground font-medium">To</Label>
                                    <input type="hidden" name="toAccountId" value={toAccount} />
                                    <Select value={toAccount} onValueChange={setToAccount} required>
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder="Dest Account" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accounts.map(acc => (
                                                <SelectItem key={acc.id} value={acc.id}>
                                                    {acc.name} ({acc.currency})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground font-medium">Account</Label>
                                <input type="hidden" name="accountId" value={selectedAccount} />
                                <Select value={selectedAccount} onValueChange={setSelectedAccount} required>
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Select Account" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accounts.map(acc => (
                                            <SelectItem key={acc.id} value={acc.id}>
                                                {acc.name} ({acc.currency}) {acc.ownerId ? "" : "(Joint)"}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Row 4: Classification (Category & Spender) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground font-medium">Category</Label>
                                <input type="hidden" name="categoryId" value={selectedCategory} />
                                <input type="hidden" name="recurringFlowId" value={selectedPlannerFlow} />
                                <input type="hidden" name="budgetLimitId" value="" /> {/* Placeholder for future expansion */}
                                <CategorySelect
                                    categories={[
                                        ...categories,
                                        ...(plannerCategories?.map(p => ({
                                            id: p.id,
                                            name: `[Flow] ${p.name}`,
                                            icon: p.icon,
                                            type: p.type as any,
                                            isPlannerItem: true
                                        })) || [])
                                    ]}
                                    value={selectedPlannerFlow || selectedCategory}
                                    onChange={(val) => {
                                        const isPlanner = plannerCategories?.find(p => p.id === val)
                                        if (isPlanner) {
                                            setSelectedPlannerFlow(val)
                                            setSelectedCategory("")
                                        } else {
                                            setSelectedCategory(val)
                                            setSelectedPlannerFlow("")
                                        }
                                    }}
                                />
                            </div>

                            {showSpenderSelect ? (
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground font-medium">Spent By</Label>
                                    <input type="hidden" name="spentByUserId" value={selectedSpender} />
                                    <Select value={selectedSpender} onValueChange={setSelectedSpender}>
                                        <SelectTrigger className="h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {members.map(m => (
                                                <SelectItem key={m.id} value={m.id}>
                                                    {m.id === currentUserId ? "Me" : m.name || m.id}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : (
                                <input type="hidden" name="spentByUserId" value={currentUserId} />
                            )}
                        </div>

                        {/* Row 5: Description */}
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground font-medium">Description</Label>
                            <Input
                                name="description"
                                placeholder="Details..."
                                required
                                defaultValue={initialData?.description || ""}
                                className="h-9"
                            />
                        </div>
                    </div>

                    {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}

                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Saving..." : "Save Transaction"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
