import { initProgressionExplorer, updateExplorerForKey } from './src/components/progressionExplorer.js';
import { CIRCLE_OF_FIFTHS_KEYS } from './src/utils/noteConstants.js';
import { initializeAudio, playGuitarChord } from './src/utils/audioPlayer.js';
import { getChordFingering } from './src/utils/chordLookup.js';

function safeClosest(target, selector) {
  if (!target) return null;
  let el = target.nodeType === 3 ? target.parentElement : target;
  if (!el || typeof el.closest !== 'function') return null;
  return el.closest(selector);
}


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

// ─────────────────────────────────────────────────────────
// Axis Progression Color System
// Maps each scale degree (0-6) to its harmonic function
// ─────────────────────────────────────────────────────────
const AXIS_COLORS = [
  { roman: 'I',    fn: 'tonic',        label: 'Tonic' },
  { roman: 'ii',   fn: 'predominant',  label: 'Predominant' },
  { roman: 'iii',  fn: 'tonic',        label: 'Tonic' },
  { roman: 'IV',   fn: 'predominant',  label: 'Predominant' },
  { roman: 'V',    fn: 'dominant',     label: 'Dominant' },
  { roman: 'vi',   fn: 'tonic',        label: 'Tonic' },
  { roman: 'vii°', fn: 'dominant',     label: 'Dominant' }
];

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

// ─────────────────────────────────────────────────────────
// Hover-to-Play Audio for Diatonic Chord Buttons
// ─────────────────────────────────────────────────────────

/** @type {boolean} Whether audio has been initialized */
let audioReady = false;

/** @type {number|null} Debounce timer for chord hover */
let hoverDebounceTimer = null;

/**
 * Initialize audio on first user interaction.
 * Must be triggered from a genuine user gesture event.
 */
async function initAudioOnInteraction() {
  if (audioReady) return;
  try {
    await initializeAudio();
    audioReady = true;
  } catch (e) {
    console.warn('[script] Failed to initialize audio:', e);
  }
}

/**
 * Play a chord strum with debounce (prevents rapid-fire audio).
 * @param {string} chordName - The chord to play
 */
function playChordWithDebounce(chordName) {
  if (hoverDebounceTimer) {
    clearTimeout(hoverDebounceTimer);
  }
  hoverDebounceTimer = setTimeout(() => {
    if (audioReady) {
      const strings = getChordFingering(chordName);
      if (strings) playGuitarChord(chordName, strings);
    }
    hoverDebounceTimer = null;
  }, 120);
}

// Event delegation for hover-to-play on diatonic chords (#chordList)
document.addEventListener('mouseenter', async (e) => {
  const chordDiv = safeClosest(e.target, '#chordList .chord');
  if (!chordDiv) return;

  // Initialize audio on first hover (user gesture)
  await initAudioOnInteraction();

  // Extract chord name from the bold text
  const chordName = chordDiv.querySelector('b')?.textContent?.trim();
  if (chordName) {
    playChordWithDebounce(chordName);
  }
}, true);

// ─────────────────────────────────────────────────────────
// Update Display
// ─────────────────────────────────────────────────────────
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

  // Update Chords with Axis Progression Colors
  const chords = chordsByKey[key];
  const chordList = document.getElementById("chordList");
  chordList.innerHTML = "";
  chords.forEach((c, i) => {
    const div = document.createElement("div");
    const axisInfo = AXIS_COLORS[i];
    
    // Apply Axis color class
    div.className = `chord chord--${axisInfo.fn}`;
    div.setAttribute('aria-label', `${c} chord — ${axisInfo.label} (${axisInfo.roman})`);
    div.setAttribute('data-chord', c);
    div.setAttribute('tabindex', '0');
    
    // Chord name
    const b = document.createElement("b");
    b.textContent = c;
    div.appendChild(b);
    
    // Roman numeral label
    const romanSpan = document.createElement("span");
    romanSpan.className = "chord__roman";
    romanSpan.textContent = axisInfo.roman;
    div.appendChild(romanSpan);
    
    // Axis color dot
    const dot = document.createElement("span");
    dot.className = `chord__axis-dot chord__axis-dot--${axisInfo.fn}`;
    dot.title = axisInfo.label;
    div.appendChild(dot);
    
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
