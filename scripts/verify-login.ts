
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@nomad.com'
    const password = 'password123'

    console.log(`Verifying login for ${email} with password: ${password}`)

    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        console.error("User not found!")
        return
    }

    console.log(`User found: ${user.id}`)
    console.log(`Stored Hash: ${user.password?.substring(0, 15)}...`)

    const isValid = await bcrypt.compare(password, user.password || "")
    console.log(`Is Valid? ${isValid}`)

    if (isValid) {
        console.log("SUCCESS: Password matches hash.")
    } else {
        console.log("FAILURE: Password does NOT match hash.")

        // Experiment: Hash it again and show what it looks like
        const newHash = await bcrypt.hash(password, 12)
        console.log(`A fresh hash would look like: ${newHash.substring(0, 15)}...`)
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
