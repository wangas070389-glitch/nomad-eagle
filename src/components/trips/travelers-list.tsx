"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createInviteToken } from "@/server/actions/trip-invite"
import { Copy, Users } from "lucide-react"
import { useState } from "react"

export function TravelersList({
    members,
    tripId,
    isOwner
}: {
    members: any[],
    tripId: string,
    isOwner: boolean
}) {
    const [inviteLink, setInviteLink] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleInvite = async () => {
        setIsLoading(true)
        const res = await createInviteToken(tripId)
        setIsLoading(false)

        if (res.error) {
            alert(res.error)
            return
        }

        if (res.token) {
            const link = `${window.location.origin}/invite/${res.token}`
            setInviteLink(link)
            navigator.clipboard.writeText(link)
            // toast.success("Copied to clipboard!") -> Simplistic alert for now
            alert("Link copied to clipboard!")
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    Travelers ({members.length})
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="flex -space-x-2 overflow-hidden mb-4">
                    {members.map((m) => (
                        <div key={m.userId} className="h-8 w-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600" title={m.user.name || m.user.email}>
                            {m.user.name?.[0] || "?"}
                        </div>
                    ))}
                </div>

                {isOwner && (
                    <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full gap-2" onClick={handleInvite} disabled={isLoading}>
                            <Copy className="h-3 w-3" />
                            {isLoading ? "Generating..." : "Invite Friend"}
                        </Button>
                        {inviteLink && (
                            <div className="text-[10px] text-muted-foreground break-all bg-slate-50 p-2 rounded">
                                {inviteLink}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
