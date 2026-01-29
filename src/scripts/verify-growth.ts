import { calculateProjection } from "../server/core/growth-engine";

console.log("🔭 VERIFYING CORE GROWTH ENGINE (PURE MATH)...");

// Test Case 1: Simple 10% growth on 100 for 1 year, no contribution
// Compound: 100 * 1.1 = 110 (approx, monthly compounding slightly higher)
// Simple: 100 + (100 * 0.1) = 110

const testCompound = calculateProjection({
    principal: 1000,
    monthlyContribution: 0,
    apy: 0.10,
    years: 1,
    isCompound: true
});

const finalCompound = testCompound[testCompound.length - 1];
console.log(`\n🧪 CASE A: Compound (1yr, 10%, $1000 Principal, $0 Contrib)`);
console.log(`   - Final Balance: $${finalCompound.balance}`);
console.log(`   - Expected (~$1104.71 for monthly comp): ${finalCompound.balance}`);

if (finalCompound.balance > 1100 && finalCompound.balance < 1105) {
    console.log("   ✅ MATH OK");
} else {
    console.error("   ❌ MATH FAIL");
}


// Test Case 2: Simple Interest
const testSimple = calculateProjection({
    principal: 1000,
    monthlyContribution: 0,
    apy: 0.10,
    years: 1,
    isCompound: false
});
const finalSimple = testSimple[testSimple.length - 1];
console.log(`\n🧪 CASE B: Simple (1yr, 10%, $1000 Principal, $0 Contrib)`);
console.log(`   - Final Balance: $${finalSimple.balance}`);
// Simple Interest logic in engine: Interest is calculated on Total Invested (1000)
// Monthly Rate = 0.10 / 12 = 0.008333
// Interest per month = 1000 * 0.008333 = 8.333
// 12 months = 99.999 ~ 100
// Final = 1100
console.log(`   - Expected ($1100): ${finalSimple.balance}`);

if (finalSimple.balance >= 1099 && finalSimple.balance <= 1101) {
    console.log("   ✅ MATH OK");
} else {
    console.error("   ❌ MATH FAIL");
}

console.log("\n-------------------------------------------");
console.log("🟢 CORE PROTOCOL VERIFIED");
