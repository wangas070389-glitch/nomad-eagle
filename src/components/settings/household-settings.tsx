"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { generateInviteCode, joinHousehold } from "@/server/actions/household"
import { removeMember } from "@/server/actions/household-admin"
import { Trash2, Crown } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState, useTransition } from "react"

export function HouseholdSettings({
    members = [],
    currentUserId,
    isOwner
}: {
    members?: { id: string, name: string | null, email: string }[],
    currentUserId?: string,
    isOwner?: boolean
}) {
    const [inviteCode, setInviteCode] = useState<string | null>(null)
    const [joinCode, setJoinCode] = useState("")
    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState("")
    const [loadingInvite, startInviteTransition] = useTransition()

    // Removal State
    const [memberToRemove, setMemberToRemove] = useState<string | null>(null)

    const handleGenerateInvite = () => {
        startInviteTransition(async () => {
            const res = await generateInviteCode()
            if (res.error) setMessage(res.error)
            else if (res.code) setInviteCode(res.code)
        })
    }

    const handleJoin = () => {
        startTransition(async () => {
            const res = await joinHousehold(joinCode)
            if (res.error) setMessage(res.error)
            else if (res.success) {
                setMessage(`Successfully joined ${res.name}!`)
                window.location.reload()
            }
        })
    }

    const confirmRemoval = async () => {
        if (!memberToRemove) return
        startTransition(async () => {
            const res = await removeMember(memberToRemove)
            if (res.error) setMessage(res.error)
            else {
                setMessage("Member removed from household.")
                window.location.reload()
            }
            setMemberToRemove(null)
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Household Management</CardTitle>
                <CardDescription>Manage your family workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Members List */}
                <div className="space-y-4 border-b pb-6">
                    <Label className="text-base font-semibold">Members</Label>
                    <div className="space-y-2">
                        {members.map(m => (
                            <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                        {m.name?.substring(0, 2).toUpperCase() || "U"}
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm flex items-center gap-2">
                                            {m.name || "Unknown"}
                                            {m.id === currentUserId && <span className="text-xs text-muted-foreground">(You)</span>}
                                            {isOwner && m.id === currentUserId && <Crown className="h-3 w-3 text-amber-500" />}
                                        </div>
                                        <div className="text-xs text-muted-foreground">{m.email}</div>
                                    </div>
                                </div>
                                {isOwner && m.id !== currentUserId && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-muted-foreground hover:text-red-600 hover:bg-red-50"
                                        onClick={() => setMemberToRemove(m.id)}
                                        title="Remove Member"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Invite Section */}
                <div className="space-y-2 border-b pb-6">
                    <Label className="text-base font-semibold">Invite Partner</Label>
                    <p className="text-sm text-muted-foreground">Share this code with your partner to let them join your data.</p>

                    {!inviteCode ? (
                        <Button variant="outline" onClick={handleGenerateInvite} disabled={loadingInvite}>
                            {loadingInvite ? "Generating..." : "Generate Invite Code"}
                        </Button>
                    ) : (
                        <div className="flex items-center gap-4 animate-in fade-in">
                            <div className="text-2xl font-mono font-bold tracking-widest bg-slate-100 px-4 py-2 rounded-lg select-all">
                                {inviteCode}
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(inviteCode)}>
                                Copy
                            </Button>
                        </div>
                    )}
                </div>

                {/* Join Section */}
                <div className="space-y-2">
                    <Label className="text-base font-semibold">Join Another Household</Label>
                    <p className="text-sm text-muted-foreground">Enter a code from your partner to switch to their household.</p>
                    <div className="flex gap-2 max-w-sm">
                        <Input
                            placeholder="XXXX-XXXX-XXXX"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            maxLength={14}
                        />
                        <Button onClick={handleJoin} disabled={isPending || !joinCode}>
                            {isPending ? "Joining..." : "Join"}
                        </Button>
                    </div>
                </div>

                {message && (
                    <p className={`text-sm ${message.includes("Success") ? "text-emerald-600" : "text-red-500"}`}>
                        {message}
                    </p>
                )}

                <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Remove member?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will remove them from your household immediately. They will lose access to all shared data. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmRemoval} className="bg-red-600 hover:bg-red-700">
                                Remove
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    )
}
