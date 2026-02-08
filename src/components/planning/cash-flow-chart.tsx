"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getDetailedCashFlow, DetailedCashFlow } from "@/server/actions/cashflow"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { ComposedChart, Bar, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export function CashFlowChart({ initialData, className }: { initialData?: DetailedCashFlow | null, className?: string }) {
    const [data, setData] = useState<DetailedCashFlow | null>(initialData || null)

    useEffect(() => {
        if (data) return // Don't fetch if we have data

        getDetailedCashFlow().then(res => {
            if ("error" in res) return
            setData(res)
        })
    }, [data])

    if (!data) return (
        <div className={`flex justify-center items-center border rounded-lg bg-slate-50 ${className || "h-[300px]"}`}>
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )

    // Transform Data for Recharts
    const chartData = data.headers.map((month, index) => ({
        name: month,
        balance: data.summary.endingBalance[index],
        net: data.summary.netFlow[index]
    }))

    const formatMoney = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MXN', notation: "compact", maximumFractionDigits: 1 }).format(val)

    return (
        <Card className="shadow-none border-0">
            <CardHeader>
                <CardTitle>Liquidity Projection (Accumulative)</CardTitle>
                <CardDescription>Projected cash balance based on your defined budget.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className={`w-full ${className || "h-[400px]"}`}>
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 10, right: 30, bottom: 0, left: 0 }}>
                            <defs>
                                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid stroke="#f5f5f5" vertical={false} />
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
                            <YAxis
                                tickFormatter={formatMoney}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                width={60} // Reserve space for labels
                            />
                            <Tooltip
                                formatter={(value: number | undefined) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MXN' }).format(value || 0)}
                                labelStyle={{ color: "#333" }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Legend verticalAlign="top" height={36} />
                            <Area type="monotone" dataKey="balance" name="Projected Balance" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
                            <Line type="monotone" dataKey="net" name="Monthly Net Flow" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
