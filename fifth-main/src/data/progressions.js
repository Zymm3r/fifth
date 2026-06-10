/**
 * @fileoverview Chord Progression Definitions
 * Defines popular chord progressions with their Roman numeral patterns
 * and quality information for transposition.
 */

/**
 * @typedef {Object} Progression
 * @property {string} id - Unique identifier for the progression
 * @property {string} name - Display name of the progression
 * @property {string} style - Musical style/category
 * @property {string} pattern - Roman numeral pattern (comma-separated)
 * @property {string[]} romanNumerals - Array of Roman numeral symbols
 * @property {string} description - Descriptive text about the progression
 * @property {string} quality - General harmonic quality
 */

/** @type {Progression[]} */
const PROGRESSIONS = [
  {
    id: "I-V-vi-IV",
    name: "Pop Progression",
    style: "Pop",
    pattern: "I, V, vi, IV",
    romanNumerals: ["I", "V", "vi", "IV"],
    description: "The most ubiquitous progression in pop music. Used in countless hits across decades.",
    quality: "Major (uplifting)"
  },
  {
    id: "ii-V-I",
    name: "Jazz Turnaround",
    style: "Jazz",
    pattern: "ii, V, I",
    romanNumerals: ["ii", "V", "I"],
    description: "The fundamental jazz progression. The ii-V-I is the backbone of jazz harmony.",
    quality: "Major (resolved)"
  },
  {
    id: "I-IV-V",
    name: "Blues Progression",
    style: "Blues",
    pattern: "I, IV, V",
    romanNumerals: ["I", "IV", "V"],
    description: "The classic 12-bar blues foundation. Simple but powerful harmonic movement.",
    quality: "Major (bluesy)"
  },
  {
    id: "vi-IV-I-V",
    name: "Ballad Progression",
    style: "Ballad",
    pattern: "vi, IV, I, V",
    romanNumerals: ["vi", "IV", "I", "V"],
    description: "A melancholic yet uplifting progression common in power ballads and anthemic rock.",
    quality: "Minor (emotional)"
  },
  {
    id: "I-bVII-IV",
    name: "Rock Progression",
    style: "Rock",
    pattern: "I, bVII, IV",
    romanNumerals: ["I", "bVII", "IV"],
    description: "The Mixolydian rock staple. The flat VII chord adds a bluesy, rebellious edge.",
    quality: "Major (mixolydian)"
  },
  {
    id: "I-vi-IV-V",
    name: "50s Doo-Wop",
    style: "Pop",
    pattern: "I, vi, IV, V",
    romanNumerals: ["I", "vi", "IV", "V"],
    description: "The classic doo-wop progression from the 1950s. Also known as the 'ice cream changes'.",
    quality: "Major (nostalgic)"
  },
  {
    id: "i-bVII-bVI-V",
    name: "Andalusian Cadence",
    style: "Classical/Flamenco",
    pattern: "i, bVII, bVI, V",
    romanNumerals: ["i", "bVII", "bVI", "V"],
    description: "A descending minor progression with roots in flamenco and classical music.",
    quality: "Minor (dramatic)"
  },
  {
    id: "I-III-IV-IV",
    name: "Pachelbel Canon",
    style: "Classical",
    pattern: "I, III, IV, IV",
    romanNumerals: ["I", "III", "IV", "IV"],
    description: "Based on Pachelbel's Canon in D. Used extensively in pop music evolution.",
    quality: "Major (ascending)"
  },
  {
    id: "ii7-V9-Imaj7-vi7",
    name: "Jazz Extensions",
    style: "Jazz",
    pattern: "ii7, V9, Imaj7, vi7",
    romanNumerals: ["ii7", "V9", "Imaj7", "vi7"],
    description: "A classic jazz progression utilizing 7ths and 9ths for a sophisticated sound.",
    quality: "Major (jazzy)"
  },
  {
    id: "im7-im6-bVImaj7-V+",
    name: "Minor Extensions",
    style: "Jazz/Blues",
    pattern: "im7, im6, bVImaj7, V+",
    romanNumerals: ["im7", "im6", "bVImaj7", "V+"],
    description: "Explores minor 6th and 7th sounds, resolving with an augmented dominant.",
    quality: "Minor (complex)"
  },
  {
    id: "Imaj7-bVII9-bVImaj7-V7",
    name: "Neo-Soul Descend",
    style: "R&B/Neo-Soul",
    pattern: "Imaj7, bVII9, bVImaj7, V7",
    romanNumerals: ["Imaj7", "bVII9", "bVImaj7", "V7"],
    description: "A smooth descending progression featuring extended major 7ths and 9ths.",
    quality: "Major (smooth)"
  },
  {
    id: "I-Isus-I+-vi",
    name: "Suspended & Augmented",
    style: "Pop/Rock",
    pattern: "I, Isus, I+, vi",
    romanNumerals: ["I", "Isus", "I+", "vi"],
    description: "Builds tension using suspended and augmented chords before resolving to the relative minor.",
    quality: "Major (tension)"
  }
];

// Prevent modifications
Object.freeze(PROGRESSIONS);
Object.freeze(PROGRESSIONS.map(p => Object.freeze(p)));

export default PROGRESSIONS;