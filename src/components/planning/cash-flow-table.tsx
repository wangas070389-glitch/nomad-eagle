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
import { getDetailedCashFlow, DetailedCashFlow, ReconciliationCell } from "@/server/actions/cashflow"
import { useEffect, useState } from "react"
import { Loader2, Download, Maximize2, Minimize2, X, AlertCircle, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { generateCashFlowCSV } from "@/lib/export"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { QuickReconciliationDialog } from "./quick-reconciliation-dialog"

export function CashFlowTable() {
    const [data, setData] = useState<DetailedCashFlow | null>(null)
    const [isFullScreen, setIsFullScreen] = useState(false)
    const [reconciliationContext, setReconciliationContext] = useState<{
        isOpen: boolean
        data: {
          plannedItemId: string
          name: string
          plannedAmount: number
          type: 'BUDGET_LIMIT' | 'RECURRING_FLOW'
        } | null
    }>({ isOpen: false, data: null })

    useEffect(() => {
        getDetailedCashFlow().then(res => {
            if ("error" in res) return
            setData(res)
        })
    }, [])

    const handleRebuild = () => {
      getDetailedCashFlow().then(res => {
          if ("error" in res) return
          setData(res)
      })
    }

    if (!data) return (
        <div className="flex justify-center items-center h-[300px] border rounded-lg bg-slate-50">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )

    const formatMoney = (val: number) => {
        if (val === 0) return "-"
        return new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'MXN', 
            maximumFractionDigits: 0 
        }).format(val)
    }

    const renderCell = (v: number | ReconciliationCell, isTotal: boolean, isTarget: boolean, name: string, id?: string, reconciliationType?: 'BUDGET_LIMIT' | 'RECURRING_FLOW') => {
        if (typeof v === 'number') {
            return (
                <span className={isTotal ? "font-semibold text-slate-900" : isTarget ? "italic text-slate-600" : "text-slate-600"}>
                    {formatMoney(v)}
                </span>
            )
        }

        // --- Relational Engine: Triple View Rendering ---
        const utilization = v.planned > 0 ? (v.actual / v.planned) * 100 : 0
        const isOver = v.actual > v.planned

        return (
            <div 
                className="flex flex-col gap-1 text-[11px] py-1 cursor-pointer group/cell relative"
                onClick={() => id && setReconciliationContext({
                    isOpen: true,
                    data: {
                        plannedItemId: id,
                        name: name,
                        plannedAmount: v.planned,
                        type: reconciliationType || 'RECURRING_FLOW'
                    }
                })}
            >
                <div className="flex justify-between items-center text-slate-500">
                    <span className="font-medium">Planned</span>
                    <span>{formatMoney(v.planned)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Actual</span>
                    <span className={`font-semibold ${isOver ? "text-red-600" : "text-emerald-600"}`}>
                        {formatMoney(v.actual)}
                    </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                    <span className="text-slate-900 font-bold">Runway</span>
                    <span className={`font-bold ${v.remaining < 0 ? "text-red-600" : "text-indigo-600"}`}>
                        {formatMoney(v.remaining)}
                    </span>
                </div>
                
                {/* Hover Action Indicator */}
                <div className="absolute inset-0 bg-indigo-50/0 group-hover/cell:bg-indigo-50/20 rounded-sm transition-colors" />

                {isOver && (
                    <div className="absolute top-1 right-1">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <AlertCircle className="h-3 w-3 text-red-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                     Boundary Violation: {utilization.toFixed(0)}% utilization.
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                )}
            </div>
        )
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
                        <CardTitle className="text-xl font-bold tracking-tight text-slate-900">
                            Cash Flow Spreadsheet
                        </CardTitle>
                        <CardDescription>
                            Relational Pulse Engine | Click cells to reconcile allocations in-place.
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleDownload} className="font-semibold h-9">
                            <Download className="mr-2 h-4 w-4" /> Export CSV
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setIsFullScreen(!isFullScreen)} className="h-9 w-9">
                            {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </Button>
                        {isFullScreen && (
                            <Button variant="ghost" size="icon" onClick={() => setIsFullScreen(false)} className="h-9 w-9">
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className={isFullScreen ? "h-[calc(100vh-100px)] overflow-auto p-0" : "p-0"}>
                    <div className="border-y overflow-x-auto relative scrollbar-thin scrollbar-thumb-slate-200">
                        <Table className="min-w-[1200px] border-collapse text-xs">
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-t-0">
                                    <TableHead className="w-[200px] font-semibold sticky left-0 bg-white z-30 border-r">
                                        Entity / Planned Boundary
                                    </TableHead>
                                    {data.headers.map((h, i) => (
                                        <TableHead key={h} className={`text-right min-w-[130px] font-semibold text-xs text-slate-500 py-4 ${i === 0 ? "bg-slate-50 font-bold text-indigo-600" : ""}`}>
                                            {h} {i === 0 && "(Current Cycle)"}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {/* INFLOWS */}
                                <TableRow className="bg-slate-100/50 hover:bg-slate-100/50 border-t border-slate-200">
                                    <TableCell colSpan={data.headers.length + 1} className="font-bold text-[10px] uppercase tracking-widest text-emerald-700 py-3 px-4 sticky left-0 bg-slate-100/50 z-10 backdrop-blur">
                                        Sovereign Inflows
                                    </TableCell>
                                </TableRow>
                                {data.inflows.map((row) => {
                                    const isTotal = row.name.startsWith("Total")
                                    return (
                                        <TableRow key={row.name} className="hover:bg-slate-50 transition-colors">
                                            <TableCell className={`font-medium sticky left-0 z-20 shadow-[1px_0_2px_rgba(0,0,0,0.05)] border-r ${isTotal ? "bg-emerald-50/50 font-semibold" : "bg-white"}`}>
                                                {row.name}
                                            </TableCell>
                                            {row.values.map((v, i) => (
                                                <TableCell key={i} className={`text-right border-l border-slate-100 relative ${isTotal ? "font-semibold" : ""} ${i === 0 ? "bg-slate-50/30" : ""}`}>
                                                    {renderCell(v, isTotal, false, row.name, row.id, row.reconciliationType)}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    )
                                })}

                                {/* OUTFLOWS */}
                                <TableRow className="bg-slate-50 hover:bg-slate-50">
                                    <TableCell colSpan={data.headers.length + 1} className="font-semibold text-xs text-slate-500 py-2 px-4 sticky left-0 z-10">
                                        Outflows
                                    </TableCell>
                                </TableRow>
                                {data.outflows.map((row) => {
                                    const isTarget = row.name === "Target Budget Limits"
                                    const isTotal = row.name.startsWith("Total")
                                    return (
                                        <TableRow key={row.name} className="hover:bg-slate-50 transition-colors">
                                            <TableCell className={`font-medium sticky left-0 z-20 shadow-[1px_0_2px_rgba(0,0,0,0.05)] border-r ${isTarget ? "bg-amber-50/50" : isTotal ? "bg-red-50/50" : "bg-white"}`}>
                                                {row.name}
                                            </TableCell>
                                            {row.values.map((v, i) => (
                                                <TableCell key={i} className={`text-right border-l border-slate-100 relative ${i === 0 ? "bg-slate-50/30" : ""}`}>
                                                    {renderCell(v, isTotal, isTarget, row.name, row.id, row.reconciliationType)}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    )
                                })}

                                {/* STRATEGIC SUMMARY */}
                                <TableRow className="bg-slate-100/30">
                                    <TableCell className="font-semibold sticky left-0 bg-slate-100/30 z-20 border-r">Σ Total Income</TableCell>
                                    {data.summary.totalIncome.map((v, i) => (
                                        <TableCell key={i} className="text-right font-semibold text-emerald-600">{formatMoney(v)}</TableCell>
                                    ))}
                                </TableRow>
                                <TableRow className="bg-slate-100/30">
                                    <TableCell className="font-semibold sticky left-0 bg-slate-100/30 z-20 border-r">Σ Total Expenses</TableCell>
                                    {data.summary.totalExpense.map((v, i) => (
                                        <TableCell key={i} className="text-right font-semibold text-red-600">{formatMoney(v)}</TableCell>
                                    ))}
                                </TableRow>
                                <TableRow className="bg-slate-50 border-t-2">
                                    <TableCell className="font-bold text-slate-900 sticky left-0 bg-slate-50 z-20 border-r text-xs">Net Flow Projection</TableCell>
                                    {data.summary.netFlow.map((v, i) => (
                                        <TableCell key={i} className={`text-right font-bold ${v >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                            {formatMoney(v)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                                <TableRow className="bg-indigo-50/30 border-t-2 border-indigo-100">
                                    <TableCell className="font-bold text-indigo-900 sticky left-0 bg-indigo-50 z-20 border-r text-xs">Accumulated Cash Flow</TableCell>
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

            {reconciliationContext.isOpen && reconciliationContext.data && (
                <QuickReconciliationDialog 
                    isOpen={reconciliationContext.isOpen}
                    onClose={() => {
                      setReconciliationContext({ ...reconciliationContext, isOpen: false })
                      handleRebuild()
                    }}
                    context={reconciliationContext.data}
                />
            )}
        </div>
    )
}
