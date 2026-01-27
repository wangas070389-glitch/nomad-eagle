import { DetailedCashFlow } from "@/server/actions/cashflow"

export function generateCashFlowCSV(data: DetailedCashFlow): string {
    const rows: string[] = []

    // 1. Headers
    rows.push(["Category", ...data.headers].join(","))

    // 2. Inflows
    rows.push("INFLOWS")
    data.inflows.forEach(row => {
        rows.push([row.name, ...row.values].join(","))
    })

    // 3. Outflows
    rows.push("OUTFLOWS")
    data.outflows.forEach(row => {
        rows.push([row.name, ...row.values].join(","))
    })

    // 4. Summary
    rows.push("SUMMARY")
    rows.push(["Total Income", ...data.summary.totalIncome].join(","))
    rows.push(["Total Expense", ...data.summary.totalExpense].join(","))
    rows.push(["Net Flow", ...data.summary.netFlow].join(","))
    rows.push(["Ending Balance", ...data.summary.endingBalance].join(","))

    return rows.join("\n")
}
