import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShieldCheck, LayoutDashboard, Users, Activity } from "lucide-react"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (session?.user?.role !== "ADMIN") {
        redirect("/")
    }

    return (
        <div className="flex h-screen bg-slate-950 text-white">
            {/* Sidebar - Distinct Dark Theme for Admin Context */}
            <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800">
                <div className="p-6 border-b border-slate-800 flex items-center gap-2">
                    <ShieldCheck className="h-6 w-6 text-red-500" />
                    <span className="font-bold text-lg tracking-tight">Watchtower</span>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <Link href="/admin">
                        <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Overview
                        </Button>
                    </Link>
                    <Link href="/admin/dashboard">
                        <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                            <Users className="mr-2 h-4 w-4" />
                            Population
                        </Button>
                    </Link>
                    <Link href="/admin/system">
                        <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800 opacity-50 cursor-not-allowed">
                            <Activity className="mr-2 h-4 w-4" />
                            System Health
                        </Button>
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="text-xs text-slate-500 font-mono">
                        SECURE TERMINAL<br />
                        v1.0.0
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
