
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@nomad.com'
    const password = 'password123'

    console.log(`Resetting password for ${email}...`)

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.update({
        where: { email },
        data: {
            password: hashedPassword,
            status: 'ACTIVE',
            role: 'ADMIN'
        }
    })

    console.log(`Success! User ${user.email} updated.`)
    console.log(`New Hash: ${hashedPassword.substring(0, 10)}...`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
