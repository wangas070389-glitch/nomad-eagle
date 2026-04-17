const fs = require('fs');
const content = fs.readFileSync('src/server/actions/transactions.ts', 'utf8');

const interfaceInjection = `
export interface CreateTransactionInput {
    amount: string | number;
    date: string | Date;
    description: string;
    categoryId: string;
    accountId: string;
    type?: "INCOME" | "EXPENSE";
    recurringFlowId?: string;
}

export async function createTransaction`;

const newContent = content.replace('export async function createTransaction', interfaceInjection);

fs.writeFileSync('src/server/actions/transactions.ts', newContent);
