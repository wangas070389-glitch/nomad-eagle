"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"
import { getBudgetProgress } from "@/server/actions/budget"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BudgetProgress() {
    const [data, setData] = useState<any[]>([])
    const [currentDate, setCurrentDate] = useState(new Date())

    useEffect(() => {
        getBudgetProgress(currentDate).then(setData)
    }, [currentDate])

    const nextMonth = () => {
        const next = new Date(currentDate)
        next.setMonth(next.getMonth() + 1)
        setCurrentDate(next)
    }

    const prevMonth = () => {
        const prev = new Date(currentDate)
        prev.setMonth(prev.getMonth() - 1)
        setCurrentDate(prev)
    }

    const isCurrentMonth = new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear()

    if (data.length === 0) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={prevMonth} className="h-6 w-6">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-xs font-medium w-20 text-center">
                            {currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                        <Button variant="ghost" size="icon" onClick={nextMonth} disabled={isCurrentMonth} className="h-6 w-6">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground mt-4">No budget limits set for this month.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold tracking-tight">Active Budgets</CardTitle>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={prevMonth} className="h-6 w-6">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium w-24 text-center">
                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <Button variant="ghost" size="icon" onClick={nextMonth} disabled={isCurrentMonth} className="h-6 w-6">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 mt-4">
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
