"use client"

import { useState, useTransition } from "react"
import { Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { searchTransactions, SearchResult } from "@/server/actions/search"
import { formatCurrency } from "@/lib/utils"

export function SemanticSearch() {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<SearchResult[]>([])
    const [isPending, startTransition] = useTransition()
    const [searched, setSearched] = useState(false)

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim()) return

        startTransition(async () => {
            const { results, error } = await searchTransactions(query)
            if (results) {
                setResults(results)
                setSearched(true)
            }
        })
    }

    return (
        <div className="w-full max-w-2xl mx-auto mb-8 space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Ask: 'How much did I spend on Uber last month?'"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Button type="submit" disabled={isPending}>
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ask Eagle"}
                </Button>
            </form>

            {searched && results.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                    No matching transactions found in your history.
                </div>
            )}

            {results.length > 0 && (
                <div className="bg-card rounded-lg border shadow-sm divide-y">
                    {results.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex flex-col gap-1">
                                <div className="font-medium">{tx.description}</div>
                                <div className="text-xs text-muted-foreground flex gap-2">
                                    <span>{new Date(tx.date).toLocaleDateString()}</span>
                                    {tx.category && (
                                        <span className="flex items-center gap-1">
                                            <span>{tx.category.icon}</span>
                                            <span>{tx.category.name}</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={tx.type === 'INCOME' ? 'text-green-600 font-medium' : 'font-medium'}>
                                    {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {(tx.similarity * 100).toFixed(0)}% match
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
