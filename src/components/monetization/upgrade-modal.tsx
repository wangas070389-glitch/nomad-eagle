"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, Sparkles } from "lucide-react"
import { PaymentSimulation } from "./payment-simulation"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function UpgradeModal({ children }: { children?: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [status, setStatus] = useState<"idle" | "success">("idle")
    const router = useRouter()

    const handleSuccess = () => {
        setStatus("success")
        setTimeout(() => {
            setIsOpen(false)
            router.refresh()
            setStatus("idle")
        }, 2000)
    }

    if (status === "success") {
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-md text-center py-12">
                    <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600 animate-in zoom-in spin-in-12">
                        <Check className="h-8 w-8" />
                    </div>
                    <DialogTitle className="text-2xl">Welcome to Pro!</DialogTitle>
                    <DialogDescription className="text-lg">
                        Your account has been upgraded successfully.
                    </DialogDescription>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Upgrade to Pro
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Sparkles className="h-5 w-5 text-amber-500" />
                        Upgrade to Nomad Eagle Pro
                    </DialogTitle>
                    <DialogDescription>
                        Unlock the full potential of your financial flight control system.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid gap-2">
                        {[
                            "Unlimited Households",
                            "AI Wealth Forecasting",
                            "Advanced Investment Analytics",
                            "Priority Support",
                            "Multi-Currency Auto-Sync"
                        ].map((feature) => (
                            <div key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                                <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                    <Check className="h-3 w-3" />
                                </div>
                                {feature}
                            </div>
                        ))}
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg flex justify-between items-center border">
                        <div>
                            <span className="text-2xl font-bold">$12.99</span>
                            <span className="text-sm text-muted-foreground">/month</span>
                        </div>
                        <div className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
                            7-day free trial
                        </div>
                    </div>
                </div>

                <PaymentSimulation onSuccess={handleSuccess} />
            </DialogContent>
        </Dialog>
    )
}
