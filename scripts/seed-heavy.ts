
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // 1. Get a target household (Change this ID to match your user's)
    const household = await prisma.household.findFirst()
    if (!household) {
        console.log("No household found.")
        return
    }

    console.log(`Seeding data for household: ${household.id}`)

    // 2. Get active accounts
    const accounts = await prisma.account.findMany({ where: { householdId: household.id } })
    if (accounts.length === 0) {
        console.log("No accounts found. Create one first.")
        return
    }

    const categories = await prisma.category.findMany()
    const fallbackCategory = categories[0]?.id

    // 3. Generate 5000 transactions
    console.log("Generating 5,000 transactions...")

    const batchSize = 1000
    const total = 5000
    const now = new Date()

    const transactions = []

    for (let i = 0; i < total; i++) {
        // Random date within last 3 years
        const date = new Date(now.getTime() - Math.random() * 1000 * 60 * 60 * 24 * 365 * 3)
        const account = accounts[Math.floor(Math.random() * accounts.length)]
        const amount = Math.random() * 500
        const type = Math.random() > 0.3 ? "EXPENSE" : "INCOME"

        transactions.push({
            date,
            amount: type === "EXPENSE" ? amount : amount * 2, // income usually larger chunks
            description: `Stress Test Tx #${i}`,
            type,
            categoryId: fallbackCategory || null,
            accountId: account.id,
            householdId: household.id,
            currency: account.currency,
        })
    }

    // 4. Batch Insert
    for (let i = 0; i < total; i += batchSize) {
        const batch = transactions.slice(i, i + batchSize)
        await prisma.transaction.createMany({
            data: batch as any
        })
        console.log(`inserted ${i + batch.length}/${total}`)
    }

    console.log("Done! Check your dashboard performance.")
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
