"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Trash2, Edit2 } from "lucide-react"
import { useState } from "react"
import { deleteTransaction } from "@/server/actions/transaction-ops"

export function TransactionActions({
    transactionId,
    onEdit
}: {
    transactionId: string,
    onEdit: () => void
}) {
    const [open, setOpen] = useState(false)

    const handleDelete = async () => {
        if (!confirm("Are you sure? This will revert the balance impact.")) return
        await deleteTransaction(transactionId)
    }

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setOpen(false); onEdit() }}>
                    <Edit2 className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleDelete}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
