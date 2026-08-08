const fs = require('fs');
const path = require('path');

function replaceInDir(dir, replacements) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInDir(fullPath, replacements);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;
            for (const { from, to } of replacements) {
                if (content.includes(from)) {
                    content = content.replaceAll(from, to);
                    modified = true;
                }
            }
            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
            }
        }
    }
}

const replacements = [
    { from: 'amber-500', to: '[#d19e44]' },
    { from: 'amber-600', to: '[#d19e44]' },
    { from: 'amber-400', to: '[#d19e44]' },
    { from: 'amber-700', to: '[#d19e44]' },
    { from: 'amber-300', to: '[#d19e44]' },
    // Handle specific full tailwind classes with hover/bg/text prefixes if needed
];

replaceInDir('src', replacements);
console.log('Replaced colors inside src/');
