"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getDetailedCashFlow, DetailedCashFlow } from "@/server/actions/cashflow"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { ComposedChart, Bar, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export function CashFlowChart({ initialData, className }: { initialData?: DetailedCashFlow | null, className?: string }) {
    const [data, setData] = useState<DetailedCashFlow | null>(initialData || null)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        if (data) return // Don't fetch if we have data

        getDetailedCashFlow().then(res => {
            if ("error" in res) return
            setData(res)
        })
    }, [data])

    if (!isMounted || !data) return (
        <div className={`flex justify-center items-center border rounded-xl bg-slate-50/50 border-dashed ${className || "h-[300px]"}`}>
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                <span className="text-xs text-slate-400 font-medium">Calibrating Solvency Projections...</span>
            </div>
        </div>
    )

    // Transform Data for Recharts
    const chartData = (data.headers || []).map((month, index) => ({
        name: month,
        balance: data.summary?.endingBalance?.[index] || 0,
        net: data.summary?.netFlow?.[index] || 0
    }))

    const formatMoney = (val: number) => new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'MXN', 
        notation: "compact", 
        maximumFractionDigits: 1 
    }).format(val)

    return (
        <Card className="shadow-none border-0 bg-transparent overflow-hidden">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg font-bold text-slate-900">Capital Horizon</CardTitle>
                <CardDescription className="text-xs">Deterministic liquidity projection across the capital horizon.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
                <div className={`w-full min-h-[150px] ${className || "h-[350px]"}`}>
                    <ResponsiveContainer width="100%" height="100%" minHeight={150}>
                        <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                            <defs>
                                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid stroke="#f1f5f9" vertical={false} strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="name" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false} 
                                minTickGap={20} 
                                stroke="#94a3b8"
                            />
                            <YAxis
                                tickFormatter={formatMoney}
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                stroke="#94a3b8"
                            />
                            <Tooltip
                                formatter={(value: number | undefined) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MXN' }).format(value || 0)}
                                labelStyle={{ color: "#1e293b", fontWeight: 600 }}
                                contentStyle={{ 
                                    borderRadius: '12px', 
                                    border: '1px solid #e2e8f0', 
                                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    backdropFilter: 'blur(4px)'
                                }}
                            />
                            <Legend 
                                verticalAlign="top" 
                                align="right"
                                iconType="circle"
                                wrapperStyle={{ fontSize: '10px', paddingTop: '0px', paddingBottom: '20px' }} 
                            />
                            <Area 
                                type="monotone" 
                                dataKey="balance" 
                                name="Projected Balance" 
                                stroke="#4f46e5" 
                                strokeWidth={2} 
                                fillOpacity={1} 
                                fill="url(#colorBalance)" 
                                animationDuration={1000}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="net" 
                                name="Monthly Net" 
                                stroke="#10b981" 
                                strokeWidth={2} 
                                dot={false} 
                                strokeDasharray="4 4" 
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
