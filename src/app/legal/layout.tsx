import Link from "next/link"
import { LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LegalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <header className="border-b bg-white">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-bold text-violet-600">
                        <LayoutGrid className="h-6 w-6" />
                        <span>Nomad Eagle</span>
                    </Link>
                    <nav className="flex gap-4 text-sm text-slate-600">
                        <Link href="/legal/terms" className="hover:text-violet-600">Terms</Link>
                        <Link href="/legal/privacy" className="hover:text-violet-600">Privacy</Link>
                    </nav>
                </div>
            </header>
            <main className="flex-1 py-12 px-6">
                <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-xl border shadow-sm">
                    {children}
                </div>
            </main>
            <footer className="border-t bg-white py-12">
                <div className="max-w-4xl mx-auto px-6 text-center text-sm text-slate-500">
                    <p>© {new Date().getFullYear()} Nomad Eagle Systems. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
