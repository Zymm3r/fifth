/**
 * @fileoverview Shared Chord Fingering Lookup
 * Provides a single function to resolve chord names to fingering arrays,
 * handling enharmonic aliases transparently.
 */

import { CHORD_DICT, ENHARMONIC_CHORD_ALIASES } from '../data/chordDictionary.js';

/**
 * Resolve a chord name to its fingering array (6 fret strings).
 * Checks the dictionary directly, then tries enharmonic aliases.
 * @param {string} chordName - e.g. "C", "G#m", "Cb9"
 * @returns {string[]|null} Array of 6 fret strings, or null if not found
 */
export function getChordFingering(chordName) {
  let strings = CHORD_DICT[chordName];
  if (!strings) {
    const alias = ENHARMONIC_CHORD_ALIASES[chordName];
    strings = alias ? CHORD_DICT[alias] : null;
  }
  return strings || null;
}

export { CHORD_DICT, ENHARMONIC_CHORD_ALIASES };
