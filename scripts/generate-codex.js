const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const outputFile = path.join(projectRoot, 'CODEX-DNA', 'CODEX.md');

// Ensure directory exists
if (!fs.existsSync(path.dirname(outputFile))) {
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
}

let content = `# CODEX: The DNA of Nomad Eagle\n\nGenerated on: ${new Date().toISOString()}\n\n`;

// 1. Project Metadata
content += `## 1. Organism Identity (Metadata)\n\n`;
try {
    const pkg = require('../package.json');
    content += `- **Name**: ${pkg.name}\n`;
    content += `- **Version**: ${pkg.version}\n`;
    content += `- **Dependencies**: \n\`\`\`json\n${JSON.stringify(pkg.dependencies, null, 2)}\n\`\`\`\n\n`;
} catch (e) {
    content += `*Could not read package.json*\n\n`;
}

// 2. Database Schema (DNA Structure)
content += `## 2. Structural DNA (Database Schema)\n\n`;
const schemaPath = path.join(projectRoot, 'prisma', 'schema.prisma');
if (fs.existsSync(schemaPath)) {
    content += `\`\`\`prisma\n${fs.readFileSync(schemaPath, 'utf8')}\n\`\`\`\n\n`;
} else {
    content += `*Schema not found at ${schemaPath}*\n\n`;
}

// 3. Server Actions (Metabolic Pathways)
content += `## 3. Metabolic Pathways (Server Actions)\n\n`;
const actionsDir = path.join(projectRoot, 'src', 'server', 'actions');
function scanActions(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            scanActions(filePath);
        } else if (file.endsWith('.ts')) {
            content += `### ${file}\n`;
            // specific simple regex to find export async function
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const functions = fileContent.match(/export async function \w+/g);
            if (functions) {
                functions.forEach(func => {
                    content += `- \`${func.replace('export async function ', '')}\`\n`;
                });
            }
            content += `\n`;
        }
    });
}
scanActions(actionsDir);

// 4. Incorporate Context/Protocols which defines the "Why"
content += `## 4. Governing Laws (Protocols)\n\n`;
const contextDir = path.join(projectRoot, 'context');
if (fs.existsSync(contextDir)) {
    const contextFiles = fs.readdirSync(contextDir).filter(f => f.endsWith('.txt') || f.endsWith('.md'));
    contextFiles.forEach(f => {
        content += `### ${f}\n\n`;
        content += fs.readFileSync(path.join(contextDir, f), 'utf8') + '\n\n---\n\n';
    });
}

// 5. File Structure
content += `## 5. Physical Structure (File Tree)\n\n\`\`\`\n`;
function scanTree(dir, prefix = '') {
    if (prefix.length > 20) return; // depth limit
    const files = fs.readdirSync(dir);
    files.forEach((file, index) => {
        if (['node_modules', '.next', '.git', '.gemini', 'tmp'].includes(file)) return;
        const isLast = index === files.length - 1;
        content += `${prefix}${isLast ? '└── ' : '├── '}${file}\n`;
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            scanTree(filePath, prefix + (isLast ? '    ' : '│   '));
        }
    });
}
scanTree(projectRoot);
content += `\`\`\`\n`;

fs.writeFileSync(outputFile, content);
console.log(`🧬 CODEX generated at ${outputFile}`);
