const fs = require('fs');
let content = fs.readFileSync('src/server/actions/transactions.ts', 'utf8');

const target1 = `        recurringFlow: (tx as any).recurringFlow ? { ...(tx as any).recurringFlow } : null,`;
const replace1 = `        recurringFlow: tx.recurringFlow ? { ...tx.recurringFlow } : null,`;

content = content.replace(target1, replace1);

const target2 = `                    type: d.type as any, // Cast to any to bypass stale prisma client types`;
const replace2 = `                    type: d.type as "INCOME" | "EXPENSE", // Cast safely instead of bypassing types entirely`;

content = content.replace(target2, replace2);

fs.writeFileSync('src/server/actions/transactions.ts', content);
