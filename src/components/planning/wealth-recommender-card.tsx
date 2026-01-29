"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { AreaChart, Area, ResponsiveContainer } from "recharts"

interface RecommendationProps {
    data: {
        surplus: number;
        projectedTotal: number;
        message: string;
        chartData: any[];
    }
}

export function WealthRecommendationCard({ data }: RecommendationProps) {
    const formattedTotal = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(data.projectedTotal)

    return (
        <Card className="border-indigo-100 bg-gradient-to-r from-indigo-50 to-white overflow-hidden relative group">
            <CardContent className="p-6 flex items-center justify-between relative z-10">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-1">
                        <Sparkles className="w-4 h-4" />
                        <span>Smart Insight</span>
                    </div>
                    <p className="text-slate-900 font-medium text-lg leading-tight w-full max-w-md">
                        {data.message}
                    </p>
                    <p className="text-sm text-slate-500">
                        Potential Wealth: <span className="font-bold text-indigo-700">{formattedTotal}</span>
                    </p>
                </div>

                <div className="flex items-center gap-6">
                    {/* Micro Chart (Ghost) */}
                    <div className="h-16 w-32 hidden md:block opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.chartData}>
                                <Area
                                    type="monotone"
                                    dataKey="balance"
                                    stroke="#4f46e5"
                                    fill="#e0e7ff"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <Button asChild className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200" size="lg">
                        <Link href={`/wealth?monthly=${data.surplus}`}>
                            Simulate Growth <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                    </Button>
                </div>
            </CardContent>

            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-indigo-100/50 to-transparent -skew-x-12 translate-x-32" />
        </Card>
    )
}
