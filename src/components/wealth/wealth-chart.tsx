"use client"

import React, { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { calculateProjection } from "@/server/core/growth-engine"
import { saveScenario } from "@/server/actions/scenario"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Loader2, Save, TrendingUp } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function WealthSimulationChart() {
    // 1. STATE (The Inputs)
    const [principal, setPrincipal] = useState(10000)
    const [monthly, setMonthly] = useState(500)
    const [apy, setApy] = useState(0.08)
    const [years, setYears] = useState(20)
    const [isCompound, setIsCompound] = useState(true)
    const [name, setName] = useState("My Freedom Plan")
    const [isSaving, setIsSaving] = useState(false)
    const { toast } = useToast()

    // 2. EDGE CORE (Zero Latency Calculation)
    const data = useMemo(() => {
        return calculateProjection({
            principal,
            monthlyContribution: monthly,
            apy,
            years,
            isCompound
        })
    }, [principal, monthly, apy, years, isCompound])

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(val)
    }

    // 3. ACTIONS
    const handleSave = async () => {
        setIsSaving(true)
        try {
            await saveScenario({
                name,
                principal,
                monthlyContribution: monthly,
                apy,
                years,
                isCompound
            })
            toast({ title: "Scenario Saved", description: "Your wealth plan is secure." })
        } catch (e) {
            toast({ title: "Error", description: "Failed to save scenario.", variant: "destructive" })
        } finally {
            setIsSaving(false)
        }
    }

    const finalAmount = data[data.length - 1]?.balance || 0

    // Memoize slider values to prevent Radix primitive loops
    const principalValue = useMemo(() => [principal], [principal])
    const monthlyValue = useMemo(() => [monthly], [monthly])
    const apyValue = useMemo(() => [apy], [apy])
    const yearsValue = useMemo(() => [years], [years])

    const tooltipFormatter = (val: any) => [formatCurrency(Number(val)), "Amount"]

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* INPUT PANEL */}
            <Card className="lg:col-span-1 border-stone-200 dark:border-stone-800 shadow-xl bg-white/50 dark:bg-black/50 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-500" />
                        Variables
                    </CardTitle>
                    <CardDescription>Adjust your trajectory</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Scenario Name</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <Label>Initial Principal</Label>
                            <span className="font-mono text-stone-500">{formatCurrency(principal)}</span>
                        </div>
                        <Slider
                            value={principalValue}
                            min={0} max={1000000} step={1000}
                            onValueChange={(v: number[]) => setPrincipal(v[0])}
                            className="cursor-pointer"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <Label>Monthly Contribution</Label>
                            <span className="font-mono text-stone-500">{formatCurrency(monthly)}</span>
                        </div>
                        <Slider
                            value={monthlyValue}
                            min={0} max={20000} step={100}
                            onValueChange={(v: number[]) => setMonthly(v[0])}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <Label>Annual Return (APY)</Label>
                            <span className="font-mono text-stone-500">{(apy * 100).toFixed(1)}%</span>
                        </div>
                        <Slider
                            value={apyValue}
                            min={0} max={0.20} step={0.001}
                            onValueChange={(v: number[]) => setApy(v[0])}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <Label>Time Horizon</Label>
                            <span className="font-mono text-stone-500">{years} Years</span>
                        </div>
                        <Slider
                            value={yearsValue}
                            min={1} max={50} step={1}
                            onValueChange={(v: number[]) => setYears(v[0])}
                        />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-800">
                        <div className="space-y-0.5">
                            <Label className="text-base">Compound Interest</Label>
                            <p className="text-xs text-stone-500">Enable Einstein's 8th wonder</p>
                        </div>
                        <Switch checked={isCompound} onCheckedChange={setIsCompound} />
                    </div>

                    <Button onClick={handleSave} disabled={isSaving} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Scenario
                    </Button>
                </CardContent>
            </Card>

            {/* CHART PANEL */}
            <Card className="lg:col-span-2 border-stone-200 dark:border-stone-800 shadow-2xl bg-gradient-to-br from-white to-stone-50 dark:from-stone-900 dark:to-black">
                <CardHeader>
                    <CardTitle>Wealth Projection</CardTitle>
                    <CardDescription>
                        Projected Total: <span className="text-2xl font-bold text-indigo-600 ml-2">{formatCurrency(finalAmount)}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] lg:h-[500px] w-full pl-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="year"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#a8a29e', fontSize: 12 }}
                            />
                            <YAxis
                                hide
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(8px)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                                formatter={tooltipFormatter}
                                labelFormatter={(label) => `Year ${label}`}
                            />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />

                            {/* NARCISO: Smooth interpolation and animation */}
                            <Area
                                type="monotone" // Smooth curve
                                dataKey="balance"
                                stroke="#4f46e5"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorBalance)"
                                animationDuration={800} // Custom physics feel
                                animationEasing="ease-in-out"
                                isAnimationActive={true}
                            />
                            <Area
                                type="monotone"
                                dataKey="totalInvested"
                                stroke="#a8a29e"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                fill="transparent"
                                animationDuration={800}
                                isAnimationActive={true}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
