const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const defaults = [
        { name: "Housing", icon: "🏠", type: "EXPENSE" },
        { name: "Groceries", icon: "🛒", type: "EXPENSE" },
        { name: "Transport", icon: "🚗", type: "EXPENSE" },
        { name: "Dining Out", icon: "🍔", type: "EXPENSE" },
        { name: "Retirement", icon: "👴", type: "EXPENSE" },
        { name: "Salary", icon: "💰", type: "INCOME" },
        { name: "Investments", icon: "📈", type: "EXPENSE" },
        { name: "Utilities", icon: "💡", type: "EXPENSE" },
        { name: "Health", icon: "🏥", type: "EXPENSE" },
    ]

    console.log("Seeding system categories...")

    for (const cat of defaults) {
        const exists = await prisma.category.findFirst({
            where: { name: cat.name, householdId: null }
        })

        if (!exists) {
            await prisma.category.create({
                data: {
                    ...cat,
                    householdId: null // Global
                }
            })
            console.log(`Created ${cat.name}`)
        } else {
            console.log(`Skipped ${cat.name} (exists)`)
        }
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
