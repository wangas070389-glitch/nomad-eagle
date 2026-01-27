
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Shield, Ban, Trash2, CheckCircle } from "lucide-react"
import { toggleUserStatus, terminateEntity } from "@/server/actions/admin"
import { ReplicationAction } from "./replication-action"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface UserActionsProps {
    userId: string
    userEmail: string
    userRole: string
    userStatus: string
}

export function UserActions({ userId, userEmail, userRole, userStatus }: UserActionsProps) {
    const { toast } = useToast()
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleStatusChange = async (newStatus: "ACTIVE" | "PENDING" | "REJECTED") => {
        setLoading(true)
        try {
            await toggleUserStatus(userId, newStatus)
            toast({ title: "Status Updated", description: `User is now ${newStatus}` })
            router.refresh()
        } catch (error) {
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Confirm TERMINATION of this entity? This cannot be undone.")) return

        setLoading(true)
        try {
            await terminateEntity(userId, "USER")
            toast({ title: "Entity Terminated", description: "User has been deleted." })
            router.refresh()
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete user", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(userId)}>
                    Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                {userStatus !== "ACTIVE" && (
                    <DropdownMenuItem onClick={() => handleStatusChange("ACTIVE")}>
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        Approve Access
                    </DropdownMenuItem>
                )}

                {userStatus === "ACTIVE" && (
                    <DropdownMenuItem onClick={() => handleStatusChange("REJECTED")}>
                        <Ban className="mr-2 h-4 w-4 text-orange-500" />
                        Suspend Access
                    </DropdownMenuItem>
                )}

                <ReplicationAction sourceEmail={userEmail} />

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={async () => {
                    if (!confirm("Reset password for this user to 'ChangeMe123!'?")) return
                    try {
                        const { resetUserPassword } = await import("@/server/actions/admin")
                        await resetUserPassword(userId)
                        toast({ title: "Password Restored", description: "Reset to: ChangeMe123!" })
                    } catch (e) {
                        toast({ title: "Error", description: "Failed to reset password", variant: "destructive" })
                    }
                }}>
                    <Shield className="mr-2 h-4 w-4 text-indigo-500" />
                    Restore Password
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Terminate Entity
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
