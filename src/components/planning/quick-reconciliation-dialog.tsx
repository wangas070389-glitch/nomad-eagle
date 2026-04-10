"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Link2, PlusCircle } from "lucide-react"
import { reconcileManualTransaction } from "@/server/actions/transactions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface QuickReconciliationDialogProps {
    isOpen: boolean
    onClose: () => void
    context: {
        plannedItemId: string
        name: string
        plannedAmount: number
        type: 'BUDGET_LIMIT' | 'RECURRING_FLOW'
    }
}

export function QuickReconciliationDialog({ isOpen, onClose, context }: QuickReconciliationDialogProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        amount: "",
        date: new Date().toISOString().split("T")[0],
        description: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const result = await reconcileManualTransaction({
                amount: Number(formData.amount),
                date: formData.date, // Server action expects string
                description: formData.description,
                type: context.type,
                plannedItemId: context.plannedItemId,
                accountId: "" // TODO: Multi-account selection in future, currently defaults to logic inside action or needs a valid ID
            })

            if (result.success) {
                toast.success("Allocation reconciled successfully.")
                router.refresh()
                onClose()
            } else {
                toast.error(result.error || "Failed to reconcile.")
            }
        } catch (error) {
            toast.error("An unexpected error occurred.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Link2 className="h-5 w-5 text-indigo-500" /> 
                        In-Place Allocation
                    </DialogTitle>
                    <DialogDescription>
                        Reconciling against <span className="font-bold text-slate-900">{context.name}</span>.
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="quick-amount">Amount</Label>
                            <Input 
                                id="quick-amount" 
                                type="number" 
                                placeholder="0.00" 
                                value={formData.amount}
                                onChange={e => setFormData({...formData, amount: e.target.value})}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quick-date">Date</Label>
                            <Input 
                                id="quick-date" 
                                type="date" 
                                value={formData.date}
                                onChange={e => setFormData({...formData, date: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="quick-description">Description</Label>
                        <Input 
                            id="quick-description" 
                            placeholder={`e.g., ${context.name} consumption`}
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            required
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-slate-900">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                <>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Finalize Allocation
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
