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
import { setBudgetLimit } from "@/server/actions/planning"
import { useState } from "react"
import { Settings2 } from "lucide-react"

import { Category } from "@/lib/types"

export function SetLimitDialog({ category, currentLimit }: { category: Category, currentLimit?: number }) {
    const [open, setOpen] = useState(false)

    async function handleSubmit(formData: FormData) {
        await setBudgetLimit(formData)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="h-6 w-6 p-0 bg-transparent hover:bg-slate-100/50 shadow-none text-muted-foreground hover:text-foreground">
                    <Settings2 className="h-3 w-3" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Budget Limit: {category.name}</DialogTitle>
                    <DialogDescription>
                        Set a monthly spending limit for this category. set to 0 to remove.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit}>
                    <input type="hidden" name="categoryId" value={category.id} />
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">
                                Limit
                            </Label>
                            <Input
                                id="amount"
                                name="amount"
                                type="number"
                                step="1"
                                defaultValue={currentLimit || ""}
                                placeholder="No Limit"
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Save Limit</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
