import { WealthSimulationChart } from "@/components/wealth/wealth-chart"

export default function WealthPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Wealth Simulator</h2>
                <div className="flex items-center space-x-2">
                    {/* Future: Load Scenario Button */}
                </div>
            </div>

            <div className="grid gap-4">
                <WealthSimulationChart />
            </div>
        </div>
    )
}
