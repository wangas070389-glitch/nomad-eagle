"use client"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Trash2, TrendingUp, TrendingDown } from "lucide-react"
import { EditFlowDialog } from "@/components/planning/edit-flow-dialog"
import { deleteRecurringFlow, toggleFlowActive } from "@/server/actions/planning"
import { useTransition, useOptimistic } from "react"
import { useRouter } from "next/navigation"

import { SafeRecurringFlow } from "@/lib/types"

export function FlowRow({ flow }: { flow: SafeRecurringFlow }) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter() // Consider removing if actions revalidatePath properly

    // Optimistic State: [currentStatus, newStatus]
    // The hook returns the optimistic state.
    const [optimisticActive, setOptimisticActive] = useOptimistic(
        flow.isActive,
        (state: boolean, newChecked: boolean) => newChecked
    )

    const handleToggle = (checked: boolean) => {
        startTransition(async () => {
            // 1. Immediately update UI via optimistic hook
            setOptimisticActive(checked)

            // 2. Perform actual server update
            await toggleFlowActive(flow.id, checked)
        })
    }

    // Derived UI state based on optimistic status
    const isActive = optimisticActive

    return (
        <div key={flow.id} className={`flex items-center justify-between p-2 rounded-lg bg-white border shadow-sm hover:shadow-md transition-all ${!isActive ? "opacity-60 grayscale border-slate-200 bg-slate-50" : flow.type === 'INCOME' ? "border-emerald-100" : "border-red-100"}`}>
            <div className="flex items-center gap-3">
                <Switch
                    checked={isActive}
                    onCheckedChange={handleToggle}
                    disabled={isPending}
                    className="data-[state=checked]:bg-indigo-600"
                />
                <div className={`p-2 rounded-full ${flow.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {flow.type === 'INCOME' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                </div>
                <div>
                    <div className={`font-medium text-sm ${!isActive && "line-through text-slate-500"}`}>{flow.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">{flow.frequency.toLowerCase()}</div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <span className={`font-bold text-sm ${!isActive ? "text-slate-400" : flow.type === 'INCOME' ? "text-emerald-700" : "text-red-700"}`}>
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MXN' }).format(Number(flow.amount))}
                </span>
                <EditFlowDialog flow={flow} />
                <form action={deleteRecurringFlow.bind(null, flow.id)}>
                    <Button className="h-8 w-8 text-muted-foreground hover:text-destructive bg-transparent hover:bg-slate-50 shadow-none p-2 opacity-50 hover:opacity-100">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    )
}
