"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "@prisma/client"
import { useActionState, useState } from "react"
import { updateUserProfile } from "@/server/actions/user-profile"

export function UserProfileSettings({ user }: { user: User }) {
    const [isEditing, setIsEditing] = useState(false)
    const [state, action, isPending] = useActionState(updateUserProfile, {})

    if (state?.success && isEditing) {
        setIsEditing(false)
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>Manage your public identity and career details.</CardDescription>
                    </div>
                    {!isEditing && (
                        <Button variant="outline" onClick={() => setIsEditing(true)}>Edit Profile</Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {isEditing ? (
                    <form action={action} className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="space-y-2 flex-1">
                                <Label>Avatar URL</Label>
                                <Input name="avatarUrl" defaultValue={user.avatarUrl || ""} placeholder="https://..." />
                            </div>
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={user.avatarUrl || ""} />
                                <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Display Name</Label>
                                <Input name="displayName" defaultValue={user.displayName || ""} placeholder="Captain Kirk" />
                            </div>
                            <div className="space-y-2">
                                <Label>Job Title</Label>
                                <Input name="jobTitle" defaultValue={user.jobTitle || ""} placeholder="Starship Captain" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Currency Preference</Label>
                            <select name="currency" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" defaultValue={user.currency}>
                                <option value="USD">USD ($)</option>
                                <option value="MXN">MXN ($)</option>
                            </select>
                        </div>

                        <div className="flex gap-2 justify-end">
                            <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save Changes"}</Button>
                        </div>
                    </form>
                ) : (
                    <div className="flex items-center gap-6">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={user.avatarUrl || ""} />
                            <AvatarFallback className="text-xl">{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <h3 className="text-xl font-semibold">{user.displayName || "No Name Set"}</h3>
                            <p className="text-sm text-muted-foreground">{user.jobTitle || "No Job Title"}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
