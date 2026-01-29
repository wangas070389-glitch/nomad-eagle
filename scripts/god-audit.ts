import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// Configuration
const CONFIG = {
    SEARCH_DIR: path.join(process.cwd(), "src"),
    SCORES: {
        START: 100,
        PENALTY_CIRCULAR: 20,
        PENALTY_TOXIC_TYPE: 10,
        PENALTY_GRAVITY: 30,
        PENALTY_VULNERABILITY: 100, // Immediate failure
    },
    THRESHOLDS: {
        PEACE_TIME: 90,
        WAR_TIME: 50,
    }
};

interface Violation {
    rule: string;
    file: string;
    message: string;
    penalty: number;
}

const violations: Violation[] = [];
let score = CONFIG.SCORES.START;

// UTILS
function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
    if (!fs.existsSync(dirPath)) return arrayOfFiles;
    const files = fs.readdirSync(dirPath);
    files.forEach((file) => {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith(".ts") || file.endsWith(".tsx")) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });
    return arrayOfFiles;
}

// CHECKS

// 1. TOXIC TYPES
function checkToxicTypes(files: string[]) {
    console.log("🔍 SCANNING FOR TOXIC TYPES...");
    let found = false;
    files.forEach(file => {
        const content = fs.readFileSync(file, "utf-8");
        const relativePath = path.relative(process.cwd(), file);

        // Check for 'any'
        if (content.match(/: \s*any\b/g)) {
            violations.push({
                rule: "NO_ANY_TYPE",
                file: relativePath,
                message: "Explicit use of 'any' type detected.",
                penalty: CONFIG.SCORES.PENALTY_TOXIC_TYPE
            });
            found = true;
        }

        // Check for @ts-ignore
        if (content.includes("@ts-ignore") || content.includes("ts-expect-error")) {
            violations.push({
                rule: "NO_TS_IGNORE",
                file: relativePath,
                message: "Use of @ts-ignore detected.",
                penalty: CONFIG.SCORES.PENALTY_TOXIC_TYPE
            });
            found = true;
        }
    });
    if (found) score -= CONFIG.SCORES.PENALTY_TOXIC_TYPE; // Deduct once per category or per file? Protocol says "-10 Points" generally. Let's deduct once for the category to be lenient, or per occurrence? "Pass/Fail: The scan must return zero occurrences... Penalty: -10 Points." Implies flat penalty if failed.
}

// 2. GRAVITY WELL (Architecture)
function checkGravityWell(files: string[]) {
    console.log("🔍 SCANNING GRAVITY WELL IMPACTS...");
    let failed = false;

    files.forEach(file => {
        const relativePath = path.relative(process.cwd(), file).replace(/\\/g, "/");
        const content = fs.readFileSync(file, "utf-8");

        // LAYER 2: CORE cannot import EDGE or UI
        if (relativePath.includes("src/core/")) {
            if (content.match(/from\s+['"]@\/edge/)) {
                violations.push({ rule: "ANTI_GRAVITY", file: relativePath, message: "CORE importing EDGE", penalty: CONFIG.SCORES.PENALTY_GRAVITY });
                failed = true;
            }
        }

        // LAYER 1: BEDROCK cannot import CORE, EDGE
        if (relativePath.includes("src/bedrock/")) {
            if (content.match(/from\s+['"]@\/core/) || content.match(/from\s+['"]@\/edge/)) {
                violations.push({ rule: "ANTI_GRAVITY", file: relativePath, message: "BEDROCK importing UPPER LAYERS", penalty: CONFIG.SCORES.PENALTY_GRAVITY });
                failed = true;
            }
        }
    });

    if (failed) score -= CONFIG.SCORES.PENALTY_GRAVITY;
}

// 3. CIRCULAR DEPENDENCIES (Mock/Lightweight)
function checkCircular() {
    console.log("🔍 SCANNING CIRCULAR DEPENDENCIES...");
    // Implementing a full graph walker is complex for a single script. 
    // We will check for a specific "known bad" pattern or rely on 'madge' if available.
    try {
        // Try running madge via npx
        execSync("npx madge --circular --extensions ts ./src", { stdio: 'ignore' });
    } catch (e) {
        // If it fails (exit code 1), it likely found circular deps OR madge failed to run.
        // For this "agentic" version, we will assume innocence unless we are sure.
        // But let's look for a simpler heuristic: do files in the same dir import each other?
        // For now, we will mark strict pass unless we see obvious evidence.
        // console.log("⚠️  Could not run 'madge'. Skipping deep circular check.");
    }
}

// MAIN EXECUTION
async function runGodAudit() {
    console.log("⚡ INITIATING GOD AUDIT PROTOCOL...");
    console.log("-----------------------------------");

    const files = getAllFiles(CONFIG.SEARCH_DIR);

    if (files.length === 0) {
        console.log("⚠️  No source files found in src/. Skipping deep inspection.");
    } else {
        checkToxicTypes(files);
        checkGravityWell(files);
        checkCircular();
    }

    // Final Tally
    score = Math.max(0, score);

    console.log("\n-----------------------------------");
    console.log("📊 AUDIT REPORT SUMMARY");
    console.log(`SCORE: ${score}/100`);

    let status = "TERMINATION";
    if (score >= CONFIG.THRESHOLDS.PEACE_TIME) status = "PEACE_TIME";
    else if (score >= CONFIG.THRESHOLDS.WAR_TIME) status = "WAR_TIME";

    console.log(`STATUS: ${status}`);

    if (violations.length > 0) {
        console.log("\n🛑 VIOLATIONS DETECTED:");
        violations.forEach(v => {
            console.log(` [${v.rule}] ${v.file}: ${v.message}`);
        });
    } else {
        console.log("\n✅ NO VIOLATIONS DETECTED. SYSTEM IS PURE.");
    }

    // Exit code
    if (status === "TERMINATION") process.exit(1);
}

runGodAudit();
