"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { simulateNetWorth } from "@/server/actions/simulation"
import { useEffect, useState } from "react"
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Maximize2, Minimize2, X } from "lucide-react"
import { Button } from "@/components/ui/button"

import { SimulationData } from "@/lib/types"

export function WealthSimulator() {
    const [simData, setSimData] = useState<SimulationData | null>(null)
    const [horizon, setHorizon] = useState<number>(60) // Default 5 Years
    const [isFullScreen, setIsFullScreen] = useState(false)

    useEffect(() => {
        simulateNetWorth(60, 0.08).then((res) => {
            if ('error' in res) {
                console.error(res.error)
            } else {
                setSimData(res)
            }
        })
    }, [])

    if (!simData) return <div className="h-[300px] w-full animate-pulse bg-muted rounded-xl" />

    const { data, summary } = simData

    // Slicing logic: +1 to include the starting "Today" point
    const visibleData = data.slice(0, horizon + 1)

    // Dynamic Stats Calculation
    const startValue = visibleData[0]?.actual || 0
    const endValue = visibleData[visibleData.length - 1]?.projected || 0
    const totalGrowth = endValue - startValue

    // Horizon Labels
    const horizonLabel = horizon === 12 ? "Next Year" : horizon === 36 ? "3 Years" : "5 Years"

    const containerInfo = isFullScreen
        ? "fixed inset-0 z-50 bg-background p-6 flex flex-col"
        : "col-span-full transition-all duration-300"

    return (
        <div className={containerInfo}>
            <Card className={`h-full flex flex-col ${isFullScreen ? "border-0 shadow-none rounded-none" : ""}`}>
                <CardHeader className="flex-none">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-lg font-semibold tracking-tight">Wealth Projection</CardTitle>
                            <div className="text-sm text-muted-foreground mt-1">
                                Total Growth by {horizonLabel}: <span className="font-bold text-emerald-600">+{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(totalGrowth)}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                                {[12, 36, 60].map((h) => (
                                    <button
                                        key={h}
                                        onClick={() => setHorizon(h)}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${horizon === h
                                            ? "bg-white text-indigo-600 shadow-sm"
                                            : "text-slate-500 hover:text-slate-700"
                                            }`}
                                    >
                                        {h === 12 ? '1Y' : h === 36 ? '3Y' : '5Y'}
                                    </button>
                                ))}
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsFullScreen(!isFullScreen)}>
                                {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                            </Button>
                            {isFullScreen && (
                                <Button variant="ghost" size="icon" onClick={() => setIsFullScreen(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 min-h-0">
                    <div className={`w-full ${isFullScreen ? "h-full" : "h-[300px]"}`}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                                data={visibleData}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                                <XAxis
                                    dataKey="date"
                                    fontSize={isFullScreen ? 14 : 12}
                                    tickLine={false}
                                    axisLine={false}
                                    minTickGap={isFullScreen ? 60 : 30}
                                />
                                <YAxis
                                    fontSize={isFullScreen ? 14 : 12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value / 1000}k`}
                                />
                                <Tooltip
                                    formatter={(value: number | undefined) => value ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value) : '-'}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    labelStyle={{ fontWeight: 'bold', color: '#333' }}
                                />
                                <Legend />
                                {/* Actual History (Solid) */}
                                <Line
                                    type="monotone"
                                    dataKey="actual"
                                    stroke="#2563eb"
                                    strokeWidth={isFullScreen ? 3 : 2}
                                    dot={{ r: isFullScreen ? 6 : 4 }}
                                    name="Current / Actual"
                                    connectNulls={true}
                                />
                                {/* Projections (Dashed) */}
                                <Line
                                    type="monotone"
                                    dataKey="projected"
                                    stroke="#6366f1"
                                    strokeWidth={isFullScreen ? 3 : 2}
                                    strokeDasharray="5 5"
                                    dot={false}
                                    name="Projected"
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
