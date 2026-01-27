import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResetDialog } from "@/components/settings/reset-dialog"
import { HouseholdSettings } from "@/components/settings/household-settings"
import { CategoryManager } from "@/components/settings/category-manager"

import { prisma } from "@/lib/prisma"
import { getHouseholdMembers } from "@/server/actions/household"
import { getCategories } from "@/server/actions/categories"

export default async function SettingsPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect("/sign-in")

    if (!session.user.householdId) return <div className="p-8">Please join a household first.</div>

    const household = await prisma.household.findUnique({
        where: { id: session.user.householdId },
        select: { ownerId: true }
    })

    const members = await getHouseholdMembers()
    const categories = await getCategories()
    const isOwner = household?.ownerId === session.user.id

    return (
        <div className="space-y-6 min-h-screen bg-slate-50/50 p-6 -m-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">Manage your household preferences and data.</p>
            </div>

            <div className="space-y-6">
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
