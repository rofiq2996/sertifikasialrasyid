const fs = require('fs');
const path = require('path');

function replaceInDir(dir, regex, replacer) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInDir(fullPath, regex, replacer);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let newContent = content.replace(regex, replacer);
            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
            }
        }
    }
}

// match amber- and orange-
const regex = /(?:text|bg|border|ring|fill|from|via|to)-(?:amber|orange)-(50|100|200|300|400|500|600|700|800|900|950)\b(\/\d+)?/g;
replaceInDir('src', regex, (match, shade, opacity) => {
    let prefix = match.split(/-(?:amber|orange)-/)[0]; // text, bg, border...

    if (opacity) {
        return `${prefix}-[#d19e44]${opacity}`;
    }

    if (shade === '50') return `${prefix}-[#d19e44]/10`;
    if (shade === '100') return `${prefix}-[#d19e44]/20`;
    if (shade === '200') return `${prefix}-[#d19e44]/30`;
    if (shade === '300') return `${prefix}-[#d19e44]/70`;
    if (shade === '400') return `${prefix}-[#d19e44]`;
    if (shade === '500') return `${prefix}-[#d19e44]`;
    if (shade === '600') return `${prefix}-[#d19e44]`;
    if (shade === '700') return `${prefix}-[#d19e44]`;
    if (shade === '800') return `${prefix}-[#d19e44]/90`;
    if (shade === '900') return `${prefix}-[#d19e44]/80`;
    if (shade === '950') return `${prefix}-[#d19e44]/70`;
    return match;
});

console.log('Replaced amber and orange colors inside src/');
