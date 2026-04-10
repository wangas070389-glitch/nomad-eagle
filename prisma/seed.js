const { PrismaClient, Currency, AccountType, TransactionType, UserRole, UserStatus, AssetClass, FlowType, Frequency } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
    console.log('🧹 Clearing Existing Data (Leaf-to-Root)...')
    // Delete dependents first
    await prisma.ledgerEntry.deleteMany()
    await prisma.ledgerTransaction.deleteMany()
    await prisma.transaction.deleteMany()
    await prisma.investmentPosition.deleteMany()
    await prisma.priceHistory.deleteMany()
    await prisma.budgetLimit.deleteMany()
    await prisma.recurringFlow.deleteMany() // Added before Category/Household
    await prisma.category.deleteMany()
    await prisma.account.deleteMany()
    await prisma.user.deleteMany()
    await prisma.household.deleteMany()

    console.log('🚀 Starting Sovereign Household Simulation (60-Day Proof)...')

    const hashedPassword = await bcrypt.hash('password123', 12)
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

    // 1. Create Household
    const household = await prisma.household.upsert({
        where: { inviteCode: 'NOMAD1' },
        update: {},
        create: {
            name: 'Nomad Household',
            inviteCode: 'NOMAD1',
        },
    })

    // 2. Create Users
    console.log('--- Establishing User Sovereignty ---')
    const admin = await prisma.user.upsert({
        where: { email: 'admin@nomad.com' },
        update: {
            householdId: household.id,
            role: 'ADMIN',
            status: 'ACTIVE',
            displayName: 'Commander',
            password: hashedPassword,
            jobTitle: 'Senior Platform Engineer'
        },
        create: {
            email: 'admin@nomad.com',
            name: 'Admin',
            householdId: household.id,
            role: 'ADMIN',
            status: 'ACTIVE',
            displayName: 'Commander',
            password: hashedPassword,
            jobTitle: 'Senior Platform Engineer'
        },
    })

    const partner = await prisma.user.upsert({
        where: { email: 'partner@nomad.com' },
        update: {
            householdId: household.id,
            status: 'ACTIVE',
            displayName: 'Wingman',
            password: hashedPassword,
            jobTitle: 'Financial Consultant'
        },
        create: {
            email: 'partner@nomad.com',
            name: 'Partner',
            householdId: household.id,
            status: 'ACTIVE',
            displayName: 'Wingman',
            password: hashedPassword,
            jobTitle: 'Financial Consultant'
        },
    })

    // Explicitly force linkage in case upsert/update was partial
    await prisma.user.update({ where: { id: admin.id }, data: { householdId: household.id } })
    await prisma.user.update({ where: { id: partner.id }, data: { householdId: household.id } })

    await prisma.household.update({
        where: { id: household.id },
        data: { ownerId: admin.id }
    })

    // 3. Create Accounts
    const jointChecking = await prisma.account.create({
        data: {
            name: 'Nomad Joint Checking',
            type: 'CHECKING',
            currency: 'USD',
            balance: 12450.00,
            householdId: household.id,
        }
    })

    const obsidianCredit = await prisma.account.create({
        data: {
            name: 'Nomad Obsidian Card',
            type: 'CREDIT_CARD',
            currency: 'USD',
            balance: -2450.00,
            householdId: household.id,
        }
    })

    const commanderWallet = await prisma.account.create({
        data: {
            name: "Commander's Wallet",
            type: 'CHECKING',
            currency: 'USD',
            balance: 1500.00,
            ownerId: admin.id,
            householdId: household.id,
        }
    })

    const wingmanVault = await prisma.account.create({
        data: {
            name: "Wingman's Vault",
            type: 'SAVINGS',
            currency: 'USD',
            balance: 45000.00,
            ownerId: partner.id,
            householdId: household.id,
        }
    })

    // 4. Categories & Limits
    const categories = [
        { name: 'Housing', type: 'EXPENSE', icon: 'Home', limit: 2500 },
        { name: 'Food', type: 'EXPENSE', icon: 'Utensils', limit: 800 },
        { name: 'Transport', type: 'EXPENSE', icon: 'Car', limit: 400 },
        { name: 'Tech & Security', type: 'EXPENSE', icon: 'Shield', limit: 500 },
        { name: 'Salary', type: 'INCOME', icon: 'Briefcase', limit: null },
        { name: 'Consulting', type: 'INCOME', icon: 'Zap', limit: null },
        { name: 'Investments', type: 'TRANSFER', icon: 'TrendingUp', limit: null },
    ]

    const categoryMap = {}
    for (const cat of categories) {
        const createdCat = await prisma.category.create({
            data: {
                name: cat.name,
                type: cat.type,
                icon: cat.icon,
                householdId: household.id
            }
        })
        categoryMap[cat.name] = createdCat

        if (cat.limit) {
            await prisma.budgetLimit.create({
                data: {
                    amount: cat.limit,
                    period: 'MONTHLY',
                    categoryId: createdCat.id,
                    householdId: household.id
                }
            })
        }
    }

    // 5. Seed Historical Transactions (60 Days)
    console.log('--- Seeding 60 Days of Transactions ---')
    
    // Helper for Double-Entry Ledger
    async function createSovereignTx({ date, amount, type, desc, catId, accId, userId }) {
        const tx = await prisma.transaction.create({
            data: {
                date,
                amount,
                type,
                description: desc,
                currency: 'USD',
                categoryId: catId,
                accountId: accId,
                spentByUserId: userId,
                householdId: household.id
            }
        })

        // Mirror in Ledger
        const ledgerTx = await prisma.ledgerTransaction.create({
            data: {
                type: 'TRANSACTION',
                description: desc,
                createdAt: date
            }
        })

        // Simplified Double Entry: Account vs "External"
        // If INCOME: Debit Account (Asset Increase), Credit External
        // If EXPENSE: Credit Account (Asset Decrease/Liability Increase), Debit External
        await prisma.ledgerEntry.create({
            data: {
                accountId: accId,
                householdId: household.id,
                amount: type === 'INCOME' ? amount : -amount,
                type: type === 'INCOME' ? 'DEBIT' : 'CREDIT',
                ledgerTxId: ledgerTx.id,
                createdAt: date
            }
        })

        return tx
    }

    // Loop through 60 days
    for (let i = 0; i < 60; i++) {
        const currentDate = new Date(sixtyDaysAgo)
        currentDate.setDate(sixtyDaysAgo.getDate() + i)

        // Rent (1st of month)
        if (currentDate.getDate() === 1) {
            await createSovereignTx({
                date: currentDate,
                amount: 2200,
                type: 'EXPENSE',
                desc: 'Monthly Rent - Sovereign Quarter',
                catId: categoryMap['Housing'].id,
                accId: jointChecking.id,
                userId: admin.id
            })
        }

        // Bi-weekly Salaries (15th and 30th)
        if (currentDate.getDate() === 15 || currentDate.getDate() === 28) {
            await createSovereignTx({
                date: currentDate,
                amount: 4500,
                type: 'INCOME',
                desc: 'Admin Bi-Weekly Salary',
                catId: categoryMap['Salary'].id,
                accId: jointChecking.id,
                userId: admin.id
            })
            await createSovereignTx({
                date: currentDate,
                amount: 3800,
                type: 'INCOME',
                desc: 'Partner Bi-Weekly Salary',
                catId: categoryMap['Salary'].id,
                accId: jointChecking.id,
                userId: partner.id
            })
        }

        // Weekly Groceries (Sundays)
        if (currentDate.getDay() === 0) {
            await createSovereignTx({
                date: currentDate,
                amount: 150 + Math.random() * 50,
                type: 'EXPENSE',
                desc: 'Weekly Provisions',
                catId: categoryMap['Food'].id,
                accId: obsidianCredit.id,
                userId: partner.id
            })
        }

        // Random small expenses
        if (Math.random() > 0.7) {
            await createSovereignTx({
                date: currentDate,
                amount: 20 + Math.random() * 40,
                type: 'EXPENSE',
                desc: 'Cloud Infrastructure / Security',
                catId: categoryMap['Tech & Security'].id,
                accId: obsidianCredit.id,
                userId: admin.id
            })
        }
    }

    // 6. Seed Siemens (SIE) Equity
    console.log('--- Seeding Siemens (SIE) Equity Portfolio ---')
    await prisma.investmentPosition.create({
        data: {
            accountId: wingmanVault.id,
            householdId: household.id,
            ownerId: partner.id,
            ticker: 'SIE',
            name: 'Siemens AG',
            assetClass: 'EQUITY',
            currency: 'USD',
            quantity: 50,
            costBasis: 165.40, // Historical purchase price
        }
    })

    // Seed some price history for SIE
    for (let i = 0; i < 60; i++) {
        const currentDate = new Date(sixtyDaysAgo)
        currentDate.setDate(sixtyDaysAgo.getDate() + i)
        await prisma.priceHistory.create({
            data: {
                ticker: 'SIE',
                date: currentDate,
                price: 160 + Math.random() * 20,
                currency: 'USD'
            }
        })
    }

    // 7. Seed Planner Data (RecurringFlows)
    console.log('--- Seeding Planner Data (Income & Expense Models) ---')
    await prisma.recurringFlow.createMany({
        data: [
            {
                name: 'Main Salary (Commander)',
                amount: 9000,
                type: 'INCOME',
                frequency: 'MONTHLY',
                isActive: true,
                householdId: household.id
            },
            {
                name: 'Consulting Fees (Partner)',
                amount: 7600,
                type: 'INCOME',
                frequency: 'MONTHLY',
                isActive: true,
                householdId: household.id
            },
            {
                name: 'Monthly Rent',
                amount: 2200,
                type: 'EXPENSE',
                frequency: 'MONTHLY',
                isActive: true,
                householdId: household.id
            },
            {
                name: 'Infrastructure (AWS/GCP)',
                amount: 150,
                type: 'EXPENSE',
                frequency: 'MONTHLY',
                isActive: true,
                householdId: household.id
            },
            {
                name: 'Professional Insurance',
                amount: 200,
                type: 'EXPENSE',
                frequency: 'MONTHLY',
                isActive: true,
                householdId: household.id
            }
        ]
    })

    console.log('✅ Seeding Complete. 60 Days of Sovereign Data + Planner Live.')
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
