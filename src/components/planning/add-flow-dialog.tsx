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
import { Plus } from "lucide-react"

export function AddFlowDialog() {
    const [open, setOpen] = useState(false)

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
                    <DialogTitle>Add Recurring Item</DialogTitle>
                    <DialogDescription>
                        Something that happens regularly, like Salary, Rent, or an Annual Bonus.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" name="name" placeholder="e.g. Annual Bonus" className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">Amount</Label>
                            <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" className="col-span-3" required />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="frequency" className="text-right">Frequency</Label>
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

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">Type</Label>
                            <Select name="type" required defaultValue="INCOME">
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="INCOME">Income</SelectItem>
                                    <SelectItem value="EXPENSE">Expense</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
