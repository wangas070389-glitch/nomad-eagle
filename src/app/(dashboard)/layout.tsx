import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import Link from "next/link"
import { UserNav } from "@/components/layout/user-nav"
import { Badge } from "@/components/ui/badge"
import { LayoutGrid } from "lucide-react"

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
            <nav className="border-b bg-white px-6 py-4 flex justify-between items-center">

                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent group">
                        <LayoutGrid className="h-6 w-6 text-slate-800 dark:text-slate-100" />
                        <span>Nomad Eagle Systems</span>
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-slate-300 text-slate-500">v1.1</Badge>
                    </Link>
                    <div className="flex gap-6 text-sm font-medium text-muted-foreground">
                        <Link href="/" className="hover:text-primary transition-colors">Dashboard</Link>
                        <Link href="/plan" className="hover:text-primary transition-colors">Plan</Link>
                        <Link href="/trips" className="hover:text-primary transition-colors">Trips</Link>
                        <Link href="/settings" className="hover:text-primary transition-colors">Settings</Link>
                    </div>
                </div>
                <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-300">
                    <UserNav user={session.user as any} />
                </div>
            </nav>
            <main className="p-6 max-w-7xl mx-auto">{children}</main>
        </div>
    )
}
