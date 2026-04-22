import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { authOptions } from "@/lib/auth"
import { getAccounts } from "@/server/actions/accounts"
import { getCategories, getTransactions, seedCategories } from "@/server/actions/transactions"
import { getPlannerCategories } from "@/server/actions/categories"
import { getPortfolioSummary } from "@/server/actions/investments"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { OnboardingForms } from "@/components/dashboard/onboarding-forms"
// import { AccountCard } from "@/components/dashboard/account-card" // Removed, used in tabs now
import { AddAccountForm } from "@/components/dashboard/add-account-form"
import { AddTransactionDialog } from "@/components/dashboard/add-transaction-dialog"
import { TransactionList } from "@/components/dashboard/transaction-list"
import { AccountListTabs } from "@/components/dashboard/account-list-tabs"
import { AddInvestmentDialog } from "@/components/dashboard/investments/add-investment-dialog"
import { PortfolioSummary } from "@/components/dashboard/investments/portfolio-summary"
import { BudgetProgress } from "@/components/dashboard/budget/budget-progress"
// import { WealthSimulator } from "@/components/planning/wealth-simulator" // Replaced by CashFlowChart
import { CashFlowChart } from "@/components/planning/cash-flow-chart"
import { getDetailedCashFlow } from "@/server/actions/cashflow"
import { getHouseholdMembers } from "@/server/actions/household"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import { ReportGenerator } from "@/components/dashboard/report-generator"
import { SemanticSearch } from "@/components/SemanticSearch"
import { LedgerIntegrityPanel } from "@/components/ledger/integrity-panel"

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect("/sign-in")

    if (!session.user.householdId) {
        return (
            <div className="max-w-2xl mx-auto mt-10 space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight">Welcome aboard!</h2>
                    <p className="text-muted-foreground mt-2">
                        To get started, you need to join or create a household.
                    </p>
                </div>
                <OnboardingForms />
            </div>
        )
    }

    // Resilient data fetching: each call is wrapped so a single failure
    // (DB timeout, cold-start, schema drift) doesn't crash the entire dashboard.
    async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
        try { return await fn() } catch (e) { console.error("[Dashboard] Data fetch failed:", e); return fallback }
    }

    const [
        accounts,
        categories,
        plannerCategories,
        transactions,
        portfolio,
        householdMembers,
        cashFlow
    ] = await Promise.all([
        safe(getAccounts, []),
        safe(getCategories, []),
        safe(getPlannerCategories, []),
        safe(() => getTransactions(1, 5), []),
        safe(getPortfolioSummary, { totalValueMXN: 0, positions: [], exchangeRate: 1 }),
        safe(getHouseholdMembers, []),
        safe(getDetailedCashFlow, { error: "Failed to load cash flow" } as { error: string })
    ])

    const accountOptions = accounts.map(a => ({
        id: a.id,
        name: a.name,
        ownerId: a.ownerId,
        currency: a.currency,
        type: a.type
    }))

    const currentUserId = session.user.id

    const cashBalance = accounts.reduce((sum: number, acc) => sum + Number(acc.balance), 0)

    return (
        <div id="dashboard-content" className="space-y-6 min-h-screen bg-slate-50 dark:bg-slate-950 p-6 -m-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <div className="text-sm text-muted-foreground mt-1">
                        Household ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{session.user.householdId}</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                    <ReportGenerator />

                    {categories.length === 0 && (
                        <form action={async (formData) => {
                            "use server"
                            await seedCategories(formData)
                        }}>
                            <Button>Seed Categories</Button>
                        </form>
                    )}

                    <AddTransactionDialog
                        accounts={accountOptions}
                        categories={categories}
                        plannerCategories={plannerCategories}
                        members={householdMembers}
                        currentUserId={currentUserId}
                    />
                    <AddInvestmentDialog accounts={accounts} />

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>Add Account</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Account</DialogTitle>
                                <DialogDescription>
                                    Track a new bank account, credit card, or investment portfolio.
                                </DialogDescription>
                            </DialogHeader>
                            <AddAccountForm />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <SemanticSearch />

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="glass-card shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Household Cash</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MXN' }).format(cashBalance)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Combined liquidity of {householdMembers.map(m => m.name || m.id).join(" & ")}
                        </p>
                    </CardContent>
                </Card>

                <Card className="glass-card shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Investments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MXN' }).format(portfolio.totalValueMXN)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            ~{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(portfolio.totalValueMXN / (portfolio.exchangeRate || 1))} USD
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cashBalance + (portfolio.totalValueMXN / (portfolio.exchangeRate || 1)))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total Assets (Est. USD)
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col xl:grid xl:grid-cols-12 gap-6">
                <div className="w-full xl:col-span-8 space-y-6">
                    <div>
                        <h3 className="text-lg font-medium mb-4 sr-only">Your Accounts</h3>
                        <AccountListTabs
                            accounts={accounts} // accounts already has balance from getAccounts
                            members={householdMembers}
                            currentUserId={currentUserId}
                        />
                    </div>

                    <CashFlowChart
                        initialData={"error" in cashFlow ? null : cashFlow}
                        className="h-[200px]"
                    />

                    <div>
                        <TransactionList
                            transactions={transactions}
                            currentUserId={currentUserId}
                            accounts={accountOptions}
                            categories={categories}
                            members={householdMembers}
                        />
                    </div>
                </div>

                <div className="w-full xl:col-span-4 space-y-6">
                    <LedgerIntegrityPanel />
                    <PortfolioSummary summary={portfolio} accounts={accounts} />
                    <BudgetProgress />
                </div>
            </div>
        </div>
    )
}
