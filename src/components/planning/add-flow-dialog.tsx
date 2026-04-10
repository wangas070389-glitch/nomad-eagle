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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { addRecurringFlow } from "@/server/actions/planning"
import { useState } from "react"
import { Plus, Link2 } from "lucide-react"

interface AddFlowDialogProps {
    categories: any[]
    limits: any[]
}

export function AddFlowDialog({ categories, limits }: AddFlowDialogProps) {
    const [open, setOpen] = useState(false)
    const [type, setType] = useState<"INCOME" | "EXPENSE">("INCOME")

    async function handleSubmit(formData: FormData) {
        await addRecurringFlow(formData)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="h-8 gap-1 bg-transparent border border-input text-foreground hover:bg-slate-100 shadow-none">
                    <Plus className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Add Item
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Link2 className="h-5 w-5 text-indigo-500" />
                        Add Strategic Flow
                    </DialogTitle>
                    <DialogDescription>
                        Define a recurring capital injection or liabilities.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" name="name" placeholder="e.g. Salary" className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">Amount</Label>
                            <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" className="col-span-3" required />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">Flow Type</Label>
                            <Select name="type" required value={type} onValueChange={(v: any) => setType(v)}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="INCOME">Income</SelectItem>
                                    <SelectItem value="EXPENSE">Expense</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="bucket" className="text-right text-indigo-600 font-bold">Strategic Bucket</Label>
                            <Select name="bucket" required defaultValue={type === "INCOME" ? "CAPITAL_INFLOW" : "FIXED_OBLIGATION"}>
                                <SelectTrigger className="col-span-3 border-indigo-200 bg-indigo-50/10">
                                    <SelectValue placeholder="Select decision bucket" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CAPITAL_INFLOW">Capital Inflow (Forecasting Base)</SelectItem>
                                    <SelectItem value="FIXED_OBLIGATION">Fixed Obligation (Liability Anchor)</SelectItem>
                                    <SelectItem value="VARIABLE_ALLOCATION">Variable Allocation (Optimizable Flow)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Metadata Tagging (The Decoupled Layer) */}
                        <div className="grid grid-cols-4 items-center gap-4 border-t pt-4">
                            <Label htmlFor="tags" className="text-right text-slate-500 italic">Audit Tags</Label>
                            <Input
                                id="tags"
                                name="tags"
                                placeholder="e.g. Lego, AWS, Rent, Hobby"
                                className="col-span-3 border-dashed"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4 border-t pt-2 mt-2">
                            <Label htmlFor="frequency" className="text-right font-medium">Frequency</Label>
                            <Select name="frequency" required defaultValue="MONTHLY">
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                                    <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                                    <SelectItem value="SEMIANNUAL">Every 6 Months</SelectItem>
                                    <SelectItem value="ANNUAL">Annually</SelectItem>
                                    <SelectItem value="ONE_TIME">One Time</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="startDate" className="text-right">Start Date</Label>
                            <Input
                                id="startDate"
                                name="startDate"
                                type="date"
                                className="col-span-3"
                                defaultValue={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>

                        <div className="pt-2 text-[10px] text-slate-400 text-center italic">
                            DIMENSIONAL NOISE ELIMINATED. SOLVENCY ENGAGED.
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" className="bg-slate-900">Finalize strategic flow</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
