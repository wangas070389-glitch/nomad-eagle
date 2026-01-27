
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Lock } from "lucide-react"
import { rotatePassword } from "@/server/actions/security"

export function PasswordChangeForm() {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const newPass = formData.get("newPassword") as string
        const confirmPass = formData.get("confirmPassword") as string

        if (newPass !== confirmPass) {
            toast({ title: "Validation Error", description: "Passwords do not match.", variant: "destructive" })
            setLoading(false)
            return
        }

        try {
            // We use the raw server action which returns { success: string } or { error: string }
            const result = await rotatePassword(formData)

            if (result.error) {
                toast({ title: "Security Alert", description: result.error, variant: "destructive" })
            } else {
                toast({ title: "Success", description: result.success });
                // Optional: Reset form
                (e.target as HTMLFormElement).reset()
            }
        } catch (err) {
            toast({ title: "Error", description: "Communication breakdown.", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-indigo-500" />
                    Credentials
                </CardTitle>
                <CardDescription>
                    Rotate your secure access keys.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input id="currentPassword" name="currentPassword" type="password" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input id="newPassword" name="newPassword" type="password" required minLength={8} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-slate-50 dark:bg-slate-900/50 p-4 border-t border-slate-100 dark:border-slate-800">
                    <Button type="submit" disabled={loading} className="ml-auto">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Update Credentials"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
