"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateInvestment } from "@/server/actions/investments"
import { Pencil } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function EditInvestmentDialog({ position }: { position: any }) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true)
        const quantity = Number(formData.get("quantity"))
        const costBasis = Number(formData.get("costBasis"))

        const res = await updateInvestment(position.id, { quantity, costBasis })
        setIsLoading(false)
        if (res.success) {
            setOpen(false)
            router.refresh()
        } else {
            alert(res.error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                    <Pencil className="h-3.5 w-3.5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit {position.name}</DialogTitle>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="quantity" className="text-right">Quantity</Label>
                        <Input
                            id="quantity"
                            name="quantity"
                            type="number"
                            step="0.000001"
                            defaultValue={Number(position.quantity)}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="costBasis" className="text-right">Unit Cost</Label>
                        <Input
                            id="costBasis"
                            name="costBasis"
                            type="number"
                            step="0.01"
                            defaultValue={Number(position.costBasis)}
                            className="col-span-3"
                            required
                        />
                    </div>

                    <div className="flex justify-end mt-4">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
