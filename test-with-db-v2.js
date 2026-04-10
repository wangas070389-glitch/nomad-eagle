const { PrismaClient } = require("@prisma/client");
const { Decimal } = require("decimal.js");

const prisma = new PrismaClient();

function isFlowDue(flow, targetDate) {
    const start = new Date(flow.startDate);
    const target = new Date(targetDate);
    
    start.setDate(1);
    target.setDate(1);

    if (target < start) return false;

    const diffMonths = (target.getFullYear() - start.getFullYear()) * 12 + (target.getMonth() - start.getMonth());
    
    let isDue = false;
    switch (flow.frequency) {
        case 'MONTHLY': isDue = true; break;
        case 'QUARTERLY': isDue = diffMonths % 3 === 0; break;
        case 'SEMIANNUAL': isDue = diffMonths % 6 === 0; break;
        case 'ANNUAL': isDue = diffMonths % 12 === 0; break;
        case 'ONE_TIME': isDue = diffMonths === 0; break;
        default: isDue = true;
    }
    return { isDue, diffMonths };
}

async function runTest() {
    const flows = await prisma.recurringFlow.findMany({
        where: { isActive: true }
    });

    const now = new Date();
    // Use the same logic as the service
    const today = new Date(now.getFullYear(), now.getMonth(), 1);

    console.log(`Reference Month (M0): ${today.toLocaleDateString('en-US', {month: 'short', year: '2-digit'})}`);

    for (const flow of flows) {
        console.log(`\nFLOW: [${flow.name}] FREQ: [${flow.frequency}] START: [${flow.startDate.toISOString().split('T')[0]}]`);
        let output = "";
        for (let i = 0; i < 12; i++) {
            const projectionDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
            const result = isFlowDue(flow, projectionDate);
            const mon = projectionDate.toLocaleDateString('en-US', {month: 'short'});
            output += `${mon}: ${result.isDue ? "YES" : "NO "} | `;
        }
        console.log(output);
    }
    await prisma.$disconnect();
}

runTest();
