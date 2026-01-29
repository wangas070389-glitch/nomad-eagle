import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { getPlanningData, deleteRecurringFlow } from "@/server/actions/planning"
import { WealthSimulator } from "@/components/planning/wealth-simulator"
import { AddFlowDialog } from "@/components/planning/add-flow-dialog"
import { EditFlowDialog } from "@/components/planning/edit-flow-dialog"
import { SetLimitDialog } from "@/components/planning/set-limit-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CashFlowTable } from "@/components/planning/cash-flow-table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, TrendingUp, TrendingDown, Wallet } from "lucide-react"
import { FlowRow } from "@/components/planning/flow-row"
import { AddCategoryCard } from "@/components/planning/add-category-card"
import { generateSurplusProjection } from "@/server/core/wealth-recommender"
import { WealthRecommendationCard } from "@/components/planning/wealth-recommender-card"

export default async function PlanningPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect("/sign-in")

    const { flows, limits, categories } = await getPlanningData()

    const income = flows.filter(f => f.type === "INCOME" && f.isActive).reduce((sum, f) => sum + Number(f.amount), 0)
    const expense = flows.filter(f => f.type === "EXPENSE" && f.isActive).reduce((sum, f) => sum + Number(f.amount), 0)
    const budget = limits.reduce((sum, l) => sum + Number(l.amount), 0)

    // Quick Map for O(1) limit check
    const limitMap = new Map<string, number>()
    limits.forEach(l => limitMap.set(l.categoryId, Number(l.amount)))

    const incomeFlows = flows.filter(f => f.type === "INCOME")
    const expenseFlows = flows.filter(f => f.type === "EXPENSE")

    return (
        <div className="space-y-6 min-h-screen bg-slate-50/50 p-6 -m-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Financial Plan</h2>
                    <p className="text-muted-foreground">Define your future. Set your fixed flows and variable limits.</p>
                </div>
            </div>

            {generateSurplusProjection(income - expense - budget) && (
                <div className="mb-6">
                    <WealthRecommendationCard data={generateSurplusProjection(income - expense - budget)!} />
                </div>
            )}


            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Tabs defaultValue="visual" className="w-full">
                        <div className="flex items-center justify-between mb-2">
                            <TabsList>
                                <TabsTrigger value="visual">Visual Chart</TabsTrigger>
                                <TabsTrigger value="spreadsheet">Spreadsheet</TabsTrigger>
                            </TabsList>
                        </div>
                        <TabsContent value="visual" className="mt-0">
                            <WealthSimulator />
                        </TabsContent>
                        <TabsContent value="spreadsheet" className="mt-0">
                            <CashFlowTable />
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Monthly Snapshot</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="flex items-center text-emerald-600"><TrendingUp className="mr-2 h-4 w-4" /> Income</span>
                                <span className="font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MXN' }).format(income)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="flex items-center text-red-600"><TrendingDown className="mr-2 h-4 w-4" /> Fixed Expenses</span>
                                <span>- {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MXN' }).format(expense)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="flex items-center text-amber-600"><Wallet className="mr-2 h-4 w-4" /> Budget Limits</span>
                                <span>- {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MXN' }).format(budget)}</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between font-bold">
                                <span>Projected Surplus</span>
                                <span className={(income - expense - budget) >= 0 ? "text-emerald-600" : "text-red-600"}>
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MXN' }).format(income - expense - budget)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Income Planner */}
                <Card className="border-emerald-100 bg-emerald-50/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-emerald-900">Income Planner</CardTitle>
                            <CardDescription>Recurring Salary & Bonuses</CardDescription>
                        </div>
                        <AddFlowDialog />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {incomeFlows.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No income sources.</p>}
                        {incomeFlows.map(flow => (
                            <FlowRow key={flow.id} flow={flow} />
                        ))}
                    </CardContent>
                </Card>

                {/* Expense Planner */}
                <Card className="border-red-100 bg-red-50/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-red-900">Expense Planner</CardTitle>
                            <CardDescription>Fixed Rent, Loans, Insurance</CardDescription>
                        </div>
                        <AddFlowDialog />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {expenseFlows.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No fixed expenses.</p>}
                        {expenseFlows.map(flow => (
                            <FlowRow key={flow.id} flow={flow} />
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Compact Budget Grid */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Category Budgets</CardTitle>
                    <CardDescription>Variable spending caps per month</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {/* Deduplicated List */}
                        {Array.from(new Map(categories.map(c => [c.name, c])).values()).map(cat => {
                            const limit = limitMap.get(cat.id)
                            return (
                                <div key={cat.id} className="group relative flex flex-col justify-between rounded-lg border p-3 hover:border-indigo-400 hover:shadow-md transition-all bg-white">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="text-2xl">{cat.icon || "🏷️"}</div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <SetLimitDialog category={cat} currentLimit={limit} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm truncate" title={cat.name}>{cat.name}</div>
                                        <div className={`text-xs font-medium mt-1 ${limit ? "text-slate-900" : "text-muted-foreground italic"}`}>
                                            {limit
                                                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(limit)
                                                : "No Limit"
                                            }
                                        </div>
                                    </div>
                                </div>
                            )
                        })}

                        {/* Add New Button */}
                        <AddCategoryCard existingCategories={categories} />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
