"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"
import { getBudgetProgress } from "@/server/actions/budget"

export function BudgetProgress() {
    // In a real app, use React Query. For MVP, useEffect.
    const [data, setData] = useState<any[]>([])

    useEffect(() => {
        getBudgetProgress().then(setData)
    }, [])

    if (data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground">No budget limits set.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold tracking-tight">Active Budgets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {data.map((item) => (
                    <div key={item.categoryId} className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">{item.categoryName}</span>
                            <span className="text-muted-foreground">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MXN' }).format(item.spent)}
                                <span className="text-xs mx-1">/</span>
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MXN' }).format(item.limit)}
                            </span>
                        </div>
                        <Progress
                            value={Math.min(item.percent, 100)}
                            className={`h-2 ${item.status === 'danger' ? '[&>div]:bg-red-500' :
                                    item.status === 'warning' ? '[&>div]:bg-amber-500' :
                                        '[&>div]:bg-emerald-500'
                                }`}
                        />
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
