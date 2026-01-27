"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateProfile } from "@/server/actions/profile"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { PasswordChangeForm } from "@/components/forms/password-change-form"

export default function ProfilePage() {
    const { data: session, update } = useSession() // We'll need update() to refresh the client session
    const [name, setName] = useState("")
    const [currency, setCurrency] = useState("MXN")
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    useEffect(() => {
        if (session?.user) {
            setName(session.user.displayName || session.user.name || "")
            // @ts-ignore - relying on our new types but they might take a sec to propagate in IDE
            setCurrency(session.user.currency || "MXN")
        }
    }, [session])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await updateProfile({ displayName: name, currency })

            if (result.success) {
                // Force session update on client
                await update({
                    ...session,
                    user: {
                        ...session?.user,
                        displayName: name,
                        currency: currency
                    }
                })

                toast({
                    title: "Profile Updated",
                    description: "Your changes have been saved successfully.",
                })

                router.refresh()
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to update profile",
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-xl mx-auto py-10">
            <h1 className="text-3xl font-bold mb-8 text-slate-900">Your Profile</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Identity & Preferences</CardTitle>
                    <CardDescription>
                        Manage how you appear in the household and your preferred currency.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="displayName">Display Name</Label>
                            <Input
                                id="displayName"
                                placeholder="How should we call you?"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-white"
                            />
                            <p className="text-xs text-slate-500">
                                This will be visible to other members of your household.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="currency">Default Currency</Label>
                            <Select value={currency} onValueChange={setCurrency}>
                                <SelectTrigger className="w-full bg-white">
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MXN">Mexican Peso (MXN)</SelectItem>
                                    <SelectItem value="USD">US Dollar (USD)</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-slate-500">
                                Used for default views. You can still hold accounts in other currencies.
                            </p>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="mt-8">
                <PasswordChangeForm />
            </div>
        </div >
    )
}
