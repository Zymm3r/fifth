/**
 * @fileoverview Shared Note & Key Constants
 * Single source of truth for chromatic scales, note-to-index maps,
 * enharmonic equivalents, and key classification (flat vs sharp).
 */

/** Chromatic scale using sharps */
export const CHROMATIC_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/** Chromatic scale using flats */
export const CHROMATIC_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

/** Map note names to their chromatic index (0–11) */
export const NOTE_INDEX_MAP = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
};

/** Keys that conventionally use flats */
export const FLAT_KEYS = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'];

/** Keys that conventionally use sharps */
export const SHARP_KEYS = ['G', 'D', 'A', 'E', 'B', 'F#', 'C#'];

/** Full bidirectional enharmonic equivalents */
export const ENHARMONIC_MAP = {
  'F#': 'Gb', 'C#': 'Db', 'G#': 'Ab', 'D#': 'Eb', 'A#': 'Bb', 'E#': 'F', 'B#': 'C',
  'Gb': 'F#', 'Db': 'C#', 'Ab': 'G#', 'Eb': 'D#', 'Bb': 'A#'
};

/** Map sharp note names to their flat equivalents */
export const ENHARMONIC_TO_FLAT = {
  'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb'
};

/** Map flat note names to their sharp equivalents */
export const ENHARMONIC_TO_SHARP = {
  'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
};

/**
 * Get the chromatic array appropriate for a given key.
 * @param {string} key - Root key
 * @returns {string[]}
 */
export function getChromaticForKey(key) {
  return FLAT_KEYS.includes(key) ? CHROMATIC_FLAT : CHROMATIC_SHARP;
}

/**
 * Convert a chromatic index (0–11) to a note name using the given key's spelling.
 * @param {number} index - Chromatic index (0–11)
 * @param {string} [key] - Optional key for flat/sharp preference (defaults to sharps)
 * @returns {string}
 */
export function indexToNoteName(index, key) {
  const chromatic = key ? getChromaticForKey(key) : CHROMATIC_SHARP;
  return chromatic[((index % 12) + 12) % 12];
}

/** Circle of fifths key order used in the UI (12 major keys) */
export const CIRCLE_OF_FIFTHS_KEYS = [
  'C', 'G', 'D', 'A', 'E', 'B', 'Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F'
];
