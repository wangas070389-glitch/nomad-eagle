"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AccountCard } from "@/components/dashboard/account-card"
import { SafeAccount } from "@/lib/types" // Reusing type
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface AccountListTabsProps {
    accounts: SafeAccount[]
    members: { id: string, name: string | null }[]
    currentUserId: string
}

export function AccountListTabs({ accounts, members, currentUserId }: AccountListTabsProps) {
    const [activeTab, setActiveTab] = useState("all")

    // Helper to calculate total for current view
    const calculateTotal = (filteredAccounts: typeof accounts) => {
        return filteredAccounts.reduce((sum, acc) => sum + Number(acc.balance), 0)
    }

    const jointAccounts = accounts.filter(a => !a.ownerId)
    const hasJoint = jointAccounts.length > 0

    return (
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="text-lg font-medium">Your Accounts</h3>
                <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    {hasJoint && <TabsTrigger value="joint">Joint</TabsTrigger>}
                    {members.map(member => (
                        <TabsTrigger key={member.id} value={member.id}>
                            {member.name || "Member"}
                            {member.id === currentUserId && " (You)"}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </div>

            {/* All Accounts */}
            <TabsContent value="all" className="space-y-4">
                {accounts.length === 0 ? (
                    <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
                        No accounts yet. Add one to get started.
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {accounts.map((acc) => (
                            <AccountCard key={acc.id} account={acc} />
                        ))}
                    </div>
                )}
            </TabsContent>

            {/* Joint Accounts */}
            {hasJoint && (
                <TabsContent value="joint" className="space-y-4">
                    <div className="p-4 bg-purple-50 rounded-lg mb-4 border border-purple-100">
                        <div className="text-sm font-medium text-purple-900">Joint Balance</div>
                        <div className="text-2xl font-bold text-purple-700">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MXN' }).format(calculateTotal(jointAccounts))}
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {jointAccounts.map((acc) => (
                            <AccountCard key={acc.id} account={acc} />
                        ))}
                    </div>
                </TabsContent>
            )}

            {/* Member Tabs */}
            {members.map(member => {
                const memberAccounts = accounts.filter(a => a.ownerId === member.id)
                const total = calculateTotal(memberAccounts)

                return (
                    <TabsContent key={member.id} value={member.id} className="space-y-4">
                        {memberAccounts.length === 0 ? (
                            <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
                                No personal accounts found for {member.name}.
                            </div>
                        ) : (
                            <>
                                <div className={cn(
                                    "p-4 rounded-lg mb-4 border",
                                    member.id === currentUserId ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-200"
                                )}>
                                    <div className={cn(
                                        "text-sm font-medium",
                                        member.id === currentUserId ? "text-emerald-900" : "text-slate-900"
                                    )}>
                                        {member.name}'s Total
                                    </div>
                                    <div className={cn(
                                        "text-2xl font-bold",
                                        member.id === currentUserId ? "text-emerald-700" : "text-slate-700"
                                    )}>
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MXN' }).format(total)}
                                    </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {memberAccounts.map((acc) => (
                                        <AccountCard key={acc.id} account={acc} />
                                    ))}
                                </div>
                            </>
                        )}
                    </TabsContent>
                )
            })}
        </Tabs>
    )
}
