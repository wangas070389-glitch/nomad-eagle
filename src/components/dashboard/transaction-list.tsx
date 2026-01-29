"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TransactionActions } from "./transaction-actions"
import { AddTransactionDialog } from "./add-transaction-dialog"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { CategoryOption } from "./category-select" // Helper type from select
import { SafeTransaction, SafeAccount, AccountOption } from "@/lib/types" // Helper type from select

export function TransactionList({
    transactions,
    currentUserId,
    accounts = [],
    categories = [],
    members = []
}: {
    transactions: SafeTransaction[],
    currentUserId?: string,
    accounts?: AccountOption[], // Use AccountOption
    categories?: CategoryOption[],
    members?: { id: string, name: string | null }[]
}) {
    const [items, setItems] = useState<SafeTransaction[]>(transactions)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [editingTx, setEditingTx] = useState<SafeTransaction | null>(null)

    // Update items if initial props change (e.g. new transaction added elsewhere)
    // Actually, strictly speaking we might want to just initialize. 
    // But if we add a tx via dialog, we want it to show up? 
    // The dialog triggers router.refresh(), which updates 'transactions' prop.
    // So we should sync prop to state.
    // specific implementation:
    // useEffect(() => setItems(transactions), [transactions]) 
    // But this resets pagination. 
    // Let's keep it simple: "Load More" appends to the list. 
    // If we refresh, we reset.
    // For now, let's just use the prop as initial state.

    const handleLoadMore = async () => {
        setLoadingMore(true)
        const nextPage = page + 1
        // Dynamic import to avoid circular dependencies if any, or just import at top?
        // Server action imports in Client Components need to be handled carefully but usually fine.
        // We can't import server action directly inside useEffect if not passed as prop?
        // Actually we can import it at top level.
        const { getTransactions } = await import("@/server/actions/transactions")
        const newTxs = await getTransactions(nextPage, 50)

        if (newTxs.length < 50) {
            setHasMore(false)
        }

        // Transform dates from string (serialized) to Date object if needed
        // The server action returns plain objects.

        // Mismatch: Server action returns raw Prisma objects, 
        // Component expects TransactionView.
        // We need to map it.
        const formatted = newTxs.map((tx) => ({
            ...tx,
            amount: Number(tx.amount), // ensure number
            category: tx.category,
            account: tx.account,
            spentBy: tx.spentBy
        }))

        setItems(prev => [...prev, ...formatted])
        setPage(nextPage)
        setLoadingMore(false)
    }

    if (items.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">No transactions found.</p>
                </CardContent>
            </Card>
        )
    }

    // Group by Date using 'items' not 'transactions'
    const grouped = items.reduce((groups, tx) => {
        const date = new Date(tx.date).toLocaleDateString("en-US", { year: 'numeric', month: 'numeric', day: 'numeric' })
        if (!groups[date]) groups[date] = []
        groups[date].push(tx)
        return groups
    }, {} as Record<string, SafeTransaction[]>)

    return (
        <>
            <div className="space-y-6">
                <h3 className="text-lg font-medium">Recent Activity</h3>
                {Object.entries(grouped).map(([date, txs]) => (
                    <div key={date} className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">{date}</div>
                        <div className="space-y-2">
                            {txs.map(tx => {
                                const isSharedAndNotMe = tx.spentBy && tx.spentBy.id !== currentUserId

                                return (
                                    <Card key={tx.id} className={cn(
                                        "p-4 flex items-center justify-between transition-all hover:bg-slate-50",
                                        isSharedAndNotMe && "border-l-4 border-l-purple-400 bg-purple-50/10"
                                    )}>
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 text-lg relative">
                                                {tx.category?.icon || (tx.type === "INCOME" ? "💰" : "📝")}
                                                {isSharedAndNotMe && (
                                                    <div className="absolute -bottom-1 -right-1 bg-purple-100 text-[10px] px-1 rounded-full border border-purple-200 text-purple-800 font-bold" title={`Spent by ${tx.spentBy?.name || 'Partner'} `}>
                                                        {tx.spentBy?.name?.charAt(0) || "P"}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium flex items-center gap-2">
                                                    {tx.description}
                                                </div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                    {tx.category?.name || "Uncategorized"} • {tx.account?.name || "Unknown Account"}
                                                    {isSharedAndNotMe && (
                                                        <span className="text-purple-600 font-medium ml-1 flex items-center bg-purple-100 px-1.5 py-0.5 rounded text-[10px]">
                                                            <Avatar className="h-4 w-4 mr-1">
                                                                <AvatarImage src={tx.spentBy?.avatarUrl ?? ""} />
                                                            </Avatar>
                                                            {tx.spentBy?.name || "Partner"}'s Card
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "font-bold",
                                                tx.type === "INCOME" ? "text-green-600" : "text-gray-900"
                                            )}>
                                                {tx.type === "EXPENSE" ? "-" : "+"}
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: tx.account?.currency || 'USD' }).format(Number(tx.amount))}
                                            </div>
                                            <TransactionActions
                                                transactionId={tx.id}
                                                onEdit={() => setEditingTx(tx)}
                                            />
                                        </div>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>
                ))}

                {hasMore && (
                    <div className="flex justify-center pt-4">
                        <Button
                            variant="outline"
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="w-full md:w-auto"
                        >
                            {loadingMore ? "Loading..." : "Load More Activity"}
                        </Button>
                    </div>
                )}
            </div>

            {/* Edit Dialog */}
            {editingTx && (
                <AddTransactionDialog
                    accounts={accounts}
                    categories={categories}
                    members={members}
                    currentUserId={currentUserId}
                    initialData={{
                        id: editingTx.id,
                        description: editingTx.description,
                        amount: Number(editingTx.amount),
                        type: editingTx.type,
                        date: new Date(editingTx.date).toISOString().slice(0, 16), // datetime-local format
                        categoryId: editingTx.category?.name ? editingTx.categoryId : "",
                        accountId: editingTx.account?.id || "",
                    }}
                    onClose={() => setEditingTx(null)}
                />
            )}
        </>
    )
}
