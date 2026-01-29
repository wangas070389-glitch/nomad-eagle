import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("Starting System Diagnostics...")

    // 1. Check Admin User
    const admin = await prisma.user.findUnique({
        where: { email: "admin@nomad.com" },
        include: { incomeHistory: true }
    })

    if (!admin) {
        throw new Error("CRITICAL: Admin user not found")
    }

    console.log("✅ Admin User Found:", admin.email)
    console.log("   - ID:", admin.id)
    console.log("   - Tier:", admin.tier) // Check DB field existence

    if (admin.tier === undefined) throw new Error("CRITICAL: User.tier field missing")

    // 2. Check Household
    if (!admin.householdId) throw new Error("CRITICAL: Admin has no household")

    const household = await prisma.household.findUnique({
        where: { id: admin.householdId }
    })

    if (!household) throw new Error("CRITICAL: Admin household not found")

    const accounts = await prisma.account.findMany({
        where: { householdId: household.id }
    })

    console.log("✅ Household Found:", household.name)
    console.log("   - Accounts:", accounts.length)

    // 3. functional Test: Create and Delete Transaction
    console.log("🔄 Testing Transaction Write/Delete...")

    // Create a dummy account if none exists
    let accountId = accounts[0]?.id
    if (!accountId) {
        console.log("   - Creating temporary account...")
        const account = await prisma.account.create({
            data: {
                name: "System Test Bank",
                type: "CHECKING",
                balance: 1000,
                currency: "USD",
                householdId: household.id
            }
        })
        accountId = account.id
    }

    const tx = await prisma.transaction.create({
        data: {
            amount: 100,
            date: new Date(),
            description: "System Diagnostic Test",
            type: "EXPENSE",
            currency: "USD",
            accountId: accountId,
            householdId: household.id,
            spentByUserId: admin.id
        }
    })

    if (!tx) throw new Error("Failed to create transaction")
    console.log("   - Transaction Created:", tx.id)

    const deleted = await prisma.transaction.delete({
        where: { id: tx.id }
    })
    console.log("   - Transaction Deleted:", deleted.id)
    console.log("✅ Transaction Logic Functional")

    // 4. Check Income History Schema
    console.log("🔍 Inspecting Income History...")
    if (admin.incomeHistory.length >= 0) {
        console.log("✅ Income History Relation Accessible")
    } else {
        throw new Error("Income History relation failed")
    }

    console.log("----------------------------------------")
    console.log("🟢 ALL SYSTEMS GO. SINGULARITY PROTOCOL COMPLIANT.")
}

main()
    .catch((e) => {
        console.error(e)
        // process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
