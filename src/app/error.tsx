"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
            <div className="mb-4 rounded-full bg-orange-100 p-3">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
                Something went wrong
            </h2>
            <p className="mb-6 max-w-sm text-gray-500">
                We apologize for the inconvenience. An unexpected error occurred.
            </p>
            <div className="flex gap-4">
                <Button onClick={() => reset()}>Try again</Button>
                <Button variant="outline" onClick={() => window.location.href = "/"}>
                    Go Home
                </Button>
            </div>
        </div>
    )
}
