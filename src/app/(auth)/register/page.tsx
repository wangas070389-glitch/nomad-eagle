"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { registerUser } from "@/server/actions/auth-ops"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { useActionState, useEffect } from "react"
import { LayoutGrid } from "lucide-react"

export default function RegisterPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const inviteCode = searchParams.get("invite")

    // useActionState signature: (action, initialState)
    const [state, action, isPending] = useActionState(registerUser, null)

    useEffect(() => {
        if (state?.success) {
            router.push("/sign-in?registered=true")
        }
    }, [state, router])

    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
            {/* LEFT PANE: The Setup (Clean White) */}
            <div className="flex items-center justify-center py-12 bg-white text-slate-900 border-r border-slate-200">
                <div className="mx-auto grid w-[350px] gap-6">
                    <div className="grid gap-2 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                                <LayoutGrid className="h-8 w-8 text-indigo-600" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Start Your Journey</h1>
                        <p className="text-sm text-slate-500">
                            Enter your details to build your financial base.
                        </p>
                    </div>

                    <div className="grid gap-4">
                        <form action={action} className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="me@example.com"
                                    required
                                    className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-indigo-500 rounded-md h-11"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="bg-white border-slate-300 text-slate-900 focus-visible:ring-indigo-500 rounded-md h-11"
                                />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="inviteCode" className="text-sm font-medium text-slate-700">Invite Code</Label>
                                    <span className="text-xs text-slate-400 font-normal">Optional</span>
                                </div>
                                <Input
                                    id="inviteCode"
                                    name="inviteCode"
                                    defaultValue={inviteCode || ""}
                                    readOnly={!!inviteCode}
                                    placeholder="NOMAD1"
                                    className={`bg-white border-slate-300 text-slate-900 focus-visible:ring-indigo-500 rounded-md h-11 ${inviteCode ? "bg-slate-50 font-mono text-indigo-600" : ""}`}
                                />
                                {inviteCode && <p className="text-xs text-indigo-600 font-medium">✨ Applying invite code from link</p>}
                            </div>

                            {state?.error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100">{state.error}</p>}

                            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md h-11 shadow-sm transition-all" disabled={isPending}>
                                {isPending ? "Creating account..." : "Create Account"}
                            </Button>
                        </form>

                        <div className="mt-4 text-center text-sm text-slate-500">
                            Already have an account?{" "}
                            <Link href="/sign-in" className="text-indigo-600 hover:text-indigo-700 font-medium underline underline-offset-4">
                                Sign in
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT PANE: The Vision (Purple Gradient) */}
            <div className="hidden lg:flex flex-col justify-center w-full p-12 text-white bg-gradient-to-br from-indigo-600 to-purple-500">
                <div className="max-w-lg mx-auto">
                    {/* The Headline */}
                    <h1 className="mb-6 text-5xl font-bold tracking-tight leading-tight">
                        Architect Your<br />Freedom.
                    </h1>

                    {/* The 3 Onboarding Truths */}
                    <div className="space-y-10 mt-12">
                        <div className="pl-4 border-l-2 border-indigo-400/50">
                            <h3 className="font-semibold text-xl">Unified Control</h3>
                            <p className="text-indigo-100 opacity-90 text-sm mt-1 leading-relaxed">
                                Stop juggling apps. Aggregate cash, investments, and debt in one operating system.
                            </p>
                        </div>
                        <div className="pl-4 border-l-2 border-indigo-400/50">
                            <h3 className="font-semibold text-xl">Radical Clarity</h3>
                            <p className="text-indigo-100 opacity-90 text-sm mt-1 leading-relaxed">
                                Build your 60-month forecast starting today. See the impact of your plan immediately.
                            </p>
                        </div>
                        <div className="pl-4 border-l-2 border-indigo-400/50">
                            <h3 className="font-semibold text-xl">Joint Ventures</h3>
                            <p className="text-indigo-100 opacity-90 text-sm mt-1 leading-relaxed">
                                Designed for couples and nomads. Manage household finances without losing autonomy.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
