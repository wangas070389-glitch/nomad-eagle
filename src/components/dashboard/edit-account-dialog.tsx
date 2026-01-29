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
import { Switch } from "@/components/ui/switch"
import { updateAccount, deleteAccount } from "@/server/actions/accounts"
import { Settings, Trash2 } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { SafeAccount } from "@/lib/types"

export function EditAccountDialog({ account }: { account: SafeAccount }) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true)
        const name = formData.get("name") as string
        const type = formData.get("type") as string
        const balance = Number(formData.get("balance"))
        const isArchived = formData.get("isArchived") === "on"

        const res = await updateAccount(account.id, { name, type, balance, isArchived })
        setIsLoading(false)
        if (res.success) {
            setOpen(false)
            router.refresh()
        } else {
            alert(res.error)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this account? All associated transactions will be deleted. This cannot be undone.")) return

        setIsLoading(true)
        const res = await deleteAccount(account.id)
        if (res.success) {
            setOpen(false)
            router.refresh()
        } else {
            alert(res.error)
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Settings className="h-3.5 w-3.5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Account</DialogTitle>
                    <DialogDescription>
                        Update account details. Balance changes will generate a manual adjustment transaction.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" name="name" defaultValue={account.name} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">Type</Label>
                        <div className="col-span-3">
                            <Select name="type" defaultValue={account.type}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CHECKING">Checking</SelectItem>
                                    <SelectItem value="SAVINGS">Savings</SelectItem>
                                    <SelectItem value="INVESTMENT">Investment</SelectItem>
                                    <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                                    <SelectItem value="CASH">Cash</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="balance" className="text-right">Balance</Label>
                        <div className="col-span-3 space-y-1">
                            <Input
                                id="balance"
                                name="balance"
                                type="number"
                                step="0.01"
                                defaultValue={Number(account.balance)}
                                required
                            />
                            <p className="text-[10px] text-muted-foreground">Changing this will record an adjustment transaction.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="isArchived" className="text-right">Archived</Label>
                        <div className="col-span-3 flex items-center gap-2">
                            <Switch name="isArchived" id="isArchived" defaultChecked={account.isArchived} />
                            <Label htmlFor="isArchived" className="font-normal text-muted-foreground">
                                Hide from dashboard
                            </Label>
                        </div>
                    </div>

                    <DialogFooter className="flex justify-between sm:justify-between items-center mt-4">
                        <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={isLoading}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete Account
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
