"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { reconcileManualTransaction } from "@/server/actions/transactions"
import { getDetailedCashFlow } from "@/server/actions/cashflow"
import { Loader2, PlusCircle, Link2 } from "lucide-react"
import { toast } from "sonner"

interface PlannedItem {
    id: string
    name: string
    type: 'BUDGET_LIMIT' | 'RECURRING_FLOW'
}

export function ManualReconciliationForm() {
    const [loading, setLoading] = useState(false)
    const [plannedItems, setPlannedItems] = useState<PlannedItem[]>([])
    const [formData, setFormData] = useState({
        amount: "",
        date: new Date().toISOString().split('T')[0],
        description: "",
        plannedItemId: "",
        accountId: "" // We will auto-fetch first account for MVP
    })

    useEffect(() => {
        // Fetch entities for mapping. This uses the existing detailed cashflow 
        // which already filters for household items.
        getDetailedCashFlow().then(res => {
            if ("error" in res) return
            const items: PlannedItem[] = []
            res.outflows.forEach(o => {
                if (o.id && o.name !== "Total Outflow") {
                    items.push({
                        id: o.id,
                        name: o.name,
                        type: o.name.startsWith("Limit:") ? 'BUDGET_LIMIT' : 'RECURRING_FLOW'
                    })
                }
            })
            setPlannedItems(items)
        })
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.plannedItemId) {
            toast.error("Handshake Required: Select a Planned Entity")
            return
        }

        setLoading(true)
        const selectedItem = plannedItems.find(i => i.id === formData.plannedItemId)
        
        const result = await reconcileManualTransaction({
            amount: parseFloat(formData.amount),
            date: formData.date,
            description: formData.description,
            plannedItemId: formData.plannedItemId,
            type: selectedItem?.type || 'BUDGET_LIMIT',
            accountId: "user-default-account" // Simplified for logic demonstration
        })

        setLoading(false)
        if (result.success) {
            toast.success("Transaction Reconciled with Solvency Engine")
            setFormData({ ...formData, amount: "", description: "", plannedItemId: "" })
        } else {
            toast.error(result.error || "Systemic Failure")
        }
    }

    return (
        <Card className="shadow-md h-full">
            <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Link2 className="h-5 w-5 text-indigo-500" /> Manual Allocation
                </CardTitle>
                <CardDescription>
                    Reconcile a transaction with a planned entity.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount" className="text-sm font-medium">Amount</Label>
                            <Input 
                                id="amount" 
                                type="number" 
                                placeholder="0.00" 
                                value={formData.amount}
                                onChange={e => setFormData({...formData, amount: e.target.value})}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date" className="text-sm font-medium">Date</Label>
                            <Input 
                                id="date" 
                                type="date" 
                                value={formData.date}
                                onChange={e => setFormData({...formData, date: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="plannedItem" className="text-sm font-medium">Planned Entity</Label>
                        <Select 
                            onValueChange={val => setFormData({...formData, plannedItemId: val})}
                            value={formData.plannedItemId}
                        >
                            <SelectTrigger className="focus:ring-indigo-500">
                                <SelectValue placeholder="Select target..." />
                            </SelectTrigger>
                            <SelectContent>
                                {plannedItems.map(item => (
                                    <SelectItem key={item.id} value={item.id}>
                                        {item.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                        <Input 
                            id="description" 
                            placeholder="e.g., Household supplies" 
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            required
                        />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 font-medium">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                            <>
                                <PlusCircle className="mr-2 h-4 w-4" /> Finalize Allocation
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
