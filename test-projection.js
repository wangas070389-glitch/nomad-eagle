const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan2', 'Feb2'];

function isFlowDue(flow, targetDate) {
    const start = new Date(flow.startDate);
    const target = new Date(targetDate);
    
    start.setDate(1);
    target.setDate(1);

    if (target < start) return false;

    const diffMonths = (target.getFullYear() - start.getFullYear()) * 12 + (target.getMonth() - start.getMonth());
    
    switch (flow.frequency) {
        case 'MONTHLY': return true;
        case 'QUARTERLY': return diffMonths % 3 === 0;
        case 'SEMIANNUAL': return diffMonths % 6 === 0;
        case 'ANNUAL': return diffMonths % 12 === 0;
        case 'ONE_TIME': return diffMonths === 0;
        default: return true;
    }
}

const testFlow = { name: "Test Semi", frequency: "SEMIANNUAL", startDate: "2026-05-01" };
const today = new Date("2026-04-08");

console.log(`Flow: ${testFlow.name}, Start: ${testFlow.startDate}, Frequency: ${testFlow.frequency}`);
for (let i = 0; i < 12; i++) {
    const projectionDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const due = isFlowDue(testFlow, projectionDate);
    console.log(`${projectionDate.toLocaleDateString('en-US', {month: 'short', year: '2-digit'})}: ${due ? "DUE" : "---"}`);
}
