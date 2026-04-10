import { PrismaClient } from "@prisma/client"
import { Decimal } from "decimal.js"

const prisma = new PrismaClient()

async function main() {
  console.log("🔍 Starting Ledger Verification (Phase 1.4)...")

  const accounts = await prisma.account.findMany({
    include: {
      ledgerEntries: true
    }
  })

  let totalMismatches = 0

  for (const account of accounts) {
    const cachedBalance = new Decimal(account.balance.toString())
    
    // Calculate expected balance from ledger
    let calculatedBalance = new Decimal(0)
    for (const entry of account.ledgerEntries) {
      const amount = new Decimal(entry.amount.toString())
      if (entry.type === "DEBIT") {
        calculatedBalance = calculatedBalance.plus(amount)
      } else {
        calculatedBalance = calculatedBalance.minus(amount)
      }
    }

    const diff = cachedBalance.minus(calculatedBalance)
    
    if (!diff.isZero()) {
      console.error(`❌ MISMATCH in Account: ${account.name} (ID: ${account.id})`)
      console.error(`   Cached: ${cachedBalance}`)
      console.error(`   Ledger: ${calculatedBalance}`)
      console.error(`   Diff:   ${diff}`)
      totalMismatches++
    } else {
      console.log(`✅ Verified Account: ${account.name} | Balance: ${calculatedBalance}`)
    }
  }

  if (totalMismatches > 0) {
    console.error(`\n🚨 Verification FAILED with ${totalMismatches} mismatches.`)
    process.exit(1)
  } else {
    console.log("\n✨ Verification SUCCESSFUL. All ledger entries match cached balances.")
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
