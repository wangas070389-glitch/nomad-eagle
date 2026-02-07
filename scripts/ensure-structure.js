const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

const structure = {
    directories: [
        'ADR',
        'RedTeam',
        'Schema'
    ],
    files: [
        {
            path: 'ADR/template.md',
            content: `# [Short Title]\n\nDate: [YYYY-MM-DD]\n\n## Status\n\n[Propsoed | Accepted | Deprecated | Superseded]\n\n## Context\n\n[Describe the context and problem statement, e.g., technical, business, or project constraints.]\n\n## Decision\n\n[Describe the decision. Be explicit and direct.]\n\n## Consequences\n\n[Describe the resulting context, after applying the decision. All consequences should be listed here, not just the "positive" ones.]\n`
        },
        {
            path: 'RedTeam/template.md',
            content: `# [Short Title of Vulnerability/Attack]\n\nDate: [YYYY-MM-DD]\n\n## Status\n\n[IDENTIFIED | EXPLOITED | MITIGATED | ACCEPTED]\n\n## Context\n\n[Describe the vulnerability, attack vector, or security weakness found. Include severity and potential impact.]\n\n## Decision/Mitigation\n\n[Describe the action taken to mitigate or accept the risk. Link to specific protocol updates or code changes.]\n\n## Consequences\n\n[Describe the residual risk, side effects of the mitigation, or required follow-up actions.]\n`
        },
        {
            path: 'Schema/README.md',
            content: `# Schema & Blueprints\n\nThis directory contains the schematics and blueprints for the application. \n\n## Structure\n\n- **Schematics**: Technical diagrams, data flow charts, and component hierarchies.\n- **Blueprints**: Architectural plans, UI flows, and high-level design documents.\n`
        }
    ]
};

console.log('🔍 Checking project structure...');

// Check and create directories
structure.directories.forEach(dir => {
    const dirPath = path.join(projectRoot, dir);
    if (!fs.existsSync(dirPath)) {
        console.log(`❌ Missing directory: ${dir}. Creating...`);
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
    } else {
        console.log(`✅ Directory exists: ${dir}`);
    }
});

// Check and create files
structure.files.forEach(file => {
    const filePath = path.join(projectRoot, file.path);
    if (!fs.existsSync(filePath)) {
        console.log(`❌ Missing file: ${file.path}. Creating...`);
        fs.writeFileSync(filePath, file.content);
        console.log(`✅ Created file: ${file.path}`);
    } else {
        console.log(`✅ File exists: ${file.path}`);
    }
});

console.log('✨ Structure verification complete.');
