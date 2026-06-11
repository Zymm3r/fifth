const fs = require('fs');

let code = fs.readFileSync('src/components/progressionExplorer.js', 'utf8');

// 1. Add safeClosest helper
const safeClosestCode = `
/**
 * Safe wrapper for Element.closest() that handles TextNodes and missing methods.
 * @param {EventTarget} target 
 * @param {string} selector 
 * @returns {Element|null}
 */
function safeClosest(target, selector) {
  if (!target) return null;
  let el = target.nodeType === 3 ? target.parentElement : target;
  if (!el || typeof el.closest !== 'function') return null;
  return el.closest(selector);
}
`;

// Insert it after escapeAttr
code = code.replace(/function escapeAttr.*?\n\}/s, match => match + '\n' + safeClosestCode);

// 2. Replace all .closest usages
code = code.replace(/e\.target\.closest/g, 'safeClosest(e.target, ');
// The regex would turn `e.target.closest('.cls')` into `safeClosest(e.target, ('.cls')` which is WRONG!
// Let's just do simple string replacements for the 3 occurrences.
code = code.replace("const btn = e.target.closest('.progression-chord-btn, .related-chord-btn');", "const btn = safeClosest(e.target, '.progression-chord-btn, .related-chord-btn');");
code = code.replace("const btn = e.target.closest('.progression-chord-btn');", "const btn = safeClosest(e.target, '.progression-chord-btn');");

// 3. Remove getChordFingeringInternal and use getChordFingering
const getChordFingeringInternalCodeRegex = /function getChordFingeringInternal[\s\S]*?return strings \|\| null;\n\}/;
code = code.replace(getChordFingeringInternalCodeRegex, '');
code = code.replace('window.__getChordFingering = getChordFingeringInternal;', 'window.__getChordFingering = getChordFingering;');

fs.writeFileSync('src/components/progressionExplorer.js', code);
console.log('Fixed closest and getChordFingeringInternal');
