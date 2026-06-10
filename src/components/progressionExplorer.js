/**
 * @fileoverview Chord Progression Explorer Component
 * Displays popular chord progressions with automatic transposition,
 * song examples, and barre chord information.
 * Handles keyboard navigation and accessibility.
 */

import PROGRESSIONS from '../data/progressions.js';
import SONG_EXAMPLES from '../data/songExamples.js';
import { getAllTransposedProgressions, transposeProgression } from '../utils/progressionTransposer.js';
import { getRelativeKey, getParallelKey, getCircleNeighbors, getChordFunction, getScaleDegreeName, getSecondaryDominant } from '../utils/musicTheory.js';
import { getBarreChordInfo } from '../data/barreChords.js';
import { ensureAudioStarted, playChordStrum, stopAllNotes } from '../utils/guitarAudio.js';
import { getChordFingering } from '../utils/chordLookup.js';
import { ENHARMONIC_MAP } from '../utils/noteConstants.js';

/**
 * Escape a string for safe insertion into HTML attributes.
 * Prevents DOM XSS via attribute injection.
 * @param {string} str
 * @returns {string}
 */
function escapeAttr(str) {
  return String(str).replace(/&/g, '&amp;').replace(/'/g, '&#39;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** @type {string|null} Currently focused chord for accessibility */
let focusedChordId = null;

/** @type {string} Current active key */
let currentKey = 'C';

/**
 * Initialize the progression explorer panel.
 * @param {string} containerId - ID of the container element
 */
export function initProgressionExplorer(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`[progressionExplorer] Container element "#${containerId}" not found in DOM \u2014 cannot initialize explorer`);
    return;
  }

  try {
    container.innerHTML = buildExplorerHTML();
    container.classList.add('progression-explorer');
  } catch (e) {
    console.error('[progressionExplorer] Failed to render explorer HTML:', e);
    container.innerHTML = '<p class="progression-explorer__error">Failed to load chord progressions. Please refresh the page.</p>';
  }
}

/**
 * Build the main explorer HTML structure.
 * @returns {string}
 */
function buildExplorerHTML() {
  return `
    <div class="progression-explorer__header">
      <h3 class="progression-explorer__title" tabindex="0" aria-label="Chord Progression Explorer">
        🎸 Chord Progression Explorer
      </h3>
      <p class="progression-explorer__subtitle">
        Popular progressions automatically transposed to your selected key
      </p>
    </div>

    <div class="progression-explorer__grid" id="progressionGrid" role="list" aria-label="Chord progressions">
      ${renderProgressions(currentKey)}
    </div>

    <div class="progression-explorer__theory" id="theoryPanel" role="region" aria-label="Music theory helpers">
      ${renderTheoryPanel()}
    </div>

    <!-- Modal overlay for chord details -->
    <div class="chord-modal__overlay" id="chordModalOverlay" role="dialog" aria-modal="true" aria-labelledby="chordModalTitle" hidden>
      <div class="chord-modal__content" id="chordModalContent">
        <button class="chord-modal__close" id="chordModalClose" aria-label="Close chord details">&times;</button>
        <div id="chordModalBody"></div>
      </div>
    </div>
  `;
}

/**
 * Render all progressions as cards.
 * @param {string} key - Current musical key
 * @returns {string}
 */
function renderProgressions(key) {
  const transposed = getAllTransposedProgressions(key);

  return transposed.map(({ progression, chords, romanNumerals }) => {
    const songData = SONG_EXAMPLES.find(s => s.progressionId === progression.id);
    const chordDisplay = chords.map((chord, idx) => `
      <button class="progression-chord-btn" 
              data-chord="${escapeAttr(chord)}" 
              data-roman="${escapeAttr(romanNumerals[idx])}"
              data-key="${escapeAttr(key)}"
              data-progression-id="${escapeAttr(progression.id)}"
              aria-label="${escapeAttr(chord)} chord"
              tabindex="0">
        <span class="chord-name">${escapeAttr(chord)}</span>
        <span class="chord-svg">${renderChordDiagram(chord)}</span>
      </button>
    `).join('');

    const songList = songData?.songs?.slice(0, 3).map(s => `
      <li class="song-example" title="${s.album ? `Album: ${escapeAttr(s.album)}` : ''}">
        <span class="song-title">${escapeAttr(s.title)}</span>
        <span class="song-artist">${escapeAttr(s.artist)}</span>
        ${s.year ? `<span class="song-year">(${escapeAttr(String(s.year))})</span>` : ''}
      </li>
    `).join('') || '<li class="song-example--none">No examples loaded</li>';

    return `
      <article class="progression-card" role="listitem" aria-label="${progression.name} progression">
        <div class="progression-card__header">
          <span class="progression-card__badge progression-card__badge--${progression.style.toLowerCase().replace(/[^a-z]/g, '')}">${progression.style}</span>
          <h4 class="progression-card__name">${progression.name}</h4>
          <span class="progression-card__quality">${progression.quality}</span>
        </div>

        <div class="progression-card__pattern" role="group" aria-label="Chords: ${chords.join(', ')}">
          ${chordDisplay}
        </div>

        <p class="progression-card__desc">${progression.description}</p>

        ${songList ? `
        <div class="progression-card__songs">
          <p class="progression-card__songs-title">🎵 Song Examples</p>
          <ul class="song-list">${songList}</ul>
          ${songData?.songs?.length > 3 ? `<p class="song-list__more">+${songData.songs.length - 3} more songs</p>` : ''}
        </div>
        ` : ''}
      </article>
    `;
  }).join('');
}

/**
 * Render music theory helper panel.
 * @returns {string}
 */
function renderTheoryPanel() {
  if (!currentKey) return '';

  const relativeKey = getRelativeKey(currentKey);
  const parallelKey = getParallelKey(currentKey);
  const neighbors = getCircleNeighbors(currentKey);

  const isMajor = currentKey.length <= 2 && !currentKey.endsWith('m');

  return `
    <div class="theory-helpers">
      <h4 class="theory-helpers__title">🔍 Music Theory Helpers — <strong>${currentKey} ${isMajor ? 'Major' : 'Minor'}</strong></h4>
      <div class="theory-helpers__grid">
        <div class="theory-helper-card" tabindex="0" aria-label="Relative key: ${relativeKey || 'N/A'}">
          <span class="theory-helper-card__label">Relative ${isMajor ? 'Minor' : 'Major'}</span>
          <span class="theory-helper-card__value">${relativeKey || 'N/A'}</span>
        </div>
        <div class="theory-helper-card" tabindex="0" aria-label="Parallel key: ${parallelKey || 'N/A'}">
          <span class="theory-helper-card__label">Parallel ${isMajor ? 'Minor' : 'Major'}</span>
          <span class="theory-helper-card__value">${parallelKey || 'N/A'}</span>
        </div>
        <div class="theory-helper-card" tabindex="0" aria-label="Circle neighbor clockwise: ${neighbors.clockwise || 'N/A'}">
          <span class="theory-helper-card__label">Circle (CW)</span>
          <span class="theory-helper-card__value">${neighbors.clockwise || 'N/A'}</span>
        </div>
        <div class="theory-helper-card" tabindex="0" aria-label="Circle neighbor counterclockwise: ${neighbors.counterclockwise || 'N/A'}">
          <span class="theory-helper-card__label">Circle (CCW)</span>
          <span class="theory-helper-card__value">${neighbors.counterclockwise || 'N/A'}</span>
        </div>
        <div class="theory-helper-card" tabindex="0" aria-label="Secondary dominant example: V/V">
          <span class="theory-helper-card__label">Secondary Dominant</span>
          <span class="theory-helper-card__value">V/${isMajor ? 'ii' : 'III'}</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Show chord detail modal with full information.
 * @param {string} chordName - e.g. "F", "Dm"
 * @param {string} romanNumeral - e.g. "I", "ii"
 * @param {string} key - Current key
 */
export function showChordDetail(chordName, romanNumeral, key) {
  const modalOverlay = document.getElementById('chordModalOverlay');
  const modalBody = document.getElementById('chordModalBody');

  if (!modalOverlay || !modalBody) {
    console.error(`[progressionExplorer] Cannot show chord detail: modal elements missing from DOM`);
    return;
  }

  // Get barre chord info
  const barreInfo = getBarreChordInfo(chordName);
  const function_ = getChordFunction(romanNumeral);
  const scaleDegreeName = getScaleDegreeName(romanNumeral);
  const secondaryDominant = getSecondaryDominant(romanNumeral);

  // Get related chords (same key chords)
  const transposed = getAllTransposedProgressions(key);
  const relatedChords = transposed
    .flatMap(t => t.chords)
    .filter((c, idx, arr) => arr.indexOf(c) === idx && c !== chordName)
    .slice(0, 6);

  let enharmonicText = '';
  const rootMatch = chordName.match(/^[A-G][#b]?/);
  if (rootMatch && ENHARMONIC_MAP[rootMatch[0]]) {
    const enharmonicChord = chordName.replace(rootMatch[0], ENHARMONIC_MAP[rootMatch[0]]);
    enharmonicText = ` <span style="font-size: 1.2rem; color: #888; font-weight: normal;">(${chordName} = ${enharmonicChord})</span>`;
  }

  modalBody.innerHTML = `
    <div class="chord-detail">
      <div class="chord-detail__header">
        <h2 id="chordModalTitle" class="chord-detail__name">${chordName}${enharmonicText}</h2>
        <span class="chord-detail__roman">${romanNumeral}</span>
        <span class="chord-detail__function chord-detail__function--${function_}">${function_.charAt(0).toUpperCase() + function_.slice(1)}</span>
      </div>

      <div class="chord-detail__info-grid">
        ${barreInfo ? `
        <div class="chord-detail__info-card">
          <span class="chord-detail__info-label">Root Note</span>
          <span class="chord-detail__info-value">${barreInfo.rootNote}</span>
        </div>
        <div class="chord-detail__info-card">
          <span class="chord-detail__info-label">Quality</span>
          <span class="chord-detail__info-value">${barreInfo.quality}</span>
        </div>
        <div class="chord-detail__info-card">
          <span class="chord-detail__info-label">Barre Type</span>
          <span class="chord-detail__info-value">${barreInfo.barreType}</span>
        </div>
        <div class="chord-detail__info-card">
          <span class="chord-detail__info-label">Fret Position</span>
          <span class="chord-detail__info-value">Fret ${barreInfo.fretPosition}</span>
        </div>
        ` : ''}
        <div class="chord-detail__info-card">
          <span class="chord-detail__info-label">Scale Degree</span>
          <span class="chord-detail__info-value">${scaleDegreeName}</span>
        </div>
        <div class="chord-detail__info-card">
          <span class="chord-detail__info-label">Secondary Dominant</span>
          <span class="chord-detail__info-value">${secondaryDominant}</span>
        </div>
      </div>

      ${barreInfo ? `
      <div class="chord-detail__notes-section">
        <div class="chord-detail__notes-block">
          <h4>Notes</h4>
          <div class="chord-detail__notes-list">
            ${barreInfo.notes.map(n => `<span class="note-tag">${n}</span>`).join('')}
          </div>
        </div>
        <div class="chord-detail__notes-block">
          <h4>Intervals</h4>
          <div class="chord-detail__notes-list">
            ${barreInfo.intervals.map(i => `<span class="interval-tag">${i}</span>`).join('')}
          </div>
        </div>
      </div>
      ` : ''}

      ${barreInfo ? `
      <div class="chord-detail__diagram">
        <h4>Barre Chord Diagram</h4>
        <div class="chord-detail__diagram-placeholder" aria-label="Barre chord diagram for ${chordName}">
          <div class="barre-diagram">
            <span class="barre-diagram__title">${chordName}${enharmonicText}</span>
            <span class="barre-diagram__shape">${barreInfo.barreType}</span>
            <span class="barre-diagram__fret">Fret ${barreInfo.fretPosition}</span>
            <div class="barre-diagram__visual">
              ${renderChordDiagram(chordName)}
            </div>
          </div>
        </div>
      </div>
      ` : ''}

      <div class="chord-detail__related">
        <h4>Related Chords</h4>
        <div class="chord-detail__related-list">
          ${relatedChords.map(c => `
            <button class="related-chord-btn"
                    data-chord="${escapeAttr(c)}"
                    data-roman="${escapeAttr(romanNumeral)}"
                    data-key="${escapeAttr(key)}"
                    aria-label="Show details for ${escapeAttr(c)}">
              ${escapeAttr(c)}
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  modalOverlay.hidden = false;
  modalOverlay.classList.add('chord-modal__overlay--visible');

  // Focus management
  setTimeout(() => {
    const closeBtn = document.getElementById('chordModalClose');
    if (closeBtn) closeBtn.focus();
  }, 100);

  // Close handlers (use named functions to avoid listener leaks)
  modalOverlay.addEventListener('keydown', trapModalFocus);
  modalOverlay.addEventListener('click', handleOverlayClick);
  document.addEventListener('keydown', handleModalEscape);

  const closeBtn = document.getElementById('chordModalClose');
  if (closeBtn) {
    closeBtn.onclick = () => closeChordModal();
  }
}

/**
 * Close the chord detail modal.
 */
function closeChordModal() {
  const modalOverlay = document.getElementById('chordModalOverlay');
  if (modalOverlay) {
    modalOverlay.hidden = true;
    modalOverlay.classList.remove('chord-modal__overlay--visible');
    modalOverlay.removeEventListener('keydown', trapModalFocus);
    modalOverlay.removeEventListener('click', handleOverlayClick);
  }
  document.removeEventListener('keydown', handleModalEscape);
}

/**
 * Handle click on modal overlay background to close.
 * @param {MouseEvent} e
 */
function handleOverlayClick(e) {
  if (e.target === document.getElementById('chordModalOverlay')) closeChordModal();
}

/**
 * Handle Escape key to close modal.
 * @param {KeyboardEvent} e
 */
function handleModalEscape(e) {
  if (e.key === 'Escape') closeChordModal();
}

/**
 * Trap focus within the modal for accessibility.
 * @param {KeyboardEvent} e
 */
function trapModalFocus(e) {
  if (e.key !== 'Tab') return;
  const modal = document.getElementById('chordModalContent');
  if (!modal) {
    console.warn('[progressionExplorer] Modal content element not found during focus trap');
    return;
  }
  const focusable = modal.querySelectorAll('button, [tabindex]:not([tabindex="-1"]), input, select, textarea, a');
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

/**
 * Update the explorer when the key changes.
 * @param {string} newKey - New musical key
 */
export function updateExplorerForKey(newKey) {
  if (!newKey) {
    console.warn('[progressionExplorer] updateExplorerForKey called with empty key');
    return;
  }
  currentKey = newKey;
  const grid = document.getElementById('progressionGrid');
  const theoryPanel = document.getElementById('theoryPanel');
  if (grid) {
    try {
      grid.innerHTML = renderProgressions(newKey);
    } catch (e) {
      console.error(`[progressionExplorer] Failed to render progressions for key "${newKey}":`, e);
      grid.innerHTML = '<p class="progression-explorer__error">Failed to load progressions for this key.</p>';
    }
  }
  if (theoryPanel) {
    try {
      theoryPanel.innerHTML = renderTheoryPanel();
    } catch (e) {
      console.error(`[progressionExplorer] Failed to render theory panel for key "${newKey}":`, e);
    }
  }
  // Re-setup hover listeners after DOM update to ensure proper event delegation
  setupChordHoverListeners();
}


export function renderChordDiagram(chordName) {
  const strings = getChordFingering(chordName);
  if (!strings) {
    return `<div style="padding:20px;text-align:center;">${chordName}</div>`;
  }

  const frets = strings.filter(s => s !== 'X' && s !== '0').map(Number);
  let minFret = frets.length ? Math.min(...frets) : 1;
  let maxFret = frets.length ? Math.max(...frets) : 1;

  let topFret = 1;
  if (maxFret > 4) {
    topFret = minFret;
  }

  const muteX = [];
  const openO = [];
  const dots = [];
  
  // To draw a barre, we can check if there are multiple dots on the SAME fret
  // and if one of them is on the lowest pitched string being played.
  // We don't strictly need a barre line if we just draw the dots, 
  // but let's draw it if we detect a barre shape.
  let minX = 80;
  let maxX = 20;
  let barreFret = null;
  
  const counts = {};
  frets.forEach(f => { counts[f] = (counts[f] || 0) + 1; });
  for (let f in counts) {
    if (counts[f] >= 3) {
      barreFret = Number(f);
      break;
    }
  }

  const stringXs = [20, 32, 44, 56, 68, 80];

  strings.forEach((fretStr, idx) => {
    const x = stringXs[idx];
    if (fretStr === 'X') {
      muteX.push(`<path class="chord-mute" d="M ${x-3} 17 L ${x+3} 23 M ${x-3} 23 L ${x+3} 17" stroke="#888" stroke-width="1.5" style="opacity:0; animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; animation-delay: ${0.1 + idx*0.03}s" />`);
    } else if (fretStr === '0') {
      openO.push(`<circle class="chord-open" cx="${x}" cy="15" r="3" fill="none" stroke="#888" stroke-width="1.5" style="opacity:0; animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; animation-delay: ${0.1 + idx*0.03}s" />`);
    } else {
      const fretNum = Number(fretStr);
      const relativeOffset = fretNum - topFret;
      const y = 32.5 + (relativeOffset * 15);
      
      if (fretNum === barreFret) {
         if (x < minX) minX = x;
         if (x > maxX) maxX = x;
      }
      
      dots.push(`<circle class="chord-dot" cx="${x}" cy="${y}" r="4" fill="#333" style="opacity:0; animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; animation-delay: ${0.2 + idx*0.05}s" />`);
    }
  });

  const barreLine = (barreFret !== null && minX < maxX) ? 
    `<line class="chord-barre" x1="${minX}" y1="${32.5 + (barreFret - topFret) * 15}" x2="${maxX}" y2="${32.5 + (barreFret - topFret) * 15}" stroke="#333" stroke-width="6" stroke-linecap="round" style="opacity:0; animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; animation-delay: 0.15s" />` : '';

  const nut = topFret === 1 ? `<line class="chord-nut" x1="20" y1="25" x2="80" y2="25" stroke="#ccc" stroke-width="4" stroke-linecap="square" />` : '';
  const fretMarker = topFret > 1 ? `<text class="chord-fret-marker" x="5" y="36" font-family="sans-serif" font-size="10" font-weight="bold" fill="#666">${topFret}fr</text>` : '';

  return `
    <svg class="chord-diagram" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
      <text class="chord-name-title" x="50" y="10" font-family="sans-serif" font-size="8" text-anchor="middle" font-weight="bold" fill="#4a2f0f">${chordName}</text>
      ${fretMarker}
      ${muteX.join('')}
      ${openO.join('')}
      
      <!-- Fretboard grid -->
      <path class="chord-grid" d="M20 25 v60 M32 25 v60 M44 25 v60 M56 25 v60 M68 25 v60 M80 25 v60" stroke="#ccc" stroke-width="1.5" />
      <path class="chord-grid" d="M20 25 h60 M20 40 h60 M20 55 h60 M20 70 h60 M20 85 h60" stroke="#ccc" stroke-width="1.5" />
      
      ${nut}
      ${barreLine}
      ${dots.join('')}
    </svg>
  `;
}

/**
 * Initialize keyboard navigation for progression cards.
 */
export function initKeyboardNavigation() {
  document.addEventListener('keydown', (e) => {
    const cards = document.querySelectorAll('.progression-card');
    if (cards.length === 0) return;

    let currentIndex = -1;
    cards.forEach((card, idx) => {
      if (card.contains(document.activeElement)) {
        currentIndex = idx;
      }
    });

    if (currentIndex === -1) return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = cards[(currentIndex + 1) % cards.length];
      const btn = next.querySelector('.progression-chord-btn');
      if (btn) btn.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = cards[(currentIndex - 1 + cards.length) % cards.length];
      const btn = prev.querySelector('.progression-chord-btn');
      if (btn) btn.focus();
    }
  });
}
/**
 * Resolve a chord name to its fingering array, checking the dict and enharmonic aliases.
 * Exposed globally so guitarAudio.js can access it.
 */
function getChordFingeringInternal(chordName) {
  let strings = CHORD_DICT[chordName];

  if (!strings) {
    const alias = ENHARMONIC_CHORD_ALIASES[chordName];
    strings = alias ? CHORD_DICT[alias] : null;
  }

  return strings || null;
}

// Expose chord detail function globally
window.__showChordDetail = showChordDetail;

// Expose chord fingering lookup for guitarAudio.js using a different internal name
window.__getChordFingering = getChordFingeringInternal;
// Event delegation for chord buttons (avoids inline onclick blocked by CSP)
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.progression-chord-btn, .related-chord-btn');
  if (!btn) return;
  const chord = btn.getAttribute('data-chord');
  const roman = btn.getAttribute('data-roman');
  const key = btn.getAttribute('data-key');
  if (chord && roman && key) {
    showChordDetail(chord, roman, key);
  }
});

// --- Guitar Audio Hover ---

/** @type {boolean} Whether audio initialization has been attempted */
let audioInitDone = false;

/**
 * Initialize audio on first user interaction (required by browser autoplay policy).
 * This function must be called from within a user gesture event listener.
 */
async function onFirstInteraction() {
  if (audioInitDone) return;
  audioInitDone = true;
  try {
    await ensureAudioStarted();
  } catch (e) {
    console.warn('Failed to initialize audio on first interaction:', e);
  }
}

/** @type {function|null} Stored mouseenter handler for cleanup */
let chordHoverHandler = null;

/** @type {function|null} Stored mouseleave handler for cleanup */
let chordLeaveHandler = null;

/**
 * Set up audio hover event listeners for chord buttons.
 * This ensures audio plays when hovering over button.progression-chord-btn elements.
 * @returns {void}
 */
export function setupChordHoverListeners() {
  // Remove existing listeners if they exist to prevent duplicates
  if (chordHoverHandler) {
    document.removeEventListener('mouseenter', chordHoverHandler, true);
  }
  if (chordLeaveHandler) {
    document.removeEventListener('mouseleave', chordLeaveHandler, true);
  }

  // Create the mouseenter handler
  chordHoverHandler = async (e) => {
    // Find the closest chord button from the hover target
    // Handle text nodes by falling back to parent element
    const btn = e.target && typeof e.target.closest === 'function'
      ? e.target.closest('.progression-chord-btn')
      : e.target.parentElement?.closest('.progression-chord-btn');
    if (!btn) return;

    // Ensure audio context is running (async but non-blocking)
    onFirstInteraction();

    // Extract chord name from data-chord attribute
    const chordName = btn.getAttribute('data-chord');
    if (chordName) {
      playChordStrum(chordName);
    }
  };

  // Create the mouseleave handler
  chordLeaveHandler = (e) => {
    // Handle text nodes by falling back to parent element
    const btn = e.target && typeof e.target.closest === 'function'
      ? e.target.closest('.progression-chord-btn')
      : e.target.parentElement?.closest('.progression-chord-btn');
    if (!btn) return;
    // Let notes ring out naturally (no abrupt stop)
  };

  // Add listeners with capture phase to ensure we catch events before they bubble
  document.addEventListener('mouseenter', chordHoverHandler, true);
  document.addEventListener('mouseleave', chordLeaveHandler, true);
}

/**
 * Clean up hover event listeners.
 * Call this when the component is destroyed to prevent memory leaks.
 * @returns {void}
 */
export function cleanupChordHoverListeners() {
  if (chordHoverHandler) {
    document.removeEventListener('mouseenter', chordHoverHandler, true);
    chordHoverHandler = null;
  }
  if (chordLeaveHandler) {
    document.removeEventListener('mouseleave', chordLeaveHandler, true);
    chordLeaveHandler = null;
  }
}

// Set up hover listeners when module loads
setupChordHoverListeners();

// Also ensure audio context on first click anywhere (async handler)
document.addEventListener('click', async () => {
  await onFirstInteraction();
}, { once: true });
