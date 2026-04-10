const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
    const hash = await bcrypt.hash('admin123', 12)
    const user = await prisma.user.upsert({
        where: { email: 'admin@nomad.com' },
        update: { password: hash, role: 'ADMIN', status: 'ACTIVE' },
        create: {
            email: 'admin@nomad.com',
            name: 'Admin',
            password: hash,
            role: 'ADMIN',
            status: 'ACTIVE',
            displayName: 'Commander'
        }
    })
    console.log('Ensured admin user:', user.email)
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
