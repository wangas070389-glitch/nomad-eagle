"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert, Loader2 } from "lucide-react"
import { signOut } from "next-auth/react"

export default function PendingPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                        <ShieldAlert className="h-6 w-6 text-yellow-600" />
                    </div>
                    <CardTitle className="text-2xl">Access Pending</CardTitle>
                    <CardDescription>
                        Your account is currently under review by the household administrator.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="rounded-md bg-slate-100 p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        <p>
                            Operation Watchtower has secured this node. Access is restricted to authorized personnel only.
                            Please contact your administrator to active your clearance.
                        </p>
                    </div>

                    <Button variant="outline" onClick={() => signOut({ callbackUrl: "/sign-in" })} className="w-full">
                        Return to Sign In
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
