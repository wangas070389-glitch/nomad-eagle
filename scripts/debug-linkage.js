const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function debug() {
    console.log('🔍 Debugging Household Linkage...')
    
    const admin = await prisma.user.findUnique({
        where: { email: 'admin@nomad.com' },
        include: { household: true }
    })

    if (!admin) {
        console.error('❌ User admin@nomad.com NOT FOUND')
    } else {
        console.log(`✅ User admin@nomad.com found. HouseholdID: ${admin.householdId}`)
        if (admin.household) {
            console.log(`✅ Linked Household found: ${admin.household.name} (${admin.household.id})`)
        } else {
            console.error('❌ User is NOT linked to any household in the DB.')
        }
    }

    const households = await prisma.household.findMany({
        include: { users: true, categories: true, recurringFlows: true }
    })
    console.log(`📊 Number of households in DB: ${households.length}`)
    for (const h of households) {
        console.log(` - Household: ${h.name} (${h.id}), Users: ${h.users.length}, Planner Items: ${h.recurringFlows.length}`)
    }
}

debug()
    .then(() => prisma.$disconnect())
    .catch(e => { console.error(e); prisma.$disconnect(); process.exit(1) })
