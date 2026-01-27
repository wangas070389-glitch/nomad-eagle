"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { useState } from "react"

import { LayoutGrid } from "lucide-react"

export default function SignInPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        await signIn("credentials", {
            email,
            password,
            callbackUrl: "/",
        })
        setIsLoading(false)
    }

    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">

            {/* LEFT PANE: Authentication Interface */}
            <div className="flex items-center justify-center py-12 bg-white text-slate-900 border-r border-slate-200">
                <div className="mx-auto grid w-[350px] gap-6">
                    <div className="grid gap-2 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                                <LayoutGrid className="h-8 w-8 text-indigo-600" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
                        <p className="text-sm text-slate-500">
                            Enter your credentials to access your plan.
                        </p>
                    </div>

                    <div className="grid gap-4">
                        <form onSubmit={handleLogin}>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="me@example.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-indigo-500 rounded-md h-11"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <div className="flex items-center">
                                        <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-white border-slate-300 text-slate-900 focus-visible:ring-indigo-500 rounded-md h-11"
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md h-11 shadow-sm transition-all" disabled={isLoading}>
                                    {isLoading ? "Signing in..." : "Sign in"}
                                </Button>
                            </div>
                        </form>

                    </div>

                    <div className="mt-8 text-center text-sm text-slate-500 flex flex-col gap-2">
                        <p>
                            Don&apos;t have an account?
                            <Link href="/register" className="ml-1 font-medium text-indigo-600 hover:text-indigo-500 underline underline-offset-4">
                                Create an account
                            </Link>
                        </p>
                        <p className="text-xs">
                            Invited to a Trip?
                            <Link href="/guest/access" className="ml-1 font-medium text-slate-600 hover:text-slate-800 underline underline-offset-4">
                                Jump in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* RIGHT PANE: The Manifesto */}
            <div className="hidden bg-slate-950 lg:block border-l border-slate-800 relative overflow-hidden">
                {/* Clean Tech Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] opacity-100" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-20" />

                <div className="flex flex-col justify-center h-full p-24 text-white relative z-10">
                    {/* The Headline */}
                    <h1 className="mb-6 text-6xl font-bold tracking-tight leading-tight">
                        Define Your<br />
                        <span className="text-indigo-200">Distance.</span>
                    </h1>

                    {/* The Value Props */}
                    <div className="space-y-8 max-w-lg">
                        <div className="flex gap-4">
                            <div className="h-12 w-1 border-l-2 border-indigo-300/50 mt-1" />
                            <div>
                                <h3 className="text-lg font-semibold text-indigo-100 mb-1">Clarity is Velocity</h3>
                                <p className="text-indigo-200/80 leading-relaxed">
                                    Transform complex banking data into a crystal-clear signal.
                                    See exactly how fast you're moving toward your goals.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="h-12 w-1 border-l-2 border-indigo-300/50 mt-1" />
                            <div>
                                <h3 className="text-lg font-semibold text-indigo-100 mb-1">Simulate the Future</h3>
                                <p className="text-indigo-200/80 leading-relaxed">
                                    Run aggressive scenarios on your net worth.
                                    Know the impact of every decision before you make it.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="h-12 w-1 border-l-2 border-indigo-300/50 mt-1" />
                            <div>
                                <h3 className="text-lg font-semibold text-indigo-100 mb-1">Fund Experiences</h3>
                                <p className="text-indigo-200/80 leading-relaxed">
                                    Money is fuel for life. Allocating capital to shared trips
                                    and memories is the ultimate return on investment.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
