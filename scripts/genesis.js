const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const outputFile = path.join(projectRoot, 'GENESIS.md');

const sources = [
    { dir: 'ADR', title: '## Architecture Decision Records' },
    { dir: 'RedTeam', title: '## Red Team Reports' },
    { dir: 'Schema', title: '## Schemas & Blueprints' }
];

let content = `# Genesis: System Architecture & Security Log\n\nGenerated on: ${new Date().toISOString()}\n\n`;

sources.forEach(source => {
    const dirPath = path.join(projectRoot, source.dir);

    if (fs.existsSync(dirPath)) {
        content += `\n${source.title}\n\n`;

        const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.md') && !file.toLowerCase().includes('template'));

        if (files.length === 0) {
            content += `*No records found.*\n`;
        } else {
            files.forEach(file => {
                const filePath = path.join(dirPath, file);
                const fileContent = fs.readFileSync(filePath, 'utf8');
                content += `### ${file}\n\n${fileContent}\n\n---\n\n`;
            });
        }
    }
});

fs.writeFileSync(outputFile, content);
console.log(`✅ Genesis log generated at ${outputFile}`);
