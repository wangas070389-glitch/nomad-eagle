import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { getPlanningData } from "@/server/actions/planning"
import { AddFlowDialog } from "@/components/planning/add-flow-dialog"
import { CashFlowTable } from "@/components/planning/cash-flow-table"
import { CashFlowChart } from "@/components/planning/cash-flow-chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FlowRow } from "@/components/planning/flow-row"
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
                    <p className="text-muted-foreground italic">Deterministic capital allocation engine for 2045 wealth sovereignty.</p>
                </div>
            </div>

            {generateSurplusProjection(income - expense - budget) && (
                <div className="mb-6">
                    <WealthRecommendationCard data={generateSurplusProjection(income - expense - budget)!} />
                </div>
            )}


            <div className="space-y-6">
                <Tabs defaultValue="spreadsheet" className="w-full">
                    <div className="flex items-center justify-between mb-2">
                        <TabsList className="bg-slate-200/50 border">
                            <TabsTrigger value="spreadsheet" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Spreadsheet (In-Place Allocation)</TabsTrigger>
                            <TabsTrigger value="visual" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Visual Projection</TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="visual" className="mt-0">
                        <Card className="shadow-md border-0">
                            <CardContent className="p-0">
                                <CashFlowChart />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="spreadsheet" className="mt-0">
                        <Card className="shadow-md border-0">
                            <CardContent className="p-0">
                                <CashFlowTable />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
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
        </div>
    )
}
