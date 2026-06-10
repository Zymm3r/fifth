/**
 * @fileoverview Chord Progression Transposition Utility
 * Handles converting Roman numeral progressions to actual chords in any key.
 * Uses memoization to avoid duplicate calculations.
 */

import PROGRESSIONS from '../data/progressions.js';

/**
 * Chord quality mapping for Roman numerals in major keys.
 * Roman numerals are case-sensitive: uppercase = major/aug, lowercase = minor/dim.
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

// Chromatic scale for reference
const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const CHROMATIC_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Which keys prefer flats vs sharps
const FLAT_KEYS = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'];
const SHARP_KEYS = ['G', 'D', 'A', 'E', 'B', 'F#', 'C#'];

/** @type {Map<string, string[]>} Memoization cache for transposed progressions */
const transpositionCache = new Map();

/**
 * Get the chromatic array appropriate for a given key.
 * @param {string} key - Root key
 * @returns {string[]}
 */
function getChromaticForKey(key) {
  return FLAT_KEYS.includes(key) ? CHROMATIC_FLAT : CHROMATIC;
}

/**
 * Parse a Roman numeral to extract base note interval and any alterations.
 * Supports flat (b, ♭) and sharp (#, ♯) prefixes.
 * @param {string} roman - Roman numeral with possible accidental prefix
 * @returns {{ baseRoman: string, accidentalOffset: number }}
 */
function parseRomanNumeral(roman) {
  let accidentalOffset = 0;
  let cleaned = roman;

  // Check for flat
  if (roman.startsWith('b') || roman.startsWith('♭')) {
    accidentalOffset = -1;
    cleaned = roman.slice(1);
  }
  // Check for sharp
  else if (roman.startsWith('#') || roman.startsWith('♯')) {
    accidentalOffset = 1;
    cleaned = roman.slice(1);
  }

  return { baseRoman: cleaned, accidentalOffset };
}

/**
 * Transpose a single Roman numeral to an actual chord name in the given key.
 * @param {string} romanNumeral - e.g. "I", "ii", "bVII", "vii°"
 * @param {string} key - Target key e.g. "C", "G", "F"
 * @returns {string} Chord name e.g. "C", "Dm", "G7"
 */
function transposeRomanNumeral(romanNumeral, key) {
  // Handle secondary dominants (e.g., V/ii)
  if (romanNumeral.includes('/')) {
    const [primary, secondary] = romanNumeral.split('/');
    const secondaryChord = transposeRomanNumeral(secondary, key);
    // For simplicity, just transpose the primary part
    return transposeRomanNumeral(primary, key);
  }

  const { baseRoman, accidentalOffset } = parseRomanNumeral(romanNumeral);
  const chordInfo = CHORD_QUALITY_MAP[baseRoman];

  if (!chordInfo) return romanNumeral; // Return as-is if unknown

  const chromatic = getChromaticForKey(key);
  const keyIndex = chromatic.indexOf(key);
  if (keyIndex === -1) return romanNumeral;

  const noteIndex = (keyIndex + chordInfo.interval + accidentalOffset + 12) % 12;
  const rootNote = chromatic[noteIndex];

  // Format the chord name based on quality
  switch (chordInfo.quality) {
    case 'major':
      return rootNote;
    case 'minor':
      return `${rootNote}m`;
    case 'dim':
      return `${rootNote}dim`;
    case 'aug':
      return `${rootNote}aug`;
    default:
      return rootNote;
  }
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