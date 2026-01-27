"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getDetailedCashFlow, DetailedCashFlow } from "@/server/actions/cashflow"
import { useEffect, useState } from "react"
import { Loader2, Download, Maximize2, Minimize2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { generateCashFlowCSV } from "@/lib/export"

export function CashFlowTable() {
    const [data, setData] = useState<DetailedCashFlow | null>(null)
    const [isFullScreen, setIsFullScreen] = useState(false)

    useEffect(() => {
        getDetailedCashFlow().then(res => {
            if ("error" in res) return
            setData(res)
        })
    }, [])

    if (!data) return (
        <div className="flex justify-center items-center h-[300px] border rounded-lg bg-slate-50">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )

    const formatMoney = (val: number) => {
        if (val === 0) return "-"
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(val)
    }

    const handleDownload = () => {
        const csv = generateCashFlowCSV(data)
        const blob = new Blob([csv], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "CashFlow_Projection.csv"
        a.click()
        window.URL.revokeObjectURL(url)
    }

    const containerClass = isFullScreen
        ? "fixed inset-0 z-50 bg-slate-50 p-6 overflow-auto"
        : ""

    return (
        <div className={containerClass}>
            <Card className={isFullScreen ? "h-full shadow-none border-0" : ""}>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Cash Flow Spreadsheet</CardTitle>
                        <CardDescription>Detailed month-by-month breakdown of your financial future.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleDownload}>
                            <Download className="mr-2 h-4 w-4" /> Export CSV
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setIsFullScreen(!isFullScreen)}>
                            {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </Button>
                        {isFullScreen && (
                            <Button variant="ghost" size="icon" onClick={() => setIsFullScreen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className={isFullScreen ? "h-[calc(100vh-100px)] overflow-auto" : ""}>
                    <div className="rounded-md border overflow-x-auto relative">
                        <Table className="min-w-[1000px] border-collapse">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[200px] font-bold sticky left-0 bg-slate-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Category</TableHead>
                                    {data.headers.map(h => (
                                        <TableHead key={h} className="text-right min-w-[100px]">{h}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {/* INFLOWS */}
                                <TableRow className="bg-slate-50 hover:bg-slate-50">
                                    <TableCell colSpan={13} className="font-semibold text-emerald-600 pt-4 sticky left-0 bg-slate-50 z-10">Inflows</TableCell>
                                </TableRow>
                                {data.inflows.map((row) => (
                                    <TableRow key={row.name}>
                                        <TableCell className="font-medium sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">{row.name}</TableCell>
                                        {row.values.map((v, i) => (
                                            <TableCell key={i} className="text-right border-l border-slate-100">{formatMoney(v)}</TableCell>
                                        ))}
                                    </TableRow>
                                ))}

                                {/* OUTFLOWS */}
                                <TableRow className="bg-slate-50 hover:bg-slate-50">
                                    <TableCell colSpan={13} className="font-semibold text-red-600 pt-4 sticky left-0 bg-slate-50 z-10">Outflows</TableCell>
                                </TableRow>
                                {data.outflows.map((row) => (
                                    <TableRow key={row.name}>
                                        <TableCell className="font-medium sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">{row.name}</TableCell>
                                        {row.values.map((v, i) => (
                                            <TableCell key={i} className="text-right border-l border-slate-100">{formatMoney(v)}</TableCell>
                                        ))}
                                    </TableRow>
                                ))}

                                {/* SUMMARY */}
                                <TableRow className="bg-slate-100 hover:bg-slate-100 border-t-2 border-slate-200">
                                    <TableCell className="font-bold sticky left-0 bg-slate-100 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Total Income</TableCell>
                                    {data.summary.totalIncome.map((v, i) => (
                                        <TableCell key={i} className="text-right font-medium text-emerald-600">{formatMoney(v)}</TableCell>
                                    ))}
                                </TableRow>
                                <TableRow className="bg-slate-100 hover:bg-slate-100">
                                    <TableCell className="font-bold sticky left-0 bg-slate-100 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Total Expenses</TableCell>
                                    {data.summary.totalExpense.map((v, i) => (
                                        <TableCell key={i} className="text-right font-medium text-red-600">{formatMoney(v)}</TableCell>
                                    ))}
                                </TableRow>
                                <TableRow className="bg-slate-200 hover:bg-slate-200 border-t-2 border-slate-400">
                                    <TableCell className="font-bold text-base sticky left-0 bg-slate-200 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Net Flow</TableCell>
                                    {data.summary.netFlow.map((v, i) => (
                                        <TableCell key={i} className={`text-right font-bold ${v >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                                            {formatMoney(v)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                                <TableRow className="bg-indigo-50 hover:bg-indigo-50 border-t-2 border-indigo-200">
                                    <TableCell className="font-bold text-base text-indigo-900 sticky left-0 bg-indigo-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Projected Balance</TableCell>
                                    {data.summary.endingBalance.map((v, i) => (
                                        <TableCell key={i} className="text-right font-bold text-indigo-700">
                                            {formatMoney(v)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
