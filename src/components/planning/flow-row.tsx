"use client"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Trash2, TrendingUp, TrendingDown, Tag, Anchor } from "lucide-react"
import { EditFlowDialog } from "@/components/planning/edit-flow-dialog"
import { deleteRecurringFlow, toggleFlowActive } from "@/server/actions/planning"
import { useTransition, useOptimistic } from "react"
import { useRouter } from "next/navigation"

import { SafeRecurringFlow, Category, SafeBudgetLimit } from "@/lib/types"

interface FlowRowProps {
    flow: SafeRecurringFlow
    categories: Category[]
    limits: SafeBudgetLimit[]
}

export function FlowRow({ flow, categories, limits }: FlowRowProps) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const [optimisticActive, setOptimisticActive] = useOptimistic(
        flow.isActive,
        (state: boolean, newChecked: boolean) => newChecked
    )

    const handleToggle = (checked: boolean) => {
        startTransition(async () => {
            setOptimisticActive(checked)
            await toggleFlowActive(flow.id, checked)
        })
    }

    const isActive = optimisticActive
    const category = categories.find(c => c.id === flow.categoryId)
    const bucket = flow.bucket || "VARIABLE_ALLOCATION"
    const bucketLabels: Record<string, string> = {
        CAPITAL_INFLOW: "Inflow",
        FIXED_OBLIGATION: "Fixed",
        VARIABLE_ALLOCATION: "Variable"
    }

    return (
        <div key={flow.id} className={`flex items-center justify-between p-3 rounded-xl bg-white border shadow-sm hover:shadow-md transition-all ${!isActive ? "opacity-60 grayscale border-slate-200 bg-slate-50" : flow.type === 'INCOME' ? "border-emerald-100" : "border-red-100"}`}>
            <div className="flex items-center gap-3">
                <Switch
                    checked={isActive}
                    onCheckedChange={handleToggle}
                    disabled={isPending}
                    className="data-[state=checked]:bg-indigo-600"
                />
                <div className={`p-2 rounded-lg ${flow.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {flow.type === 'INCOME' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                </div>
                <div>
                    <div className={`font-semibold text-sm ${!isActive && "line-through text-slate-500"}`}>{flow.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                         <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{flow.frequency.toLowerCase()}</span>
                         <span className="flex items-center gap-1 text-[10px] bg-indigo-50 px-1.5 py-0.5 rounded text-indigo-600 font-medium border border-indigo-100">
                             <Tag className="h-2.5 w-2.5" />
                             {bucketLabels[bucket] || bucket}
                         </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <span className={`font-bold text-sm ${!isActive ? "text-slate-400" : flow.type === 'INCOME' ? "text-emerald-700" : "text-red-700"}`}>
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(Number(flow.amount))}
                </span>
                <div className="flex items-center border-l pl-2 border-slate-100">
                    <EditFlowDialog flow={flow} categories={categories} limits={limits} />
                    <form action={deleteRecurringFlow.bind(null, flow.id)}>
                        <Button className="h-8 w-8 text-muted-foreground hover:text-destructive bg-transparent hover:bg-slate-50 shadow-none p-2 opacity-50 hover:opacity-100">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
