import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { UpgradeModal } from "@/components/monetization/upgrade-modal"
import { prisma } from "@/lib/prisma"

export default async function PricingPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect("/sign-in")

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { tier: true }
    })

    const isPro = user?.tier === "PRO"

    return (
        <div className="py-12 space-y-12">
            <div className="text-center space-y-4 max-w-3xl mx-auto px-6">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Simple, transparent pricing</h1>
                <p className="text-xl text-muted-foreground">
                    Choose the plan that fits your journey.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto px-6">
                {/* Free Plan */}
                <Card className={`relative flex flex-col ${isPro ? "border-slate-200 opacity-60" : "border-violet-200 shadow-md"}`}>
                    <CardHeader>
                        <CardTitle className="text-2xl">Explorer</CardTitle>
                        <CardDescription>Perfect for solo travelers getting started.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-6">
                        <div className="text-3xl font-bold">$0<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                        <ul className="space-y-3">
                            <Feature text="1 Household" included />
                            <Feature text="Unlimited Transactions" included />
                            <Feature text="Basic Categories" included />
                            <Feature text="AI Wealth Forecasting" included={false} />
                            <Feature text="Investment Tracking" included={false} />
                        </ul>
                    </CardContent>
                    <CardFooter>
                        {isPro ? (
                            <Button variant="outline" className="w-full" disabled>Active Plan</Button>
                        ) : (
                            <Button className="w-full" variant="outline" disabled>Current Plan</Button>
                        )}
                    </CardFooter>
                </Card>

                {/* Pro Plan */}
                <Card className={`relative flex flex-col border-2 ${isPro ? "border-green-500 shadow-lg" : "border-violet-600 shadow-xl"}`}>
                    {isPro && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-sm">
                            CURRENT PLAN
                        </div>
                    )}
                    <CardHeader>
                        <CardTitle className="text-2xl text-violet-600">Commander</CardTitle>
                        <CardDescription>Advanced tools for serious wealth building.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-6">
                        <div className="text-3xl font-bold">$12.99<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                        <ul className="space-y-3">
                            <Feature text="Unlimited Households" included />
                            <Feature text="Unlimited Transactions" included />
                            <Feature text="Custom Categories" included />
                            <Feature text="AI Wealth Forecasting" included />
                            <Feature text="Investment Tracking" included />
                            <Feature text="Priority Support" included />
                        </ul>
                    </CardContent>
                    <CardFooter>
                        {isPro ? (
                            <Button className="w-full bg-green-600 hover:bg-green-700" disabled>Active</Button>
                        ) : (
                            <UpgradeModal>
                                <Button className="w-full bg-violet-600 hover:bg-violet-700 text-lg py-6 shadow-lg shadow-violet-200">
                                    Upgrade Now
                                </Button>
                            </UpgradeModal>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}

function Feature({ text, included }: { text: string; included: boolean }) {
    return (
        <li className="flex items-center gap-3">
            {included ? (
                <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                    <Check className="h-3 w-3" />
                </div>
            ) : (
                <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                    <X className="h-3 w-3" />
                </div>
            )}
            <span className={included ? "text-slate-700" : "text-slate-400"}>{text}</span>
        </li>
    )
}
