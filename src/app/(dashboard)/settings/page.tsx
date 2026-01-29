import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResetDialog } from "@/components/settings/reset-dialog"
import { HouseholdSettings } from "@/components/settings/household-settings"
import { UpgradeModal } from "@/components/monetization/upgrade-modal"
import { Badge } from "@/components/ui/badge"

import { CategoryManager } from "@/components/settings/category-manager"
import { UserProfileSettings } from "@/components/settings/user-profile-settings"
import { IncomeHistoryList } from "@/components/settings/income-history-list"

import { prisma } from "@/lib/prisma"
import { getHouseholdMembers } from "@/server/actions/household"
import { getCategories } from "@/server/actions/categories"

export default async function SettingsPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect("/sign-in")

    if (!session.user.householdId) return <div className="p-8">Please join a household first.</div>

    // Optimally, fetch everything in parallel or one go
    const [household, members, categories, user] = await Promise.all([
        prisma.household.findUnique({
            where: { id: session.user.householdId },
            select: { ownerId: true }
        }),
        getHouseholdMembers(),
        getCategories(),
        prisma.user.findUnique({
            where: { id: session.user.id },
            include: { incomeHistory: true }
        })
    ])

    if (!user) return <div>User not found</div>

    const isOwner = household?.ownerId === session.user.id
    const isPro = user.tier === "PRO"

    return (
        <div className="space-y-6 min-h-screen bg-slate-50/50 p-6 -m-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        Settings
                        {isPro && <Badge variant="default" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">PRO</Badge>}
                    </h2>
                    <p className="text-muted-foreground">Manage your household preferences and data.</p>
                </div>
                {!isPro && (
                    <UpgradeModal />
                )}
            </div>

            <div className="space-y-6">

                {/* Personal Settings */}
                <div className="grid md:grid-cols-2 gap-6">
                    <UserProfileSettings user={user} />
                    <IncomeHistoryList history={user.incomeHistory} />
                </div>

                {/* Household Settings */}
                <HouseholdSettings
                    members={members}
                    currentUserId={session.user.id}
                    isOwner={isOwner}
                />

                <CategoryManager categories={categories} />

                <Card className="border-destructive/50">
                    <CardHeader>
                        <CardTitle className="text-destructive">Danger Zone</CardTitle>
                        <CardDescription>
                            Destructive actions that affect your entire household data.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                            <div>
                                <h4 className="font-semibold text-sm">Reset Household Data</h4>
                                <p className="text-sm text-muted-foreground">
                                    Deletes all Accounts, Transactions, Budgets, and Plans.
                                </p>
                            </div>
                            <ResetDialog />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
