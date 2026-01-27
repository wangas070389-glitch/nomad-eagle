"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, CheckCircle, Trash } from "lucide-react"
import { settleTrip, deleteTrip } from "@/server/actions/trip-lifecycle"
import { useRouter } from "next/navigation"

export function TripSettings({ tripId, status }: { tripId: string, status: string }) {
    const router = useRouter()

    const handleSettle = async () => {
        if (!confirm("Are you sure you want to settle this trip? It will be marked as completed.")) return
        await settleTrip(tripId)
        router.refresh()
    }

    const handleDelete = async () => {
        const choice = confirm("Delete this trip? Click OK to DELETE transactions too, or Cancel to KEEP transactions.")
        // Typically a better UI would use a dialog, but utilizing confirm boolean for MVP flux
        // Actually, let's just make it a strict delete for now, or ask via prompt.
        // User Constraints: "Ask user: Delete associated transactions too?"
        // Simpler: Two menu items.
    }

    const handleDeleteWithTx = async () => {
        if (!confirm("This will PERMANENTLY delete the trip and ALL its transactions. This refunds your balance. Continue?")) return
        await deleteTrip(tripId, true)
        router.push("/trips")
    }

    const handleDeleteKeepTx = async () => {
        if (!confirm("This will delete the trip container but KEEP the transactions in your history as generic expenses. Continue?")) return
        await deleteTrip(tripId, false)
        router.push("/trips")
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Manage Trip</DropdownMenuLabel>
                {status !== "COMPLETED" && (
                    <DropdownMenuItem onClick={handleSettle}>
                        <CheckCircle className="mr-2 h-4 w-4" /> Settle Trip
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDeleteKeepTx} className="text-red-600">
                    <Trash className="mr-2 h-4 w-4" /> Delete (Keep Data)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteWithTx} className="text-red-600 font-bold">
                    <Trash className="mr-2 h-4 w-4" /> Delete (Erase All)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
