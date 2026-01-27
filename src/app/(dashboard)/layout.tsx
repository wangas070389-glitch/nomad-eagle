import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import Link from "next/link"
import { UserNav } from "@/components/layout/user-nav"
import { Badge } from "@/components/ui/badge"
import { LayoutGrid } from "lucide-react"
import { MobileNav } from "@/components/layout/mobile-nav"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/sign-in")
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="border-b border-gray-200 bg-white px-6 py-4 flex justify-between items-center sticky top-0 z-50">

                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 text-xl font-bold text-violet-600 group hover:opacity-90 transition-opacity">
                        <LayoutGrid className="h-6 w-6" />
                        <span>Nomad Eagle Systems</span>
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-violet-100 bg-violet-50 text-violet-600 hidden sm:inline-flex">v1.1</Badge>
                    </Link>
                    <div className="hidden md:flex gap-6 text-sm font-medium text-slate-700">
                        <Link href="/" className="hover:text-violet-600 transition-colors">Dashboard</Link>
                        <Link href="/plan" className="hover:text-violet-600 transition-colors">Plan</Link>
                        <Link href="/trips" className="hover:text-violet-600 transition-colors">Trips</Link>
                        <Link href="/settings" className="hover:text-violet-600 transition-colors">Settings</Link>
                    </div>
                </div>
                <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-300">
                    <UserNav user={session.user as any} />
                    <MobileNav />
                </div>
            </nav>
            <main className="p-6 max-w-7xl mx-auto">{children}</main>
        </div>
    )
}
