const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding...')

    // 1. Create Household
    const household = await prisma.household.upsert({
        where: { inviteCode: 'NOMAD1' },
        update: {},
        create: {
            name: 'Nomad Household',
            inviteCode: 'NOMAD1',
        },
    })

    console.log(`Created household with id: ${household.id}`)

    // 2. Create Admin User
    const admin = await prisma.user.upsert({
        where: { email: 'admin@nomad.com' },
        update: {
            householdId: household.id,
            role: 'ADMIN',
            status: 'ACTIVE',
            displayName: 'Commander'
        },
        create: {
            email: 'admin@nomad.com',
            name: 'Admin',
            householdId: household.id,
            role: 'ADMIN',
            status: 'ACTIVE',
            displayName: 'Commander'
        },
    })

    // 3. Create Partner User
    const partner = await prisma.user.upsert({
        where: { email: 'partner@nomad.com' },
        update: {
            householdId: household.id,
            status: 'ACTIVE',
            displayName: 'Wingman'
        },
        create: {
            email: 'partner@nomad.com',
            name: 'Partner',
            householdId: household.id,
            status: 'ACTIVE',
            displayName: 'Wingman'
        },
    })

    console.log({ admin, partner })

    // 4. Set Admin as Owner
    await prisma.household.update({
        where: { id: household.id },
        data: { ownerId: admin.id }
    })
    console.log('Set Admin as Household Owner')
    console.log('Seeding finished.')
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
