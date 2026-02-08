import { WealthSimulator } from "@/components/planning/wealth-simulator"
import { getAccounts } from "@/server/actions/accounts"
import { getPortfolioSummary } from "@/server/actions/investments"
import { getPlanningData } from "@/server/actions/planning"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function WealthPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect("/sign-in")

    const [accounts, portfolio, { flows, limits }] = await Promise.all([
        getAccounts(),
        getPortfolioSummary(),
        getPlanningData()
    ])

    const cashBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0)
    const investmentValue = portfolio.totalValueMXN / (portfolio.exchangeRate || 1)
    const netWorth = cashBalance + investmentValue

    // Calculate Real Monthly Surplus
    const income = flows.filter(f => f.type === "INCOME" && f.isActive).reduce((sum, f) => sum + Number(f.amount), 0)
    const expense = flows.filter(f => f.type === "EXPENSE" && f.isActive).reduce((sum, f) => sum + Number(f.amount), 0)
    const budget = limits.reduce((sum, l) => sum + Number(l.amount), 0)
    const monthlySurplus = Math.max(0, income - expense - budget)

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Wealth Simulator</h2>
            </div>

            <WealthSimulator
                initialNetWorth={netWorth}
                initialMonthlyFlow={monthlySurplus}
            />
        </div>
    )
}
