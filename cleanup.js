const fs = require('fs');

let code = fs.readFileSync('src/components/progressionExplorer.js', 'utf8');

// Fix syntax error from safeClosest regex injection
code = code.replace(/safeClosest\(e\.target, \('\.progression-chord-btn, \.related-chord-btn'\);/g, "safeClosest(e.target, '.progression-chord-btn, .related-chord-btn');");

// Ensure global variables are removed or replaced properly
code = code.replace(/window\.__getAllTransposedProgressions \? window\.__getAllTransposedProgressions\(key\) : \[\]/g, 'getAllTransposedProgressions(key)');
code = code.replace(/window\.__getChordFingering\(/g, 'getChordFingering(');
code = code.replace(/import \{ getAllTransposedProgressions as _getAllTransposedProgressions \} from '\.\.\/utils\/progressionTransposer\.js';\nwindow\.__getAllTransposedProgressions = _getAllTransposedProgressions;\n\n/g, '');

// Clean up left over getChordFingeringInternal
code = code.replace(/function getChordFingeringInternal[\s\S]*?return strings \|\| null;\n\}/g, '');
code = code.replace(/window\.__getChordFingering = getChordFingeringInternal;/g, '');
code = code.replace(/window\.__getChordFingering = getChordFingering;/g, '');
code = code.replace(/window\.__showChordDetail = showChordDetail;/g, '');

fs.writeFileSync('src/components/progressionExplorer.js', code);
console.log('Cleanup applied');
