import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface DiagnosticCheck {
    name: string;
    success: boolean;
    data?: unknown;
}

export interface DiagnosticReport {
    checks: DiagnosticCheck[];
    status: "PASS" | "FAIL" | "CRITICAL_FAIL";
    error?: string;
    stack?: string;
}

/**
 * Safely serialize an unknown error into a string.
 * Handles circular references, BigInt values, and non-serializable objects
 * that would cause JSON.stringify to throw during error reporting.
 */
function safeErrorString(e: unknown): string {
    if (e instanceof Error) return e.message;
    if (typeof e === "string") return e;
    try {
        return JSON.stringify(e, (_key, value) =>
            typeof value === "bigint" ? value.toString() : value
        );
    } catch {
        return String(e);
    }
}

export async function GET() {
    const report: DiagnosticReport = {
        checks: [],
        status: "PASS"
    };

    function log(name: string, success: boolean, data?: unknown) {
        report.checks.push({ name, success, data });
        if (!success) report.status = "FAIL";
    }

    try {
        // 0. Auth Gate — inside try/catch so a DB-down scenario
        //    still produces a structured DiagnosticReport.
        const session = await getServerSession(authOptions);

        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. DB Connection
        await prisma.$queryRaw`SELECT 1`;
        log("Database Connection", true);

        // 2. User Schema Check
        const user = await prisma.user.findUnique({
            where: { email: "admin@nomad.com" },
            include: { incomeHistory: true }
        });

        if (!user) {
            log("Admin User Existence", false, "User not found");
        } else {
            log("Admin User Existence", true, { id: user.id, tier: user.tier });

            log("Schema: User.tier", true, user.tier);

            if (!Array.isArray(user.incomeHistory)) log("Schema: User.incomeHistory", false);
            else log("Schema: User.incomeHistory", true, `Count: ${user.incomeHistory.length}`);
        }

        // 3. Household Check
        if (user?.householdId) {
            const household = await prisma.household.findUnique({
                where: { id: user.householdId },
                include: { transactions: { take: 1 } }
            });
            log("Household Fetch", !!household, household ? { name: household.name } : null);
        }

        // 4. Transaction Fetch
        const transactions = await prisma.transaction.findMany({ take: 5 });
        log("Transaction IO", true, `Fetched ${transactions.length} txs`);

    } catch (e: unknown) {
        report.status = "CRITICAL_FAIL";
        if (e instanceof Error) {
            report.error = e.message;
            report.stack = e.stack;
        } else {
            report.error = `Diagnostic failure: ${safeErrorString(e)}`;
        }
        console.error("[Diagnostic] Critical failure:", e);
    }

    // HTTP status reflects diagnostic verdict:
    // 200 for PASS/FAIL (system is reachable), 503 for CRITICAL_FAIL (system is down).
    const httpStatus = report.status === "CRITICAL_FAIL" ? 503 : 200;
    return NextResponse.json(report, { status: httpStatus });
}