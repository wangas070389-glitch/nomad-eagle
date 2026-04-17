import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export interface DiagnosticCheck {
    name: string
    success: boolean
    data?: unknown
}

export interface DiagnosticReport {
    checks: DiagnosticCheck[]
    status: "PASS" | "FAIL" | "CRITICAL_FAIL"
    error?: string
    stack?: string
}

export async function GET() {
    const report: DiagnosticReport = {
        checks: [],
        status: "PASS"
    }

    function log(name: string, success: boolean, data?: unknown) {
        report.checks.push({ name, success, data })
        if (!success) report.status = "FAIL"
    }

    try {
        // 1. DB Connection
        await prisma.$queryRaw`SELECT 1`
        log("Database Connection", true)

        // 2. User Schema Check
        const user = await prisma.user.findUnique({
            where: { email: "admin@nomad.com" },
            include: { incomeHistory: true }
        })

        if (!user) {
            log("Admin User Existence", false, "User not found")
        } else {
            log("Admin User Existence", true, { id: user.id, tier: user.tier })

            // Check New Fields
            if (typeof user.tier === 'undefined') log("Schema: User.tier", false)
            else log("Schema: User.tier", true, user.tier)

            if (!Array.isArray(user.incomeHistory)) log("Schema: User.incomeHistory", false)
            else log("Schema: User.incomeHistory", true, `Count: ${user.incomeHistory.length}`)
        }

        // 3. Household Check
        if (user?.householdId) {
            const household = await prisma.household.findUnique({
                where: { id: user.householdId },
                include: { transactions: { take: 1 } }
            })
            log("Household Fetch", !!household, household ? { name: household.name } : null)
        }

        // 4. Transaction Fetch
        const transactions = await prisma.transaction.findMany({ take: 5 })
        log("Transaction IO", true, `Fetched ${transactions.length} txs`)

    } catch (e: unknown) {
        report.status = "CRITICAL_FAIL"
        if (e instanceof Error) {
            report.error = e.message
            report.stack = e.stack
        } else {
            report.error = "An unknown error occurred"
        }
        console.error(e)
    }

    return NextResponse.json(report)
}
