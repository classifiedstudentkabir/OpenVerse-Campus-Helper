const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const outFile = path.join(rootDir, 'project_summary.txt');

// Configuration
const excludeDirs = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'out', 'coverage', '.turbo', '.cache', '.idea', '.vscode', '.vercel']);
const includeExts = new Set(['.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.css', '.scss', '.html', '.env.example', '.yml', '.yaml', '.prisma', '.sql']);
const maxSizeBytes = 300 * 1024; // 300KB
const maxLines = 200;

const outputStream = fs.createWriteStream(outFile, { encoding: 'utf8' });

function shouldInclude(name, isDirectory) {
    if (isDirectory) {
        return !excludeDirs.has(name);
    }
    return includeExts.has(path.extname(name).toLowerCase());
}

function generateTree(dir, prefix = '') {
    let items;
    try {
        items = fs.readdirSync(dir).sort();
    } catch (e) {
        return;
    }

    // Filter items first to handle last item logic correctly
    const filteredItems = items.filter(name => {
        try {
            const stat = fs.statSync(path.join(dir, name));
            return shouldInclude(name, stat.isDirectory());
        } catch (e) {
            return false;
        }
    });

    filteredItems.forEach((name, index) => {
        const fullPath = path.join(dir, name);
        const isLast = index === filteredItems.length - 1;
        const marker = isLast ? '└── ' : '├── ';
        
        outputStream.write(`${prefix}${marker}${name}\n`);
        
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            const nextPrefix = isLast ? prefix + '    ' : prefix + '│   ';
            generateTree(fullPath, nextPrefix);
        }
    });
}

function processFiles(dir) {
    let items;
    try {
        items = fs.readdirSync(dir).sort();
    } catch (e) {
        return;
    }

    items.forEach(name => {
        const fullPath = path.join(dir, name);
        let stat;
        try {
            stat = fs.statSync(fullPath);
        } catch (e) {
            return;
        }

        if (stat.isDirectory()) {
            if (!excludeDirs.has(name)) {
                processFiles(fullPath);
            }
        } else {
            if (includeExts.has(path.extname(name).toLowerCase())) {
                const relPath = path.relative(rootDir, fullPath);
                outputStream.write(`\n\n--------------------------------------------------------------------------------\n`);
                outputStream.write(`FILE: ${relPath}\n`);
                outputStream.write(`--------------------------------------------------------------------------------\n`);

                try {
                    if (stat.size > maxSizeBytes) {
                        // Read first X lines for large files
                        const content = fs.readFileSync(fullPath, 'utf8'); // Reading whole file to split is easier but memory intensive for HUGE files. 
                        // Given 300KB limit, reading sync is safe.
                        const lines = content.split(/\r?\n/);
                        const truncated = lines.slice(0, maxLines).join('\n');
                        outputStream.write(truncated);
                        outputStream.write(`\n... [File truncated: Size > 300KB, showing first ${maxLines} lines] ...\n`);
                    } else {
                        const content = fs.readFileSync(fullPath, 'utf8');
                        outputStream.write(content);
                    }
                } catch (err) {
                    outputStream.write(`[Error reading file: ${err.message}]\n`);
                }
            }
        }
    });
}

console.log('Generating Project Tree...');
outputStream.write('PROJECT STRUCTURE:\n==================\n.\n');
generateTree(rootDir);

console.log('Reading File Contents...');
outputStream.write('\n\nFILE CONTENTS:\n==============\n');
processFiles(rootDir);

outputStream.end(() => {
    console.log(`Done! Summary saved to: ${outFile}`);
});
