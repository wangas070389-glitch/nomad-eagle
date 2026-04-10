import { prisma } from "../src/lib/prisma"
import { container } from "../src/server/domain-container"

async function reconcileAll() {
  console.log("🩹  Starting Self-Healing Balance Reconciliation...")
  
  const accounts = await prisma.account.findMany()
  let healCount = 0

  for (const account of accounts) {
    console.log(`Checking account: ${account.name} (id: ${account.id})...`)
    
    // 1. Calculate Truth from Ledger
    const ledgerBalance = await container.ledgerService.calculateBalance(account.id)
    const cachedBalance = Number(account.balance)

    const diff = Math.abs(ledgerBalance.toNumber() - cachedBalance)

    if (diff > 0.001) {
      console.warn(`[DISCREPANCY] Account ${account.name}: Cache=${cachedBalance}, Ledger=${ledgerBalance}`)
      console.log(`Healing account ${account.id}...`)
      
      // 2. Update Cache to Match Truth
      await prisma.account.update({
        where: { id: account.id },
        data: { balance: ledgerBalance.toNumber() }
      })
      
      healCount++
      console.log(`✅ Healed!`)
    }
  }

  console.log(`\nReconciliation Complete. Total accounts checked: ${accounts.length}. Total healed: ${healCount}.`)
}

reconcileAll()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
