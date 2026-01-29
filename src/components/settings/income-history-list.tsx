"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useActionState, useState } from "react"
import { addIncomeRecord, deleteIncomeRecord } from "@/server/actions/user-profile"
import { IncomeHistory } from "@prisma/client"
import { Plus, Trash2, TrendingUp } from "lucide-react"

export function IncomeHistoryList({ history }: { history: IncomeHistory[] }) {
    const [isAdding, setIsAdding] = useState(false)
    const [state, action, isPending] = useActionState(addIncomeRecord, {})

    if (state?.success && isAdding) {
        setIsAdding(false)
    }

    const sorted = [...history].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Income History</CardTitle>
                        <CardDescription>Track your career growth and salary progression.</CardDescription>
                    </div>
                    {!isAdding && (
                        <Button size="sm" onClick={() => setIsAdding(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Record
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {isAdding && (
                    <form action={action} className="p-4 border rounded-lg bg-slate-50 space-y-4 mb-4">
                        <h4 className="font-medium text-sm">New Income Record</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Employer</Label>
                                <Input name="employer" placeholder="Company Inc." required />
                            </div>
                            <div className="space-y-2">
                                <Label>Job Title</Label>
                                <Input name="title" placeholder="Senior Role" required />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Amount (Annual)</Label>
                                <Input name="amount" type="number" placeholder="100000" required />
                            </div>
                            <div className="space-y-2">
                                <Label>Currency</Label>
                                <select name="currency" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                                    <option value="USD">USD</option>
                                    <option value="MXN">MXN</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input name="startDate" type="date" required />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                            <Button type="submit" disabled={isPending}>Save Record</Button>
                        </div>
                    </form>
                )}

                <div className="relative border-l border-slate-200 ml-3 pl-6 space-y-8">
                    {sorted.length === 0 && <div className="text-sm text-muted-foreground italic">No history recorded yet.</div>}

                    {sorted.map((item, idx) => {
                        const isCurrent = !item.endDate
                        return (
                            <div key={item.id} className="relative group">
                                <div className={`absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-white ${isCurrent ? 'bg-green-500 ring-4 ring-green-100' : 'bg-slate-300'}`} />
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold">{item.title}</h4>
                                            {isCurrent && <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Current</Badge>}
                                        </div>
                                        <p className="text-sm text-gray-600">{item.employer}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold flex items-center gap-1 justify-end text-slate-700">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: item.currency, maximumFractionDigits: 0 }).format(Number(item.amount))}
                                            <span className="text-xs font-normal text-muted-foreground">/yr</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(item.startDate).getFullYear()} - {item.endDate ? new Date(item.endDate).getFullYear() : "Present"}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className="absolute -right-8 top-1 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600"
                                    onClick={() => deleteIncomeRecord(item.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
