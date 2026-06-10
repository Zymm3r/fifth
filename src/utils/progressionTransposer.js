/**
 * @fileoverview Chord Progression Transposition Utility
 * Handles converting Roman numeral progressions to actual chords in any key.
 * Supports complex extensions: maj7, m7, m6, 9, sus, +, dim, bVI, etc.
 * Uses memoization to avoid duplicate calculations.
 */

import PROGRESSIONS from '../data/progressions.js';
import { FLAT_KEYS, ENHARMONIC_TO_FLAT, ENHARMONIC_TO_SHARP, getChromaticForKey } from './noteConstants.js';

/**
 * Chord quality mapping for Roman numerals in major keys.
 * Roman numerals are case-sensitive: uppercase = major/aug, lowercase = minor/dim.
 * Stores only the base numeral without quality suffixes.
 */
const CHORD_QUALITY_MAP = {
  'I': { interval: 0, quality: 'major' },
  'II': { interval: 2, quality: 'major' },
  'III': { interval: 4, quality: 'major' },
  'IV': { interval: 5, quality: 'major' },
  'V': { interval: 7, quality: 'major' },
  'VI': { interval: 9, quality: 'major' },
  'VII': { interval: 11, quality: 'major' },
  'i': { interval: 0, quality: 'minor' },
  'ii': { interval: 2, quality: 'minor' },
  'iii': { interval: 4, quality: 'minor' },
  'iv': { interval: 5, quality: 'minor' },
  'v': { interval: 7, quality: 'minor' },
  'vi': { interval: 9, quality: 'minor' },
  'vii': { interval: 11, quality: 'dim' },
  'vii°': { interval: 11, quality: 'dim' }
};

/** @type {Map<string, string[]>} Memoization cache for transposed progressions */
const transpositionCache = new Map();

/**
 * Regex to parse a Roman numeral into three parts:
 *   1) Accidental prefix: b, #, ♭, ♯ (optional)
 *   2) Base Roman numeral: I, ii, III, vii, etc.
 *   3) Quality/extension suffix: maj7, m7, m6, 7, 9, sus, +, dim, °, 6, etc.
 *
 * The base Roman numeral pattern matches:
 *   - Uppercase: I, II, III, IV, V, VI, VII
 *   - Lowercase: i, ii, iii, iv, v, vi, vii
 *   - With optional ° variant: vii° (handled separately)
 */
const ROMAN_NUMERAL_REGEX = /^([#♯b♭]?)(VII|VI|IV|V|I{1,3}|vii|vi|iv|v|i{1,3})(.*)$/;

/**
 * Parse a Roman numeral to extract the accidental prefix, base numeral,
 * and quality/extension suffix.
 *
 * @param {string} roman - Roman numeral with possible accidental and suffix
 * @returns {{ accidentalOffset: number, baseRoman: string, suffix: string, isMinorBase: boolean }}
 */
function parseRomanNumeral(roman) {
  let accidentalOffset = 0;
  let cleaned = roman;
  let accidentalPrefix = ''; // '', 'b', '#' — used for enharmonic forcing

  // Check for flat (b, ♭)
  if (roman.startsWith('b') || roman.startsWith('♭')) {
    accidentalOffset = -1;
    accidentalPrefix = 'b';
    cleaned = roman.slice(1);
  }
  // Check for sharp (#, ♯)
  else if (roman.startsWith('#') || roman.startsWith('♯')) {
    accidentalOffset = 1;
    accidentalPrefix = '#';
    cleaned = roman.slice(1);
  }

  // Handle special case: "vii°" — the ° is part of the base
  let baseRoman = cleaned;
  let suffix = '';

  if (cleaned.startsWith('vii°')) {
    baseRoman = 'vii°';
    suffix = cleaned.slice(4);
  } else {
    // Match the base Roman numeral (I-VII or i-vii) followed by optional suffix
    const match = cleaned.match(/^(VII|VI|IV|V|I{1,3}|vii|vi|iv|v|i{1,3})(.*)$/);
    if (match) {
      baseRoman = match[1];
      suffix = match[2];
    }
  }

  const isMinorBase = /^[a-z]/.test(baseRoman);

  return { accidentalOffset, baseRoman, suffix, isMinorBase, accidentalPrefix };
}

/**
 * Apply the quality/extension suffix to a base chord name.
 * Handles the case where 'm' would be duplicated (e.g. Cm + m7 → Cm7, not Cmm7).
 *
 * @param {string} baseChord - e.g. "C", "Dm", "Bdim"
 * @param {string} suffix - e.g. "7", "9", "maj7", "m7", "m6", "+", "sus", "dim", "°", "6"
 * @param {boolean} isMinorBase - Whether the Roman base was lowercase (minor)
 * @returns {string} Complete chord name
 */
function applySuffix(baseChord, suffix, isMinorBase) {
  if (!suffix) return baseChord;

  // Map special suffix symbols
  let normalizedSuffix = suffix;
  if (suffix === '°') normalizedSuffix = 'dim';

  // If the base chord already ends with 'm' (minor) and the suffix starts with 'm',
  // strip the leading 'm' from suffix to avoid duplication: Cm + m7 → Cm7
  const baseEndsWithM = baseChord.endsWith('m') || baseChord.endsWith('dim');
  const suffixStartsWithM = normalizedSuffix.startsWith('m');

  if (baseEndsWithM && suffixStartsWithM && !normalizedSuffix.startsWith('maj')) {
    // Strip the 'm' from suffix: "m7" → "7", "m6" → "6"
    normalizedSuffix = normalizedSuffix.slice(1);
  }

  return baseChord + normalizedSuffix;
}

/**
 * Transpose a single Roman numeral to an actual chord name in the given key.
 *
 * Handles:
 *   - Basic numerals: I, ii, V, vi, etc.
 *   - Accidentals: bVII, #IV, ♭VI, etc.
 *   - Extensions: Imaj7, ii7, V9, vi7, im7, im6, bVImaj7, V+, Isus, etc.
 *   - Secondary dominants: V/ii, V/V, etc.
 *
 * @param {string} romanNumeral - e.g. "I", "ii", "bVII", "Imaj7", "ii7", "V9"
 * @param {string} key - Target key e.g. "C", "G", "F"
 * @returns {string} Chord name e.g. "C", "Dm", "G7", "Cmaj7", "Ebmaj7"
 */
function transposeRomanNumeral(romanNumeral, key) {
  // Handle secondary dominants (e.g., V/ii)
  if (romanNumeral.includes('/')) {
    const [primary] = romanNumeral.split('/');
    // Transpose the primary part using the key (this is a simplification)
    return transposeRomanNumeral(primary, key);
  }

  const { accidentalOffset, baseRoman, suffix, isMinorBase, accidentalPrefix } = parseRomanNumeral(romanNumeral);

  // Look up the base Roman numeral in the quality map
  const chordInfo = CHORD_QUALITY_MAP[baseRoman];

  if (!chordInfo) {
    // If completely unrecognized, return as-is
    return romanNumeral;
  }

  const chromatic = getChromaticForKey(key);
  const keyIndex = chromatic.indexOf(key);
  if (keyIndex === -1) return romanNumeral;

  // Compute the root note index: key root + interval + accidental offset
  const noteIndex = (keyIndex + chordInfo.interval + accidentalOffset + 12) % 12;
  let rootNote = chromatic[noteIndex];

  // Force enharmonic spelling based on accidental prefix
  // If the Roman numeral had 'b' prefix, force flat spelling
  if (accidentalPrefix === 'b' && ENHARMONIC_TO_FLAT[rootNote]) {
    rootNote = ENHARMONIC_TO_FLAT[rootNote];
  }
  // If the Roman numeral had '#' prefix and key uses sharps, force sharp spelling
  else if (accidentalPrefix === '#' && ENHARMONIC_TO_SHARP[rootNote]) {
    rootNote = ENHARMONIC_TO_SHARP[rootNote];
  }

  // Build the base chord name from quality
  let baseChord;
  switch (chordInfo.quality) {
    case 'major':
      baseChord = rootNote;
      break;
    case 'minor':
      baseChord = `${rootNote}m`;
      break;
    case 'dim':
      baseChord = `${rootNote}dim`;
      break;
    default:
      baseChord = rootNote;
  }

  // Apply the quality/extension suffix (maj7, 7, 9, m7, m6, +, sus, dim, etc.)
  const chordName = applySuffix(baseChord, suffix, isMinorBase);

  return chordName;
}

/**
 * Transpose a progression's Roman numerals to actual chords in a key.
 * Results are memoized for performance.
 * @param {string} progressionId - The progression ID (e.g. "I-V-vi-IV")
 * @param {string} key - Target key (e.g. "C", "G")
 * @returns {{ chords: string[], romanNumerals: string[] }}
 */
function transposeProgression(progressionId, key) {
  const cacheKey = `${progressionId}|${key}`;

  if (transpositionCache.has(cacheKey)) {
    return transpositionCache.get(cacheKey);
  }

  const progression = PROGRESSIONS.find(p => p.id === progressionId);
  if (!progression) {
    return { chords: [], romanNumerals: [] };
  }

  const romanNumerals = progression.romanNumerals;
  const chords = romanNumerals.map(rn => transposeRomanNumeral(rn, key));

  const result = { chords, romanNumerals };
  transpositionCache.set(cacheKey, result);

  return result;
}

/**
 * Clear all cached progression transpositions.
 * Should be called if the underlying data changes.
 */
function clearTranspositionCache() {
  transpositionCache.clear();
}

/**
 * Get all progressions with their transposed chords for a given key.
 * @param {string} key - Target key
 * @returns {Array<{ progression: Object, chords: string[], romanNumerals: string[] }>}
 */
function getAllTransposedProgressions(key) {
  return PROGRESSIONS.map(progression => {
    const { chords, romanNumerals } = transposeProgression(progression.id, key);
    return { progression, chords, romanNumerals };
  });
}

export {
  transposeProgression,
  transposeRomanNumeral,
  getAllTransposedProgressions,
  clearTranspositionCache,
  CHORD_QUALITY_MAP
};