"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WealthEngine, Strategy, SimulationResult } from "@/lib/wealth-engine"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useState, useEffect, useMemo } from "react"
import { Plus, Trash2, TrendingUp, ShieldAlert } from "lucide-react"

interface WealthSimulatorProps {
    initialNetWorth: number
    initialMonthlyFlow: number
}

const PRESETS: Partial<Strategy>[] = [
    { name: "S&P 500", returnMean: 0.10, returnVol: 0.16 }, // Historical ~10%, Vol 16%
    { name: "CETES / Bonds", returnMean: 0.11, returnVol: 0.01 }, // Mexico rates ~11%
    { name: "High Yield Savings", returnMean: 0.045, returnVol: 0.005 },
    { name: "Crypto", returnMean: 0.50, returnVol: 0.80 }, // Wild
]

export function WealthSimulator({ initialNetWorth, initialMonthlyFlow }: WealthSimulatorProps) {
    const [strategies, setStrategies] = useState<Strategy[]>([
        {
            id: '1',
            name: 'Core Portfolio',
            balance: initialNetWorth,
            monthlyContribution: initialMonthlyFlow,
            returnMean: 0.07,
            returnVol: 0.15
        }
    ])

    const [duration, setDuration] = useState(12) // Default 1 Year (Realism)
    const [results, setResults] = useState<SimulationResult[]>([])
    const [freedomDate, setFreedomDate] = useState<string | null>(null)
    const [monthlyExpenses, setMonthlyExpenses] = useState(30000) // Default estimate

    // Financial Independence Number = Monthly Exp * 12 * 25 (4% Rule)
    const fiNumber = monthlyExpenses * 12 * 25

    useEffect(() => {
        const handler = setTimeout(() => {
            const engine = new WealthEngine(strategies)
            const simResults = engine.runSimulation(duration)
            setResults(simResults)
            const date = WealthEngine.findFreedomDate(simResults, fiNumber)
            setFreedomDate(date)
        }, 300) // 300ms Debounce to prevent lag on keystrokes

        return () => clearTimeout(handler)
    }, [strategies, duration, monthlyExpenses, fiNumber])

    const totalContribution = strategies.reduce((sum, s) => sum + s.monthlyContribution, 0)
    const blendedReturn = strategies.reduce((sum, s) => sum + (s.returnMean * s.balance), 0) / Math.max(1, strategies.reduce((s, x) => s + x.balance, 0))

    const addStrategy = (preset?: Partial<Strategy>) => {
        const newStrat: Strategy = {
            id: Math.random().toString(36),
            name: preset?.name || "New Strategy",
            balance: 0,
            monthlyContribution: 0,
            returnMean: preset?.returnMean || 0.07,
            returnVol: preset?.returnVol || 0.15
        }
        setStrategies([...strategies, newStrat])
    }

    const updateStrategy = (id: string, field: keyof Strategy, value: any) => {
        setStrategies(strategies.map(s => s.id === id ? { ...s, [field]: value } : s))
    }

    const removeStrategy = (id: string) => {
        setStrategies(strategies.filter(s => s.id !== id))
    }

    const formatMoney = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: "compact", maximumFractionDigits: 1 }).format(val)

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Area */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Wealth Projection (Monte Carlo)</CardTitle>
                            <CardDescription>
                                Projected Net Worth over {duration / 12} years based on {strategies.length} strategies.
                            </CardDescription>
                        </div>
                        {freedomDate && (
                            <Badge variant="default" className="text-lg bg-indigo-600 hover:bg-indigo-700">
                                🚀 FI Date: {freedomDate}
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={results} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorP90" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorP10" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="year" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis
                                    tickFormatter={formatMoney}
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    domain={[0, 'auto']}
                                />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <Tooltip
                                    formatter={(value: number | undefined) => value ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value) : '$0'}
                                    labelFormatter={(label) => `Year: ${label}`}
                                />
                                <ReferenceLine y={fiNumber} label="FI Target" stroke="red" strokeDasharray="3 3" />

                                {/* Cone of Uncertainty */}
                                <Area type="monotone" dataKey="p90" stroke="#82ca9d" fillOpacity={1} fill="url(#colorP90)" name="Optimistic (90th)" />
                                <Area type="monotone" dataKey="deterministic" stroke="#000" strokeWidth={2} fill="none" name="Median" />
                                <Area type="monotone" dataKey="p10" stroke="#8884d8" fillOpacity={1} fill="url(#colorP10)" name="Pessimistic (10th)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Controls Area */}
            <Card>
                <CardHeader>
                    <CardTitle>Strategy Engine</CardTitle>
                    <CardDescription>Configure your portofolio buckets.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Global Settings */}
                    <div className="space-y-4 pb-4 border-b">
                        <div className="space-y-2">
                            <Label>Projection Horizon (Realism Check)</Label>
                            <Tabs value={String(duration)} onValueChange={(v) => setDuration(Number(v))} className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="12">1 Year</TabsTrigger>
                                    <TabsTrigger value="36">3 Years</TabsTrigger>
                                    <TabsTrigger value="60">5 Years</TabsTrigger>
                                </TabsList>
                            </Tabs>
                            <p className="text-[10px] text-muted-foreground">
                                *Restricted to 5 years maximum to prevent speculative dreaming.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Monthly Expenses (Target)</span>
                                <span className="font-mono">{formatMoney(monthlyExpenses)}</span>
                            </div>
                            <Slider
                                value={[monthlyExpenses]}
                                onValueChange={(v) => setMonthlyExpenses(v[0])}
                                max={100000}
                                step={1000}
                            />
                        </div>
                    </div>

                    {/* Strategies List */}
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        {strategies.map((strat, idx) => (
                            <div key={strat.id} className="p-3 border rounded-lg space-y-3 bg-slate-50">
                                <div className="flex justify-between items-center">
                                    <Input
                                        value={strat.name}
                                        onChange={(e) => updateStrategy(strat.id, 'name', e.target.value)}
                                        className="h-7 w-32 font-medium"
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => removeStrategy(strat.id)} className="h-6 w-6 text-red-500">
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <Label className="text-[10px] text-muted-foreground">Balance</Label>
                                        <Input
                                            type="number"
                                            value={strat.balance}
                                            onChange={(e) => updateStrategy(strat.id, 'balance', Number(e.target.value))}
                                            className="h-7 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-[10px] text-muted-foreground">Monthly add</Label>
                                        <Input
                                            type="number"
                                            value={strat.monthlyContribution}
                                            onChange={(e) => updateStrategy(strat.id, 'monthlyContribution', Number(e.target.value))}
                                            className="h-7 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-[10px] text-muted-foreground">Return %</Label>
                                        <Input
                                            type="number"
                                            value={(strat.returnMean * 100).toFixed(1)}
                                            onChange={(e) => {
                                                const val = Math.min(100, Math.max(-100, Number(e.target.value)))
                                                updateStrategy(strat.id, 'returnMean', val / 100)
                                            }}
                                            className="h-7 text-xs"
                                            step={0.1}
                                            min={-100}
                                            max={100}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-[10px] text-muted-foreground">Volatility %</Label>
                                        <Input
                                            type="number"
                                            value={(strat.returnVol * 100).toFixed(1)}
                                            onChange={(e) => {
                                                const val = Math.min(100, Math.max(0, Number(e.target.value)))
                                                updateStrategy(strat.id, 'returnVol', val / 100)
                                            }}
                                            className="h-7 text-xs"
                                            step={0.1}
                                            min={0}
                                            max={100}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button onClick={() => addStrategy()} size="sm" variant="outline" className="text-xs">
                            <Plus className="h-3 w-3 mr-1" /> Custom
                        </Button>
                        {PRESETS.map(p => (
                            <Button key={p.name} onClick={() => addStrategy(p)} size="sm" variant="ghost" className="text-xs">
                                + {p.name}
                            </Button>
                        ))}
                    </div>

                    <div className="pt-4 border-t">
                        <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-md border border-amber-200 text-amber-800">
                            <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
                            <div className="text-xs">
                                <span className="font-semibold block mb-1">Educational Use Only</span>
                                This simulation is a mathematical projection, not financial advice. Real returns vary.
                                "Real Return" means interest *after* inflation (e.g., 7% Real ≈ 10% Nominal).
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
