import { joinTrip } from "@/server/actions/trip-invite"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params
    const session = await getServerSession(authOptions)

    // Check basic invite validity visually first
    const invite = await prisma.tripInvite.findUnique({
        where: { token },
        include: { trip: true }
    })

    if (!invite || invite.status !== "PENDING" || new Date() > invite.expiresAt) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="text-red-500">Invalid or Expired Invite</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>This invitation link is no longer valid. Please ask the trip owner for a new one.</p>
                        <Link href="/" className="block mt-4 text-center text-blue-600 hover:underline">
                            Go Home
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Card className="max-w-md w-full text-center">
                <CardHeader>
                    <CardTitle>You're invited to {invite.trip.name}!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="h-20 w-20 bg-blue-100 rounded-full mx-auto flex items-center justify-center text-3xl">
                        ✈️
                    </div>

                    {!session ? (
                        <div className="space-y-4">
                            <p className="text-muted-foreground">Please sign in or create an account to join this trip.</p>
                            <div className="flex gap-2 justify-center">
                                <Link href={`/sign-in?callbackUrl=/invite/${token}`}>
                                    <Button>Sign In</Button>
                                </Link>
                                <Link href={`/sign-in?callbackUrl=/invite/${token}`}>
                                    <Button variant="outline">Sign Up</Button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p>You are joining as <strong>{session.user.name || session.user.email}</strong>.</p>

                            <form action={async () => {
                                "use server"
                                const res = await joinTrip(token)
                                if (res.error) {
                                    // Handle error? For now redirect or similar
                                    throw new Error(res.error)
                                } else if (res.success && res.tripId) {
                                    redirect(`/trips/${res.tripId}`)
                                }
                            }}>
                                <Button size="lg" className="w-full">Join Trip Now</Button>
                            </form>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
