function isFlowDue(flow, targetDate) {
    const start = new Date(flow.startDate);
    const target = new Date(targetDate);
    
    start.setDate(1);
    target.setDate(1);

    if (target < start) return false;

    const diffMonths = (target.getFullYear() - start.getFullYear()) * 12 + (target.getMonth() - start.getMonth());
    
    let due = false;
    switch (flow.frequency) {
        case 'MONTHLY': due = true; break;
        case 'QUARTERLY': due = diffMonths % 3 === 0; break;
        case 'SEMIANNUAL': due = diffMonths % 6 === 0; break;
        case 'ANNUAL': due = diffMonths % 12 === 0; break;
        case 'ONE_TIME': due = diffMonths === 0; break;
        default: due = true;
    }
    return { due, diffMonths };
}

const testFlow = { name: "Test Semi", frequency: "SEMIANNUAL", startDate: "2026-05-01" };
const today = new Date("2026-04-08");

console.log("Testing SEMIANNUAL flow starting May 26");
for (let i = 0; i < 12; i++) {
    const projectionDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const result = isFlowDue(testFlow, projectionDate);
    const dateStr = projectionDate.toLocaleDateString('en-US', {month: 'short', year: '2-digit'});
    console.log(`${dateStr}: ${result.due ? "DUE" : "---"} (diff: ${result.diffMonths})`);
}
