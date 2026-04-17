const fs = require('fs');
let content = fs.readFileSync('src/server/actions/transactions.ts', 'utf8');

const oldCode = `    const recurringFlowId = actualData instanceof FormData ? (actualData.get("recurringFlowId") as string) : (actualData as any).recurringFlowId
    const finalCategoryId = actualData instanceof FormData ? (actualData.get("categoryId") as string) : (actualData as any).categoryId

    try {
        // Use Domain Service for Atomic Execution & Ledgering
        const transactionId = await container.transactionService.execute({
            amount: new Decimal(amount),
            date: new Date(date),
            description,
            type: type as any,`;

const newCode = `    const recurringFlowId = actualData instanceof FormData ? (actualData.get("recurringFlowId") as string) : actualData.recurringFlowId;
    const finalCategoryId = actualData instanceof FormData ? (actualData.get("categoryId") as string) : actualData.categoryId;

    try {
        // Use Domain Service for Atomic Execution & Ledgering
        const transactionId = await container.transactionService.execute({
            amount: new Decimal(amount),
            date: new Date(date),
            description,
            type: type as "INCOME" | "EXPENSE",`;

content = content.replace(oldCode, newCode);

fs.writeFileSync('src/server/actions/transactions.ts', content);
