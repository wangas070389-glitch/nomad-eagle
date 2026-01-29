const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
    const hash = await bcrypt.hash('admin123', 12)
    await prisma.user.update({
        where: { email: 'admin@nomad.com' },
        data: { password: hash }
    })
    console.log('Admin password reset to: admin123')
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
