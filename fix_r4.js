const fs = require('fs');

let code = fs.readFileSync('src/components/progressionExplorer.js', 'utf8');

// 1. Add imports at the top
const imports = `import { initializeAudio, playGuitarChord, playProgression, stopProgression } from '../utils/audioPlayer.js';\n`;
code = code.replace(/import \{ getBarreChordInfo \}.*?;/, match => match + '\n' + imports);

// We need to remove the old guitarAudio.js imports if they exist since we are replacing it
code = code.replace(/import \{ ensureAudioStarted, playChordStrum, stopAllNotes \}.*?;\n/g, '');

// 2. Add Audio Unlock event listener near the top
const unlockAudioCode = `\n// Unlock audio on first user interaction\ndocument.addEventListener('pointerdown', initializeAudio, { once: true });\n`;
code = code.replace(/let currentKey = 'C';/, match => match + '\n' + unlockAudioCode);

// 3. Add Play Progression button to cards in renderProgressions
code = code.replace(
  '<h4 class="progression-card__name">${progression.name}</h4>', 
  '<h4 class="progression-card__name">${progression.name}</h4>\n          <button class="play-progression-btn" data-progression-id="${escapeAttr(progression.id)}" aria-label="Play progression">▶ Play</button>'
);

// 4. Add 🔊 Play Chord button in chord modal
code = code.replace(
  '<h2 id="chordModalTitle" class="chord-detail__name">${chordName}${enharmonicText}</h2>',
  '<h2 id="chordModalTitle" class="chord-detail__name">${chordName}${enharmonicText}</h2>\n        <button id="modalPlayChordBtn" class="play-chord-btn" aria-label="Play chord ${chordName}">🔊 Play</button>'
);

// 5. Update click handlers
const btnClickLogic = `
  const playProgressionBtn = safeClosest(e.target, '.play-progression-btn');
  if (playProgressionBtn) {
    const progId = playProgressionBtn.getAttribute('data-progression-id');
    // We need to find the chords for this progression
    const key = currentKey;
    const transposed = window.__getAllTransposedProgressions ? window.__getAllTransposedProgressions(key) : [];
    const progData = transposed.find(t => t.progression.id === progId);
    if (progData) {
      const chordsToPlay = progData.chords.map(c => ({
         chordName: c,
         strings: window.__getChordFingering(c) || []
      }));
      playProgression(chordsToPlay);
    }
    return;
  }
  
  const modalPlayBtn = safeClosest(e.target, '#modalPlayChordBtn');
  if (modalPlayBtn) {
    const titleEl = document.getElementById('chordModalTitle');
    if (titleEl) {
      // remove enharmonic text if any
      const chordNameText = titleEl.textContent.split('(')[0].trim();
      const strings = window.__getChordFingering(chordNameText);
      if (strings) playGuitarChord(chordNameText, strings);
    }
    return;
  }

  const svgDiagram = safeClosest(e.target, '.chord-svg, .barre-diagram__visual');
  if (svgDiagram) {
    const chordNameAttr = safeClosest(e.target, '.progression-chord-btn')?.getAttribute('data-chord') || 
                          safeClosest(e.target, '.barre-diagram')?.querySelector('.barre-diagram__title')?.textContent?.split('(')[0].trim();
    if (chordNameAttr) {
      const strings = window.__getChordFingering(chordNameAttr);
      if (strings) playGuitarChord(chordNameAttr, strings);
    }
    // Prevent event from triggering the modal if we clicked the SVG
    if (safeClosest(e.target, '.chord-svg')) {
      e.stopPropagation();
      return;
    }
  }
`;

code = code.replace(
  /const btn = safeClosest\(e\.target, '\.progression-chord-btn, \.related-chord-btn'\);/,
  match => btnClickLogic + '\n  ' + match
);

// We need to expose getAllTransposedProgressions for the click handler
code = code.replace(
  /export function updateExplorerForKey\(newKey\)/,
  `import { getAllTransposedProgressions as _getAllTransposedProgressions } from '../utils/progressionTransposer.js';\nwindow.__getAllTransposedProgressions = _getAllTransposedProgressions;\n\nexport function updateExplorerForKey(newKey)`
);

// Remove the old popup audio hover logic since the user requirement doesn't mention it and it was messy.
code = code.replace(/\/\/ --- Guitar Audio Popup Hover ---[\s\S]*$/, '');

fs.writeFileSync('src/components/progressionExplorer.js', code);
console.log('progressionExplorer.js updated!');
