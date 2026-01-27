const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Starting ownership fix...")

    // Find households with no owner
    const headlessHouseholds = await prisma.household.findMany({
        where: { ownerId: null },
        include: { users: true }
    })

    console.log(`Found ${headlessHouseholds.length} households without owners.`)

    for (const household of headlessHouseholds) {
        if (household.users.length > 0) {
            // Assign the first user as owner
            const newOwner = household.users[0]
            await prisma.household.update({
                where: { id: household.id },
                data: { ownerId: newOwner.id }
            })
            console.log(`  Fixed: Assigned ${newOwner.email} as owner of "${household.name}"`)
        } else {
            console.log(`  Skipped: "${household.name}" has no members.`)
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
