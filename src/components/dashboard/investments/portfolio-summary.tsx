"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { refreshPortfolioValues } from "@/server/actions/investments"
import { RefreshCw, TrendingUp } from "lucide-react"
import { useTransition, useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { EditInvestmentDialog } from "@/components/dashboard/edit-investment-dialog"
import { CapitalizeInvestmentDialog } from "./capitalize-investment-dialog"
import { DeleteInvestmentDialog } from "./delete-investment-dialog"

import { SafeAccount, InvestmentPositionWithValue } from "@/lib/types"

export function PortfolioSummary({
    summary,
    accounts
}: {
    summary: {
        totalValueMXN: number,
        positions: InvestmentPositionWithValue[],
        exchangeRate: number
    },
    accounts: SafeAccount[]
}) {
    const [isPending, startTransition] = useTransition()

    const handleRefresh = () => {
        startTransition(async () => {
            await refreshPortfolioValues()
        })
    }

    // Group positions by Asset Class
    const byClass = summary.positions.reduce((groups, pos) => {
        const cls = pos.assetClass
        if (!groups[cls]) groups[cls] = 0

        let val = pos.totalValue
        if (pos.currency === "USD") val = val * summary.exchangeRate

        groups[cls] += val
        return groups
    }, {} as Record<string, number>)

    const chartData = Object.entries(byClass).map(([name, value]) => ({
        name: name.replace('_', ' '),
        value
    }))

    // Colors for Asset Classes
    const COLORS: Record<string, string> = {
        EQUITY: '#3b82f6', // blue-500
        CRYPTO: '#f97316', // orange-500
        FIXED_INCOME: '#10b981', // emerald-500
        REAL_ESTATE: '#8b5cf6', // violet-500
        PENSION: '#6366f1', // indigo-500
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold tracking-tight">Investment Portfolio</h3>
                <Button
                    onClick={handleRefresh}
                    disabled={isPending}
                    className="bg-transparent text-primary hover:bg-primary/10 h-8 px-3 text-xs shadow-none border border-transparent hover:border-primary/20"
                >
                    <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`} />
                    {isPending ? 'Syncing...' : 'Sync'}
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Total Value Card with Gradient */}
                <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 border-none text-white shadow-lg overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <TrendingUp className="h-24 w-24" />
                    </div>
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-indigo-100">Net Investments</CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(summary.totalValueMXN)}
                            <span className="text-sm font-normal text-indigo-200 ml-1">MXN</span>
                        </div>
                        <p className="text-xs text-indigo-200 mt-1 opacity-80">
                            ≈ {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(summary.totalValueMXN / (summary.exchangeRate || 1))} USD
                        </p>
                    </CardContent>
                </Card>

                {/* Allocation Chart */}
                <Card className="flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Allocation</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex items-center justify-between">
                        <div className="h-[100px] w-[100px]">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            innerRadius={30}
                                            outerRadius={45}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => {
                                                // map display name back to key for color lookup
                                                const key = entry.name.replace(' ', '_') as string
                                                return <Cell key={`cell-${index}`} fill={COLORS[key] || '#94a3b8'} stroke="none" />
                                            })}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number | undefined) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value || 0)}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full w-full rounded-full border-4 border-muted flex items-center justify-center text-[10px] text-muted-foreground">Empty</div>
                            )}
                        </div>
                        <div className="flex-1 space-y-1 pl-4">
                            {summary.positions.length === 0 && <p className="text-xs text-muted-foreground">Add positions to see breakdown.</p>}
                            {Object.entries(byClass).map(([cls, val]) => (
                                <div key={cls} className="flex justify-between text-xs items-center">
                                    <span className="capitalize flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[cls] }}></span>
                                        {cls.replace('_', ' ').toLowerCase()}
                                    </span>
                                    <span className="font-medium text-muted-foreground">
                                        {((val as number) / (summary.totalValueMXN || 1) * 100).toFixed(0)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Positions</h4>
                {summary.positions.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed rounded-xl bg-muted/50">
                        <p className="text-sm text-muted-foreground">No active positions.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {summary.positions.map((pos) => (
                            <div key={pos.id} className="group p-3 rounded-lg bg-card hover:bg-accent/50 border transition-all flex justify-between items-center shadow-sm hover:shadow-md">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`w-10 h-10 flex-none rounded-full flex items-center justify-center text-lg font-bold
                                ${pos.assetClass === 'EQUITY' ? 'bg-blue-100 text-blue-600' :
                                            pos.assetClass === 'CRYPTO' ? 'bg-orange-100 text-orange-600' :
                                                'bg-slate-100 text-slate-600'}
                           `}>
                                        {pos.ticker ? pos.ticker[0] : pos.name[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-semibold text-sm flex items-center gap-2 truncate">
                                            {pos.name}
                                            {pos.ticker && <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono">{pos.ticker}</span>}
                                        </div>
                                        <div className="text-xs text-muted-foreground truncate">
                                            {Number(pos.quantity)} units • {new Intl.NumberFormat('en-US', { style: 'currency', currency: pos.currency }).format(pos.currentPrice)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 flex-none">
                                    <div className="text-right">
                                        <div className="font-bold text-sm">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: pos.currency }).format(pos.totalValue)}
                                        </div>
                                        <div className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wide">
                                            {pos.assetClass.replace('_', ' ')}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <CapitalizeInvestmentDialog position={pos} accounts={accounts} />
                                        <EditInvestmentDialog position={pos} />
                                        <DeleteInvestmentDialog investmentId={pos.id} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
