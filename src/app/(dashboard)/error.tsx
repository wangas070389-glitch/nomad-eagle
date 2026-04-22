"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log to monitoring service
        console.error(error)
    }, [error])

    return (
        <div className="flex h-[80vh] items-center justify-center p-6">
            <Card className="w-full max-w-md border-red-200 bg-red-50/50">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <CardTitle className="text-xl text-red-900">System Sync Error</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-sm text-red-800/80">
                        We encountered an issue syncing your financial data. Your balance is safe, but we couldn&apos;t load the dashboard right now.
                    </p>
                    <div className="flex gap-2 justify-center">
                        <Button
                            variant="default"
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => reset()}
                        >
                            Retry Connection
                        </Button>
                        <Button
                            variant="outline"
                            className="border-red-200 text-red-700 hover:bg-red-100"
                            onClick={() => window.location.href = "/"}
                        >
                            Return Home
                        </Button>
                    </div>
                    <div className="mt-4 p-2 bg-red-100 rounded text-xs text-left font-mono overflow-auto max-h-32">
                        <p className="font-bold mb-1">Digest: {error.digest || "N/A"}</p>
                        <p>{error.message?.slice(0, 200)}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
