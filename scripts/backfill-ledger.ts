import { PrismaClient } from "@prisma/client"
import { Decimal } from "decimal.js"

const prisma = new PrismaClient()

async function main() {
  console.log("🚀 Starting Ledger Backfill Migration (Phase 1.2)...")

  const accounts = await prisma.account.findMany()
  console.log(`Found ${accounts.length} accounts to process.`)

  for (const account of accounts) {
    const balance = new Decimal(account.balance.toString())
    
    // Skip if balance is zero (or should we still create an opening balance of 0?)
    // Decision: Create it for audit trail completeness.
    
    console.log(`Processing Account: ${account.name} (ID: ${account.id}) | Balance: ${balance}`)

    // 1. Create LedgerTransaction: OPENING_BALANCE
    const ledgerTx = await prisma.ledgerTransaction.create({
      data: {
        type: "OPENING_BALANCE",
        description: `Initial backfill for ${account.name}`,
        entries: {
          create: {
            accountId: account.id,
            householdId: account.householdId,
            amount: balance.abs(), // Always store absolute amount in ledger, type determines direction
            type: balance.isPositive() || balance.isZero() ? "DEBIT" : "CREDIT"
          }
        }
      }
    })

    console.log(`✅ Created LedgerTransaction: ${ledgerTx.id}`)
  }

  console.log("✨ Backfill Migration Complete.")
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
