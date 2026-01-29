import { getTrips, createTrip } from "@/server/actions/trips"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function TripsPage() {
    const trips = await getTrips()

    return (
        <div className="space-y-6 max-w-5xl mx-auto p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Trip Planner</h2>
                    <p className="text-muted-foreground">Manage your vacations and split expenses.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {/* Create New Trip Card */}
                <Card className="border-dashed flex flex-col items-center justify-center p-6 space-y-4 hover:bg-slate-50 transition-colors">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <Plus className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                        <h3 className="font-semibold">Plan a New Trip</h3>
                        <p className="text-sm text-muted-foreground">Start a budget & invite friends</p>
                    </div>
                    <form action={async (formData) => {
                        "use server"
                        await createTrip(formData)
                    }} className="w-full space-y-2">
                        <Input name="name" placeholder="E.g. Cancun 2026" required />
                        <Input name="budget" type="number" placeholder="Budget Limit" />
                        <Button className="w-full">Create Trip</Button>
                    </form>
                </Card>

                {/* Existing Trips */}
                {trips.map((trip) => (
                    <Link key={trip.id} href={`/trips/${trip.id}`}>
                        <Card className="h-full hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden">
                            {trip.status === "ACTIVE" && (
                                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs px-2 py-1 rounded-bl">Active</div>
                            )}
                            <CardHeader className="pb-2">
                                <CardTitle>{trip.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Budget</span>
                                        <span className="font-medium">
                                            {trip.budgetLimit ? `$${Number(trip.budgetLimit).toLocaleString()}` : "No Limit"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Spent</span>
                                        <span className={`font-medium ${trip.spent > (Number(trip.budgetLimit) || Infinity) ? "text-red-600" : ""}`}>
                                            ${trip.spent.toLocaleString()}
                                        </span>
                                    </div>
                                    {trip.budgetLimit && (
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${trip.spent > Number(trip.budgetLimit) ? "bg-red-500" : "bg-blue-500"}`}
                                                style={{ width: `${Math.min((trip.spent / Number(trip.budgetLimit)) * 100, 100)}%` }}
                                            />
                                        </div>
                                    )}
                                    <div className="pt-4 flex -space-x-2">
                                        {trip.members.map((m) => (
                                            <div key={m.id} className="h-8 w-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600" title={m.user.name || "User"}>
                                                {m.user.name?.[0] || "U"}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
