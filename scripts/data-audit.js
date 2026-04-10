const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function audit() {
    console.log('🧐 Starting Adversarial Audit: Sovereign Data Integrity...')

    const accounts = await prisma.account.findMany({
        include: {
            transactions: true,
            ledgerEntries: true
        }
    })

    let allPass = true

    for (const acc of accounts) {
        const txSum = acc.transactions.reduce((acc, tx) => acc + (tx.type === 'INCOME' ? Number(tx.amount) : -Number(tx.amount)), 0)
        const ledgerSum = acc.ledgerEntries.reduce((acc, entry) => acc + Number(entry.amount), 0)

        const diff = Math.abs(txSum - ledgerSum)
        if (diff > 0.01) {
            console.error(`❌ INTEGRITY FAILURE: Account [${acc.name}] - Delta: ${diff}`)
            allPass = false
        } else {
            console.log(`✅ INTEGRITY PASS: Account [${acc.name}] - Mirroring confirmed.`)
        }
    }

    const sieEquity = await prisma.investmentPosition.findFirst({ where: { ticker: 'SIE' } })
    if (sieEquity) {
        console.log(`✅ EQUITY PASS: Siemens (SIE) identified in Wingman's portfolio. Qty: ${sieEquity.quantity}`)
    } else {
        console.error('❌ EQUITY FAILURE: Siemens (SIE) not found.')
        allPass = false
    }

    if (allPass) {
        console.log('💎 Audit Verdict: 100% Sovereign Data Integrity Achieved.')
    } else {
        process.exit(1)
    }
}

audit()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
