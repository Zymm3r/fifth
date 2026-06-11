import { describe, it, expect, beforeEach } from 'vitest';
import {
  transposeProgression,
  transposeRomanNumeral,
  getAllTransposedProgressions,
  clearTranspositionCache,
  CHORD_QUALITY_MAP,
} from './progressionTransposer.js';

beforeEach(() => {
  clearTranspositionCache();
});

// ---------------------------------------------------------------------------
// CHORD_QUALITY_MAP
// ---------------------------------------------------------------------------
describe('CHORD_QUALITY_MAP', () => {
  it('contains entries for all seven scale degrees (upper and lower)', () => {
    const expectedUpper = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    const expectedLower = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];
    expectedUpper.forEach(k => expect(CHORD_QUALITY_MAP[k]).toBeDefined());
    expectedLower.forEach(k => expect(CHORD_QUALITY_MAP[k]).toBeDefined());
  });

  it('maps I to interval 0 / major', () => {
    expect(CHORD_QUALITY_MAP['I']).toEqual({ interval: 0, quality: 'major' });
  });

  it('maps vii to interval 11 / dim', () => {
    expect(CHORD_QUALITY_MAP['vii']).toEqual({ interval: 11, quality: 'dim' });
  });
});

// ---------------------------------------------------------------------------
// transposeRomanNumeral — basic chords
// ---------------------------------------------------------------------------
describe('transposeRomanNumeral', () => {
  it('transposes I to the key root', () => {
    expect(transposeRomanNumeral('I', 'C')).toBe('C');
    expect(transposeRomanNumeral('I', 'G')).toBe('G');
    expect(transposeRomanNumeral('I', 'F')).toBe('F');
  });

  it('transposes V to the dominant', () => {
    expect(transposeRomanNumeral('V', 'C')).toBe('G');
    expect(transposeRomanNumeral('V', 'G')).toBe('D');
    expect(transposeRomanNumeral('V', 'D')).toBe('A');
  });

  it('transposes lowercase (minor) numerals', () => {
    expect(transposeRomanNumeral('ii', 'C')).toBe('Dm');
    expect(transposeRomanNumeral('vi', 'C')).toBe('Am');
    expect(transposeRomanNumeral('iii', 'C')).toBe('Em');
  });

  it('transposes vii to a dim chord', () => {
    expect(transposeRomanNumeral('vii', 'C')).toBe('Bdim');
    expect(transposeRomanNumeral('vii', 'G')).toBe('F#dim');
  });
});

// ---------------------------------------------------------------------------
// transposeRomanNumeral — accidentals (bVII, #IV, etc.)
// ---------------------------------------------------------------------------
describe('transposeRomanNumeral — accidentals', () => {
  it('transposes bVII', () => {
    expect(transposeRomanNumeral('bVII', 'C')).toBe('Bb');
    expect(transposeRomanNumeral('bVII', 'G')).toBe('F');
  });

  it('transposes bVI', () => {
    expect(transposeRomanNumeral('bVI', 'C')).toBe('Ab');
  });

  it('transposes bIII', () => {
    expect(transposeRomanNumeral('bIII', 'C')).toBe('Eb');
  });
});

// ---------------------------------------------------------------------------
// transposeRomanNumeral — extensions (7, 9, maj7, m7, sus, +, etc.)
// ---------------------------------------------------------------------------
describe('transposeRomanNumeral — extensions', () => {
  it('transposes Imaj7', () => {
    expect(transposeRomanNumeral('Imaj7', 'C')).toBe('Cmaj7');
    expect(transposeRomanNumeral('Imaj7', 'G')).toBe('Gmaj7');
  });

  it('transposes ii7', () => {
    expect(transposeRomanNumeral('ii7', 'C')).toBe('Dm7');
  });

  it('transposes V9', () => {
    expect(transposeRomanNumeral('V9', 'C')).toBe('G9');
  });

  it('transposes vi7', () => {
    expect(transposeRomanNumeral('vi7', 'C')).toBe('Am7');
  });

  it('transposes im7 without duplicating m', () => {
    // im7 in C → Cm7 (not Cmm7)
    expect(transposeRomanNumeral('im7', 'C')).toBe('Cm7');
  });

  it('transposes im6', () => {
    expect(transposeRomanNumeral('im6', 'C')).toBe('Cm6');
  });

  it('transposes bVImaj7', () => {
    expect(transposeRomanNumeral('bVImaj7', 'C')).toBe('Abmaj7');
  });

  it('transposes V+', () => {
    expect(transposeRomanNumeral('V+', 'C')).toBe('G+');
  });

  it('transposes Isus', () => {
    expect(transposeRomanNumeral('Isus', 'C')).toBe('Csus');
  });

  it('transposes I+', () => {
    expect(transposeRomanNumeral('I+', 'C')).toBe('C+');
  });
});

// ---------------------------------------------------------------------------
// transposeRomanNumeral — secondary dominants
// ---------------------------------------------------------------------------
describe('transposeRomanNumeral — secondary dominants', () => {
  it('handles V/ii by transposing the primary part', () => {
    // V/ii in C = the dominant of ii (Dm) = A
    expect(transposeRomanNumeral('V/ii', 'C')).toBe('A');
  });

  it('handles V/V by transposing to the dominant of V', () => {
    expect(transposeRomanNumeral('V/V', 'C')).toBe('D');
  });
});

// ---------------------------------------------------------------------------
// transposeRomanNumeral — flat keys
// ---------------------------------------------------------------------------
describe('transposeRomanNumeral — flat keys', () => {
  it('uses flat spelling for flat keys', () => {
    expect(transposeRomanNumeral('I', 'F')).toBe('F');
    expect(transposeRomanNumeral('IV', 'F')).toBe('Bb');
    expect(transposeRomanNumeral('V', 'Bb')).toBe('F');
  });
});

// ---------------------------------------------------------------------------
// transposeRomanNumeral — edge cases
// ---------------------------------------------------------------------------
describe('transposeRomanNumeral — edge cases', () => {
  it('returns the input for an unrecognized numeral', () => {
    expect(transposeRomanNumeral('XYZ', 'C')).toBe('XYZ');
  });

  it('returns the input when key is not in chromatic scale', () => {
    expect(transposeRomanNumeral('I', 'Z')).toBe('I');
  });
});

// ---------------------------------------------------------------------------
// transposeProgression
// ---------------------------------------------------------------------------
describe('transposeProgression', () => {
  it('transposes I-V-vi-IV in C', () => {
    const { chords, romanNumerals } = transposeProgression('I-V-vi-IV', 'C');
    expect(chords).toEqual(['C', 'G', 'Am', 'F']);
    expect(romanNumerals).toEqual(['I', 'V', 'vi', 'IV']);
  });

  it('transposes I-V-vi-IV in G', () => {
    const { chords } = transposeProgression('I-V-vi-IV', 'G');
    expect(chords).toEqual(['G', 'D', 'Em', 'C']);
  });

  it('transposes ii-V-I in C', () => {
    const { chords } = transposeProgression('ii-V-I', 'C');
    expect(chords).toEqual(['Dm', 'G', 'C']);
  });

  it('returns empty arrays for an unknown progression', () => {
    const { chords, romanNumerals } = transposeProgression('UNKNOWN', 'C');
    expect(chords).toEqual([]);
    expect(romanNumerals).toEqual([]);
  });

  it('returns cached result on second call', () => {
    const first = transposeProgression('I-IV-V', 'C');
    const second = transposeProgression('I-IV-V', 'C');
    expect(first).toBe(second); // same reference — from cache
  });
});

// ---------------------------------------------------------------------------
// clearTranspositionCache
// ---------------------------------------------------------------------------
describe('clearTranspositionCache', () => {
  it('clears the cache so next call recomputes', () => {
    const first = transposeProgression('I-IV-V', 'C');
    clearTranspositionCache();
    const second = transposeProgression('I-IV-V', 'C');
    // Should be deeply equal but NOT the same reference
    expect(second).toEqual(first);
    expect(second).not.toBe(first);
  });
});

// ---------------------------------------------------------------------------
// getAllTransposedProgressions
// ---------------------------------------------------------------------------
describe('getAllTransposedProgressions', () => {
  it('returns an array of progression objects for a key', () => {
    const all = getAllTransposedProgressions('C');
    expect(Array.isArray(all)).toBe(true);
    expect(all.length).toBeGreaterThan(0);
    all.forEach(entry => {
      expect(entry).toHaveProperty('progression');
      expect(entry).toHaveProperty('chords');
      expect(entry).toHaveProperty('romanNumerals');
      expect(Array.isArray(entry.chords)).toBe(true);
    });
  });

  it('first progression in C yields expected chords', () => {
    const all = getAllTransposedProgressions('C');
    // The first progression is I-V-vi-IV
    expect(all[0].chords).toEqual(['C', 'G', 'Am', 'F']);
  });
});
