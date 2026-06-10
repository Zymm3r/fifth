/**
 * @fileoverview Music Theory Helper Utilities
 * Provides functions for relative/parallel keys, circle of fifths navigation,
 * secondary dominants, and chord function analysis.
 */

/**
 * @typedef {'tonic'|'subdominant'|'dominant'|'predominant'} ChordFunction
 */

/**
 * @typedef {Object} KeyInfo
 * @property {string} key - Key name (e.g. "C", "Am")
 * @property {boolean} isMajor - Whether the key is major
 * @property {string} relativeKey - Relative major/minor
 * @property {string} parallelKey - Parallel major/minor
 * @property {string[]} circleNeighbors - Adjacent keys on circle of fifths
 * @property {string[]} scaleDegrees - Scale degree names
 */

// Circle of fifths order (clockwise)
const CIRCLE_ORDER = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];

// Practical enharmonic equivalents
const ENHARMONIC = {
  'F#': 'Gb', 'C#': 'Db', 'G#': 'Ab', 'D#': 'Eb', 'A#': 'Bb', 'E#': 'F', 'B#': 'C',
  'Gb': 'F#', 'Db': 'C#', 'Ab': 'G#', 'Eb': 'D#', 'Bb': 'A#'
};

// Major keys and their relative minors
const RELATIVE_MINOR = {
  'C': 'Am', 'G': 'Em', 'D': 'Bm', 'A': 'F#m', 'E': 'C#m', 'B': 'G#m',
  'F#': 'D#m', 'Gb': 'Ebm', 'C#': 'A#m', 'Db': 'Bbm',
  'G#': 'Fm', 'Ab': 'Fm', 'D#': 'Cm', 'Eb': 'Cm',
  'A#': 'Gm', 'Bb': 'Gm', 'F': 'Dm'
};

const RELATIVE_MAJOR = {};
Object.entries(RELATIVE_MINOR).forEach(([major, minor]) => {
  RELATIVE_MAJOR[minor] = major;
});

// All valid keys
const MAJOR_KEYS = Object.keys(RELATIVE_MINOR);
const MINOR_KEYS = Object.values(RELATIVE_MINOR);

/**
 * Get the relative minor of a major key, or relative major of a minor key.
 * @param {string} key - Key name (e.g. "C", "Am")
 * @returns {string|null} Relative key or null if not found
 */
function getRelativeKey(key) {
  // Check if it's a major key
  if (RELATIVE_MINOR[key]) return RELATIVE_MINOR[key];
  // Check if it's a minor key
  if (RELATIVE_MAJOR[key]) return RELATIVE_MAJOR[key];
  // Try enharmonic
  const enharmonic = ENHARMONIC[key];
  if (enharmonic) return RELATIVE_MINOR[enharmonic] || RELATIVE_MAJOR[enharmonic] || null;
  return null;
}

/**
 * Get the parallel key (same tonic, different mode).
 * @param {string} key - Key name
 * @returns {string|null} Parallel key
 */
function getParallelKey(key) {
  const isMajor = RELATIVE_MINOR[key] !== undefined;
  const tonic = key.replace('m', '');
  if (isMajor) {
    // C Major -> C Minor
    const parallelOptions = ['Cm', 'C#m', 'Cbm'];
    return parallelOptions.find(p => p.startsWith(tonic)) || `${tonic}m`;
  } else {
    // Am -> A Major
    return tonic;
  }
}

/**
 * Get the adjacent keys on the circle of fifths.
 * @param {string} key - Key name
 * @returns {{ clockwise: string|null, counterclockwise: string|null }}
 */
function getCircleNeighbors(key) {
  const normalizedKey = key.replace('m', '');
  let idx = CIRCLE_ORDER.indexOf(normalizedKey);
  if (idx === -1) {
    // Try enharmonic
    const enharmonic = ENHARMONIC[normalizedKey];
    if (enharmonic) idx = CIRCLE_ORDER.indexOf(enharmonic);
  }
  if (idx === -1) return { clockwise: null, counterclockwise: null };

  const isMinor = key.endsWith('m');
  const clockwise = CIRCLE_ORDER[(idx + 1) % CIRCLE_ORDER.length];
  const counterclockwise = CIRCLE_ORDER[(idx - 1 + CIRCLE_ORDER.length) % CIRCLE_ORDER.length];

  if (isMinor) {
    // For minor keys, return the relative of the neighbor
    const relClockwise = getRelativeKey(clockwise);
    const relCounter = getRelativeKey(counterclockwise);
    return {
      clockwise: relClockwise,
      counterclockwise: relCounter
    };
  }

  return { clockwise, counterclockwise };
}

/**
 * Determine chord function (tonic, predominant, dominant).
 * @param {string} romanNumeral - Roman numeral (e.g. "I", "ii", "V", "vii°")
 * @returns {ChordFunction}
 */
function getChordFunction(romanNumeral) {
  const normalized = romanNumeral.replace(/[♭b#♯]/g, '').toLowerCase();

  // Tonic function
  if (normalized === 'i' || normalized === 'i1') return 'tonic';
  if (normalized === 'i' || normalized === 'vi') return 'tonic';

  // Dominant function
  if (normalized === 'v' || normalized === 'vii') return 'dominant';
  if (normalized.includes('vii')) return 'dominant';
  if (normalized.startsWith('v') && !normalized.startsWith('vi')) return 'dominant';

  // Predominant / Subdominant
  if (normalized === 'ii' || normalized === 'iv') return 'predominant';
  if (normalized === 'vi') return 'tonic';

  // Default
  return 'predominant';
}

/**
 * Get the secondary dominant for a given target chord degree.
 * @param {string} targetRomanNumeral - Target chord (e.g. "ii", "V")
 * @returns {string} Secondary dominant Roman numeral (e.g. "V/ii")
 */
function getSecondaryDominant(targetRomanNumeral) {
  return `V/${targetRomanNumeral}`;
}

/**
 * Get scale degree name for a Roman numeral.
 * @param {string} romanNumeral
 * @returns {string}
 */
function getScaleDegreeName(romanNumeral) {
  const clean = romanNumeral.replace(/[♭b#♯]/, '');
  const isFlat = romanNumeral.startsWith('♭') || romanNumeral.startsWith('b');
  const names = {
    'I': 'Tonic',
    'i': 'Tonic',
    'II': 'Supertonic',
    'ii': 'Supertonic',
    'III': 'Mediant',
    'iii': 'Mediant',
    'IV': 'Subdominant',
    'iv': 'Subdominant',
    'V': 'Dominant',
    'v': 'Dominant',
    'VI': 'Submediant',
    'vi': 'Submediant',
    'VII': 'Leading Tone / Subtonic',
    'vii': 'Leading Tone / Subtonic'
  };
  const name = names[clean];
  if (!name) {
    console.debug(`[musicTheory] No scale degree name for Roman numeral: "${romanNumeral}" (cleaned: "${clean}")`);
    return 'Unknown';
  }
  return isFlat ? `${name} (♭)` : name;
}

/**
 * Check if a key is major.
 * @param {string} key
 * @returns {boolean}
 */
function isMajorKey(key) {
  return MAJOR_KEYS.includes(key) || (RELATIVE_MAJOR[key] !== undefined);
}

/**
 * Check if a key is minor.
 * @param {string} key
 * @returns {boolean}
 */
function isMinorKey(key) {
  return MINOR_KEYS.includes(key);
}

export {
  getRelativeKey,
  getParallelKey,
  getCircleNeighbors,
  getChordFunction,
  getSecondaryDominant,
  getScaleDegreeName,
  isMajorKey,
  isMinorKey,
  RELATIVE_MINOR,
  RELATIVE_MAJOR,
  CIRCLE_ORDER,
  ENHARMONIC
};