/**
 * @fileoverview Barre Chord Data Definitions
 * Maps chord names to their barre chord shapes, fret positions, and image paths.
 * Supports E-shape and A-shape barre chords (major and minor).
 */

import { NOTE_INDEX_MAP, CHROMATIC_SHARP } from '../utils/noteConstants.js';

/**
 * @typedef {Object} BarreChordInfo
 * @property {string} chordName - Full chord name (e.g. "F", "Bm")
 * @property {string} rootNote - Root note of the chord
 * @property {string} barreType - Type of barre shape: "E-shape" | "E-shape minor" | "A-shape" | "A-shape minor"
 * @property {number} fretPosition - The fret where the barre is positioned (0 = open/nut)
 * @property {string} imagePath - Path to the chord diagram image
 * @property {string[]} notes - Array of notes in the chord
 * @property {string[]} intervals - Interval structure
 * @property {string} quality - Chord quality (major, minor, etc.)
 */

/**
 * Helper to determine barre type from chord name.
 * @param {string} chordName - e.g. "F", "Bm", "Bb", "C#m"
 * @returns {{ rootNote: string, barreType: string, fretPosition: number }}
 */
function parseBarreChord(chordName) {
  // Extract root note (handle sharps/flats)
  const match = chordName.match(/^([A-G][#b]?)(maj7|m7|m6|dim7|dim|aug|sus[24]?|7|m)?.*$/);
  if (!match) return null;

  const rootNote = match[1];
  const quality = match[2] || '';

  // Map root note to fret position for E-shape and A-shape
  // E-shape: barre on fret number where root is on the 6th string (E string)
  // A-shape: barre on fret number where root is on the 5th string (A string)

  const noteToFret = {
    'F': 1, 'F#': 2, 'Gb': 2,
    'G': 3, 'G#': 4, 'Ab': 4,
    'A': 5, 'A#': 6, 'Bb': 6,
    'B': 7, 'C': 8, 'C#': 9, 'Db': 9,
    'D': 10, 'D#': 11, 'Eb': 11,
    'E': 12
  };

  const isMinor = quality === 'm';
  const fret = noteToFret[rootNote] || 0;

  // Determine shape based on chord
  // Common convention: E-shape for chords rooted on E string (generally thicker sound)
  // A-shape for chords rooted on A string
  // For simplicity, we use a heuristic: sharp/flat roots often use A-shape, naturals use E-shape
  const hasAccidental = rootNote.length > 1;
  const shapeType = hasAccidental ? 'A-shape' : 'E-shape';

  // For chords like B (which is natural but often played as A-shape), adjust
  const aShapeChords = ['B', 'Bb', 'B', 'C#', 'Db', 'Eb', 'D#', 'F#', 'Gb', 'G#', 'Ab', 'A#'];
  const finalShapeType = aShapeChords.includes(rootNote) ? 'A-shape' : shapeType;

  const barreType = isMinor
    ? `${finalShapeType} minor`
    : `${finalShapeType} major`;

  return { rootNote, barreType, fretPosition: fret, quality };
}

/**
 * Generate chord image path from chord info.
 * @param {string} chordName
 * @returns {string}
 */
function getChordImagePath(chordName) {
  // Sanitize chord name for filename
  const sanitized = chordName.replace('#', 'sharp').replace('b', 'flat').replace(/[^a-zA-Z0-9]/g, '_');
  return `chords/barre/${sanitized}.svg`;
}



/**
 * Get notes in a chord.
 * @param {string} rootNote - e.g. "C", "F#"
 * @param {string} quality - "major", "minor", "dim"
 * @returns {string[]}
 */
function getChordNotes(rootNote, quality) {
  const rootIdx = NOTE_INDEX_MAP[rootNote];
  if (rootIdx === undefined) return [];

  const intervals = quality === 'minor'
    ? [0, 3, 7]       // m3, P5
    : quality === 'dim'
    ? [0, 3, 6]       // m3, dim5
    : [0, 4, 7];       // M3, P5 (major)

  return intervals.map(interval => {
    const idx = (rootIdx + interval) % 12;
    return CHROMATIC_SHARP[idx];
  });
}

/**
 * Get interval names for a chord.
 * @param {string} quality
 * @returns {string[]}
 */
function getChordIntervals(quality) {
  return quality === 'minor'
    ? ['1', '♭3', '5']
    : quality === 'dim'
    ? ['1', '♭3', '♭5']
    : ['1', '3', '5'];
}

/**
 * Generate barre chord info for a given chord.
 * @param {string} chordName - e.g. "F", "Bm", "Bb", "C#m"
 * @returns {BarreChordInfo|null}
 */
function getBarreChordInfo(chordName) {
  const parsed = parseBarreChord(chordName);
  if (!parsed) return null;

  const quality = parsed.quality.startsWith('m') && !parsed.quality.startsWith('maj')
    ? 'minor'
    : parsed.quality.includes('dim')
      ? 'dim'
      : 'major';
  const notes = getChordNotes(parsed.rootNote, quality);
  const intervals = getChordIntervals(quality);

  return {
    chordName,
    rootNote: parsed.rootNote,
    barreType: parsed.barreType,
    fretPosition: parsed.fretPosition,
    imagePath: getChordImagePath(chordName),
    notes,
    intervals,
    quality
  };
}

// Pre-computed common barre chords for quick lookup
const COMMON_BARRE_CHORDS = [
  'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B', 'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E',
  'Fm', 'F#m', 'Gbm', 'Gm', 'G#m', 'Abm', 'Am', 'A#m', 'Bbm', 'Bm', 'Cm', 'C#m', 'Dbm', 'Dm', 'D#m', 'Ebm', 'Em'
];

/** @type {Map<string, BarreChordInfo>} */
const barreChordCache = new Map();

COMMON_BARRE_CHORDS.forEach(name => {
  const info = getBarreChordInfo(name);
  if (info) barreChordCache.set(name, info);
});

Object.freeze(barreChordCache);

export {
  getBarreChordInfo,
  getChordNotes,
  getChordIntervals,
  barreChordCache,
  parseBarreChord
};
