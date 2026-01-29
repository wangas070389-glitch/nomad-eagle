"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { upgradeToPro } from "@/server/actions/subscription"

export function PaymentSimulation({ onSuccess }: { onSuccess: () => void }) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        const res = await upgradeToPro()

        setIsLoading(false)
        if (res?.error) {
            setError(res.error)
        } else {
            onSuccess()
        }
    }

    return (
        <form onSubmit={handlePayment} className="space-y-4 pt-4 border-t">
            <h4 className="font-semibold text-sm">Secure Payment (Simulated)</h4>

            <div className="space-y-2">
                <Label>Card Number</Label>
                <div className="relative">
                    <Input placeholder="4242 4242 4242 4242" defaultValue="4242 4242 4242 4242" readOnly className="bg-slate-50 font-mono" />
                    <div className="absolute right-3 top-2.5 text-xs text-muted-foreground">VISA</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Expiry</Label>
                    <Input placeholder="MM/YY" defaultValue="12/30" readOnly className="bg-slate-50" />
                </div>
                <div className="space-y-2">
                    <Label>CVC</Label>
                    <Input placeholder="123" defaultValue="123" type="password" readOnly className="bg-slate-50" />
                </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg" disabled={isLoading}>
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                    </>
                ) : (
                    "Confirm Payment • $12.99"
                )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
                This is a demo. No actual money will be charged.
            </p>
        </form>
    )
}
