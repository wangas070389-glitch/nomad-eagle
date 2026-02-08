import { getTripDetails, addTripTransaction } from "@/server/actions/trips"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Receipt, UserCircle } from "lucide-react"
import { TripSettings } from "@/components/trips/trip-settings"
import { TravelersList } from "@/components/trips/travelers-list"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function TripDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    // Fix Waterfall: Run params and session in parallel (params is a promise in Next 15)
    // Actually, params needs to be awaited first to get ID, then we can parallelize data fetch
    const { id } = await params

    const [session, trip] = await Promise.all([
        getServerSession(authOptions),
        getTripDetails(id)
    ])

    if (!trip) return notFound()

    // Use Server-Aggregated Stats (O(1)) instead of Client-Side Reduce (O(N))
    const totalSpent = trip.stats.totalSpent
    const budgetLimit = Number(trip.budgetLimit) || 0
    const progress = budgetLimit > 0 ? (totalSpent / budgetLimit) * 100 : 0

    // Split Logic (Simple Equal Split for MVP)
    const perPersonShare = totalSpent / trip.members.length
    const { paidBy } = trip.stats

    const balances = trip.members.map(m => ({
        ...m,
        paid: paidBy[m.userId] || 0,
        balance: (paidBy[m.userId] || 0) - perPersonShare // Positive = Owed, Negative = Owes
    }))

    return (
        <div className="space-y-6 max-w-5xl mx-auto p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{trip.name}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-medium">{trip.status}</span>
                        <span>•</span>
                        <span>{trip.members.length} Members</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" /> Add Expense
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Trip Expense</DialogTitle>
                                <DialogDescription>Record a payment. It will be split equally among members.</DialogDescription>
                            </DialogHeader>
                            <form action={async (formData) => {
                                "use server"
                                await addTripTransaction(formData)
                            }} className="space-y-4">
                                <input type="hidden" name="tripId" value={trip.id} />

                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input name="description" placeholder="e.g. Dinner at Mario's" required />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Amount</Label>
                                        <Input name="amount" type="number" step="0.01" placeholder="0.00" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Paid By</Label>
                                        <Select name="payerId" required defaultValue={trip.members[0].userId}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {trip.members.map(m => (
                                                    <SelectItem key={m.userId} value={m.userId}>
                                                        {m.user.name || m.user.email}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full">Save Expense</Button>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <TripSettings tripId={trip.id} status={trip.status} />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Budget Meter */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
                        <div className="flex items-baseline justify-between">
                            <span className="text-3xl font-bold">${totalSpent.toLocaleString()}</span>
                            {budgetLimit > 0 && (
                                <span className="text-sm text-muted-foreground">of ${budgetLimit.toLocaleString()} budget</span>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {budgetLimit > 0 ? (
                            <div className="space-y-2">
                                <Progress value={Math.min(progress, 100)} className="h-3" />
                                <p className="text-xs text-muted-foreground text-right">{progress.toFixed(1)}% used</p>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Set a budget to see progress.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Travelers List */}
                <TravelersList
                    members={trip.members}
                    tripId={trip.id}
                    isOwner={trip.members.find((m) => m.userId === session?.user?.id)?.role === "OWNER"}
                />

                {/* My Balance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">Balances</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {balances.map(m => (
                            <div key={m.userId} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                                        {m.user.name?.[0] || "?"}
                                    </div>
                                    <span className="truncate max-w-[80px]">{m.user.name?.split(" ")[0]}</span>
                                </div>
                                {Math.abs(m.balance) < 0.01 ? (
                                    <span className="text-slate-400">Settled</span>
                                ) : m.balance > 0 ? (
                                    <span className="text-emerald-600 font-medium">Get ${m.balance.toFixed(0)}</span>
                                ) : (
                                    <span className="text-red-500 font-medium">Owe ${Math.abs(m.balance).toFixed(0)}</span>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Transactions List */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {trip.transactions.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">No expenses yet.</p>
                        ) : (
                            trip.transactions.map((t) => (
                                <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                            <Receipt className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{t.description}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Paid by {t.spentBy?.name || "Unknown"} • {new Date(t.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="font-bold">
                                        -${Number(t.amount).toLocaleString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
