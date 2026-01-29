"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import { EditAccountDialog } from "@/components/dashboard/edit-account-dialog"
import { SafeAccount } from "@/lib/types"

export function AccountCard({ account }: { account: SafeAccount }) {
    // Gradient mapping based on account type
    const gradients = {
        CHECKING: "bg-gradient-to-br from-blue-500 to-blue-600",
        SAVINGS: "bg-gradient-to-br from-emerald-500 to-teal-600",
        INVESTMENT: "bg-gradient-to-br from-violet-500 to-purple-600",
        CREDIT_CARD: "bg-gradient-to-br from-pink-500 to-rose-600",
        CASH: "bg-gradient-to-br from-amber-400 to-orange-500",
    }

    // Type coercion safely
    const typeKey = (account.type || "CHECKING") as keyof typeof gradients
    const bgClass = gradients[typeKey] || "bg-gradient-to-br from-slate-500 to-gray-600"

    return (
        <Card className="overflow-hidden border-none shadow-md group hover:shadow-lg transition-all hover:-translate-y-0.5 relative">
            <div className={cn("h-2 w-full absolute top-0 left-0", bgClass)} />

            {/* Edit Button (Visible on Hover via Group) */}
            <EditAccountDialog account={account} />

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                    {account.name}
                    {account.ownerId ? (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 cursor-default bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 shadow-none font-normal">Me</Badge>
                    ) : (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 cursor-default bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-100 shadow-none font-normal">Joint</Badge>
                    )}
                </CardTitle>
                <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{account.currency}</div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold tracking-tight text-foreground">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: account.currency }).format(Number(account.balance))}
                </div>
                <p className="text-xs text-muted-foreground capitalize mt-1 font-medium">
                    {account.type.replace('_', ' ').toLowerCase()}
                </p>
            </CardContent>
        </Card>
    )
}
