"use server"

import { authOptions } from "@/lib/auth"
import { generateEmbedding } from "@/lib/embedding"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"

export type SearchResult = {
    id: string
    description: string
    amount: number
    date: Date
    category: { name: string; icon: string } | null
    type: string
    similarity: number
}

export async function searchTransactions(query: string): Promise<{ results?: SearchResult[]; error?: string }> {
    const session = await getServerSession(authOptions)
    if (!session?.user?.householdId) return { error: "Not authenticated" }

    if (!query || query.trim().length < 2) return { results: [] }

    try {
        const embedding = await generateEmbedding(query)
        const vector = `[${embedding.join(",")}]`

        // Strict Vector Isolation: WHERE "householdId" = ...
        // Using Cosine Distance (<=>)
        const results = await prisma.$queryRaw`
            SELECT 
                t.id, 
                t.description, 
                t.amount, 
                t.date, 
                t.type,
                c.name as "categoryName",
                c.icon as "categoryIcon",
                1 - (t."descriptionEmbedding" <=> ${vector}::vector) as similarity
            FROM "Transaction" t
            LEFT JOIN "Category" c ON t."categoryId" = c.id
            WHERE t."householdId" = ${session.user.householdId}
            ORDER BY t."descriptionEmbedding" <=> ${vector}::vector
            LIMIT 20;
        ` as any[]

        // Map results to typed objects
        const mapped: SearchResult[] = results.map(r => ({
            id: r.id,
            description: r.description,
            amount: Number(r.amount), // Decimal to Number
            date: new Date(r.date),
            type: r.type,
            category: r.categoryName ? { name: r.categoryName, icon: r.categoryIcon } : null,
            similarity: Number(r.similarity)
        }))

        return { results: mapped }

    } catch (e) {
        console.error("Vector search failed", e)
        return { error: "Search failed" }
    }
}
