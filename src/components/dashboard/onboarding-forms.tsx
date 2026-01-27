"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createHousehold, joinHousehold } from "@/server/actions/household"
import { useActionState } from "react" // React 19 hook

export function OnboardingForms() {
    const [createState, createAction, isPendingCreate] = useActionState(createHousehold, null)
    const [joinState, joinAction, isPendingJoin] = useActionState(joinHousehold, null)

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Create Household</CardTitle>
                    <CardDescription>Start fresh for you and your partner.</CardDescription>
                </CardHeader>
                <form action={createAction}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Household Name</Label>
                            <Input name="name" placeholder="The Millers" required />
                        </div>
                        {createState?.error && <p className="text-red-500 text-sm">{createState.error}</p>}
                        <Button type="submit" className="w-full" disabled={isPendingCreate}>
                            {isPendingCreate ? "Creating..." : "Create New"}
                        </Button>
                    </CardContent>
                </form>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Join Household</CardTitle>
                    <CardDescription>Enter an ID from your partner.</CardDescription>
                </CardHeader>
                <form action={joinAction}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Household ID</Label>
                            <Input name="householdId" placeholder="clr..." required />
                        </div>
                        {joinState?.error && <p className="text-red-500 text-sm">{joinState.error}</p>}
                        <Button type="submit" className="w-full" disabled={isPendingJoin}>
                            {isPendingJoin ? "Joining..." : "Join Existing"}
                        </Button>
                    </CardContent>
                </form>
            </Card>
        </div>
    )
}
