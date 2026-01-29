import fs from "fs";
import path from "path";

const REQUIRED_PROTOCOLS = {
  NEXUS: [
    "audit.config.ts",
    "strategy.config.ts",
    "metamorphosis.config.ts",
  ],
  OMEGA: [
    "topology.config.ts",
    "bedrock.config.ts",
    "core.config.ts",
    "edge.config.ts",
    "agentic.config.ts",
  ],
  NARCISO: ["physics.config.ts", "mirror.config.ts", "morph.config.ts"],
  GHOST: [
    "shield.config.ts",
    "telemetry.config.ts",
    "babel.config.ts",
    "deployment.config.ts",
  ],
};

async function runIgnition() {
  console.log("🚀 INITIALIZING THE SINGULARITY IGNITION...");
  console.log("------------------------------------------");
  let totalProtocols = 0;
  let detectedProtocols = 0;
  const missing: string[] = [];

  for (const [pillar, files] of Object.entries(REQUIRED_PROTOCOLS)) {
    console.log(`\n🔍 SCANNING PILLAR: ${pillar}`);
    let pillarScore = 0;
    files.forEach((file) => {
      totalProtocols++;
      // Check root and src/
      const exists =
        fs.existsSync(path.join(process.cwd(), file)) ||
        fs.existsSync(path.join(process.cwd(), "src", file));
      if (exists) {
        console.log(` ✅ [OK] ${file}`);
        detectedProtocols++;
        pillarScore++;
      } else {
        console.log(` ❌ [MISSING] ${file}`);
        missing.push(file);
      }
    });
    const pillarPercent = ((pillarScore / files.length) * 100).toFixed(0);
    console.log(`📊 PILLAR COMPLIANCE: ${pillarPercent}%`);
  }

  const finalScore = ((detectedProtocols / totalProtocols) * 100).toFixed(0);
  console.log("\n------------------------------------------");
  console.log(`🏁 FINAL SINGULARITY SCORE: ${finalScore}%`);

  if (parseInt(finalScore) >= 90) {
    console.log("🟢 STATUS: PEACE_TIME. YOU ARE AUTHORIZED TO BUILD.");
  } else if (parseInt(finalScore) >= 50) {
    console.log(
      "🟡 STATUS: WAR_TIME. FEATURE FREEZE RECOMMENDED. REFACTOR IMMEDIATELY."
    );
  } else {
    console.log("🔴 STATUS: TERMINATION. SYSTEM IS INCOHERENT.");
  }

  if (missing.length > 0) {
    console.log("\n📝 MISSING ARTIFACTS TO REACH 100%:");
    missing.forEach((m) => console.log(` - ${m}`));
  }
}

runIgnition().catch(console.error);
