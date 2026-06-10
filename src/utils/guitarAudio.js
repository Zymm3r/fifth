/**
 * @fileoverview Guitar Audio Synthesizer using Tone.js
 * Plays chord sounds on hover over chord diagrams.
 * Uses a PolySynth configured to sound like a clean guitar.
 */

/**
 * Standard guitar tuning MIDI notes (strings 6→1 = low E → high E).
 * @type {number[]}
 */
const STANDARD_TUNING = [40, 45, 50, 55, 59, 64]; // E2, A2, D3, G3, B3, E4

/** @type {Tone.PolySynth|null} Guitar synth instance */
let synth = null;

/** @type {boolean} Whether audio context has been started */
let audioStarted = false;

/**
 * Convert a fret number string to a MIDI note value for a given string index.
 * @param {number} stringIndex - 0=low E (string 6) through 5=high E (string 1)
 * @param {string} fretStr - "0"-"22" for fret, "X" for muted
 * @returns {number|null} MIDI note number, or null if muted/invalid
 */
function fretToMidi(stringIndex, fretStr) {
  if (fretStr === 'X' || fretStr === 'x' || fretStr === undefined) return null;
  const fret = parseInt(fretStr, 10);
  if (isNaN(fret) || fret < 0 || fret > 22) return null;
  return STANDARD_TUNING[stringIndex] + fret;
}

/**
 * Convert MIDI note number to a Tone.js note string (e.g. 40 → "E2").
 * @param {number} midi
 * @returns {string}
 */
function midiToNote(midi) {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = midi % 12;
  return noteNames[noteIndex] + octave;
}

/**
 * Get the resolved chord fingering array (handling enharmonic aliases).
 * @param {string} chordName - e.g. "C", "G#m", "Cb9"
 * @returns {string[]|null} Array of 6 fret strings, or null if not found
 */
function getFingering(chordName) {
  // This function reads from the global CHORD_DICT and ENHARMONIC_CHORD_ALIASES
  // that are defined in progressionExplorer.js. We access them via a global lookup.
  if (window.__getChordFingering) {
    return window.__getChordFingering(chordName);
  }
  return null;
}

/**
 * Initialize the guitar synthesizer.
 * @returns {Tone.PolySynth}
 */
function initSynth() {
  if (synth) return synth;

  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: 'triangle8partial',
      partialCount: 8
    },
    envelope: {
      attack: 0.005,
      decay: 0.3,
      sustain: 0.2,
      release: 1.2
    },
    volume: -8
  }).toDestination();

  return synth;
}

/**
 * Ensure the audio context is started (required by browser autoplay policy).
 * Must be called from a user interaction event.
 * This defers Tone.js initialization until explicit user interaction.
 */
export async function ensureAudioStarted() {
  if (audioStarted) return;
  try {
    // Ensure Tone.js context is started (must be in user gesture)
    await Tone.start();

    // Create synth only after successful Tone.start()
    initSynth();

    audioStarted = true;
  } catch (e) {
    console.warn('Audio context failed to start:', e);
  }
}

/**
 * Play a guitar strum for the given chord name.
 * Notes are staggered to simulate a downward strum.
 * @param {string} chordName - e.g. "C", "Am7", "Bb9"
 */
export function playChordStrum(chordName) {
  // Ensure audio is initialized before playing
  if (!audioStarted || !synth) {
    console.warn('Audio not initialized. Call ensureAudioStarted() from a user gesture first.');
    return;
  }

  const fingering = getFingering(chordName);
  if (!fingering) return;

  const now = Tone.now();
  const strumDelay = 0.03; // 30ms between strings for strum feel

  fingering.forEach((fretStr, idx) => {
    const midi = fretToMidi(idx, fretStr);
    if (midi === null) return; // Skip muted strings

    const note = midiToNote(midi);
    const time = now + idx * strumDelay;
    try {
      synth.triggerAttackRelease(note, '8n', time);
    } catch (e) {
      // Ignore invalid notes or audio context issues
      console.warn('Failed to play note:', note, e);
    }
  });
}

/**
 * Stop all currently playing notes.
 */
export function stopAllNotes() {
  if (synth) {
    synth.releaseAll();
  }
}