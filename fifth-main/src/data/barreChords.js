/**
 * @fileoverview Barre Chord Data Definitions
 * Maps chord names to their barre chord shapes, fret positions, and image paths.
 * Supports E-shape and A-shape barre chords (major and minor).
 */

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
  const match = chordName.match(/^([A-G][#b]?)(m|dim|aug|sus[24]?|7|maj7|m7|dim7)?.*$/);
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
 * Notes in each chord quality.
 */
const NOTE_MAP = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
};

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Get notes in a chord.
 * @param {string} rootNote - e.g. "C", "F#"
 * @param {string} quality - "major", "minor", "dim"
 * @returns {string[]}
 */
function getChordNotes(rootNote, quality) {
  const rootIdx = NOTE_MAP[rootNote];
  if (rootIdx === undefined) return [];

  const intervals = quality === 'minor'
    ? [0, 3, 7]       // m3, P5
    : quality === 'dim'
    ? [0, 3, 6]       // m3, dim5
    : [0, 4, 7];       // M3, P5 (major)

  return intervals.map(interval => {
    const idx = (rootIdx + interval) % 12;
    return NOTE_NAMES[idx];
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

  const quality = parsed.quality === 'm' ? 'minor' : 'major';
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