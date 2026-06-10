import { initProgressionExplorer, updateExplorerForKey } from './src/components/progressionExplorer.js';
import { CIRCLE_OF_FIFTHS_KEYS } from './src/utils/noteConstants.js';

const keys = CIRCLE_OF_FIFTHS_KEYS;

const chordsByKey = {
  "C": ["C", "Dm", "Em", "F", "G", "Am", "Bdim"],
  "G": ["G", "Am", "Bm", "C", "D", "Em", "F#dim"],
  "D": ["D", "Em", "F#m", "G", "A", "Bm", "C#dim"],
  "A": ["A", "Bm", "C#m", "D", "E", "F#m", "G#dim"],
  "E": ["E", "F#m", "G#m", "A", "B", "C#m", "D#dim"],
  "B": ["B", "C#m", "D#m", "E", "F#", "G#m", "A#dim"],
  "Gb": ["Gb", "Abm", "Bbm", "Cb", "Db", "Ebm", "Fdim"],
  "Db": ["Db", "Ebm", "Fm", "Gb", "Ab", "Bbm", "Cdim"],
  "Ab": ["Ab", "Bbm", "Cm", "Db", "Eb", "Fm", "Gdim"],
  "Eb": ["Eb", "Fm", "Gm", "Ab", "Bb", "Cm", "Ddim"],
  "Bb": ["Bb", "Cm", "Dm", "Eb", "F", "Gm", "Adim"],
  "F": ["F", "Gm", "Am", "Bb", "C", "Dm", "Edim"]
};

const scaleByKey = {
  "C": "C D E F G A B",
  "G": "G A B C D E F#",
  "D": "D E F# G A B C#",
  "A": "A B C# D E F# G#",
  "E": "E F# G# A B C# D#",
  "B": "B C# D# E F# G# A#",
  "Gb": "Gb Ab Bb Cb Db Eb F",
  "Db": "Db Eb F Gb Ab Bb C",
  "Ab": "Ab Bb C Db Eb F G",
  "Eb": "Eb F G Ab Bb C D",
  "Bb": "Bb C D Eb F G A",
  "F": "F G A Bb C D E"
};

// Render Circle
const circle = document.getElementById("circle");
keys.forEach((key, i) => {
  const el = document.createElement("div");
  el.className = "key";
  el.innerText = key;
  el.style.transform = `rotate(${i * 30}deg) translateY(-150px) rotate(-${i * 30}deg)`;
  el.onclick = () => updateKey(key);
  circle.appendChild(el);
});

// Dropdown
const keySelect = document.getElementById("keySelect");
keys.forEach(k => {
  const opt = document.createElement("option");
  opt.value = k;
  opt.textContent = `${k} Major`;
  keySelect.appendChild(opt);
});
keySelect.onchange = e => updateKey(e.target.value);

// Random Key Button
document.getElementById("randomBtn").onclick = () => {
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  updateKey(randomKey);
};

// Update Display
function updateKey(key) {
  if (!chordsByKey[key]) {
    console.error(`[script] Invalid key "${key}" — not found in chord database`);
    return;
  }

  document.getElementById("keyTitle").textContent = `${key} Major`;
  keySelect.value = key;

  // Highlight selected key
  document.querySelectorAll(".key").forEach(el => {
    el.style.backgroundColor = el.innerText === key ? "#f5d7a0" : "#f9f2e4";
  });

  // Update Chords
  const chords = chordsByKey[key];
  const chordList = document.getElementById("chordList");
  chordList.innerHTML = "";
  chords.forEach((c, i) => {
    const div = document.createElement("div");
    div.className = "chord";
    div.innerHTML = `<b>${c}</b>`;
    chordList.appendChild(div);
  });

  // Update Scale
  document.getElementById("scaleText").textContent =
    `Scale: ${scaleByKey[key] || 'Unknown'}`;

  if (typeof updateExplorerForKey === 'function') {
    try {
      updateExplorerForKey(key);
    } catch (e) {
      console.error(`[script] Failed to update progression explorer for key "${key}":`, e);
    }
  }
}

// Default
try {
  if (typeof initProgressionExplorer === 'function') {
    initProgressionExplorer("progressionContainer");
  }
} catch (e) {
  console.error('[script] Failed to initialize progression explorer:', e);
}
updateKey("C");

