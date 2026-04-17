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
import { updateRecurringFlow } from "@/server/actions/planning"
import { useState } from "react"
import { Pencil, Link2 } from "lucide-react"

import { SafeRecurringFlow } from "@/lib/types"

interface EditFlowDialogProps {
    flow: SafeRecurringFlow
}

export function EditFlowDialog({ flow }: EditFlowDialogProps) {
    const [open, setOpen] = useState(false)
    const [type, setType] = useState<"INCOME" | "EXPENSE">(flow.type as "INCOME" | "EXPENSE")

    async function handleSubmit(formData: FormData) {
        await updateRecurringFlow(formData)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="h-8 w-8 text-muted-foreground hover:text-primary bg-transparent hover:bg-slate-100 shadow-none p-2 mr-1">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Link2 className="h-5 w-5 text-indigo-500" />
                        Edit Strategic Flow
                    </DialogTitle>
                    <DialogDescription>
                        Update details and relational anchors for this item.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit}>
                    <input type="hidden" name="id" value={flow.id} />
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" name="name" defaultValue={flow.name} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">Amount</Label>
                            <Input id="amount" name="amount" type="number" step="0.01" defaultValue={Number(flow.amount)} className="col-span-3" required />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">Flow Type</Label>
                            <Select name="type" required value={type} onValueChange={(v: "INCOME" | "EXPENSE") => setType(v)}>
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
                            <Select name="bucket" required defaultValue={flow.bucket || (type === "INCOME" ? "CAPITAL_INFLOW" : "FIXED_OBLIGATION")}>
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
                                defaultValue={flow.tags?.join(", ") || ""}
                                className="col-span-3 border-dashed"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4 border-t pt-4 mt-2">
                            <Label htmlFor="frequency" className="text-right">Frequency</Label>
                            <Select name="frequency" required defaultValue={flow.frequency}>
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
                                defaultValue={flow.startDate ? new Date(flow.startDate).toISOString().split('T')[0] : ''}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" className="bg-slate-900">Update strategic flow</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}