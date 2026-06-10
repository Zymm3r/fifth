import { describe, it, expect } from 'vitest';
import {
  getBarreChordInfo,
  getChordNotes,
  getChordIntervals,
  barreChordCache,
  parseBarreChord,
} from './barreChords.js';

// ---------------------------------------------------------------------------
// parseBarreChord
// ---------------------------------------------------------------------------
describe('parseBarreChord', () => {
  it('parses a simple major chord', () => {
    const result = parseBarreChord('F');
    expect(result).not.toBeNull();
    expect(result.rootNote).toBe('F');
    expect(result.fretPosition).toBe(1);
    expect(result.quality).toBe('');
  });

  it('parses a minor chord', () => {
    const result = parseBarreChord('Bm');
    expect(result).not.toBeNull();
    expect(result.rootNote).toBe('B');
    expect(result.quality).toBe('m');
    expect(result.barreType).toContain('minor');
  });

  it('parses a sharp chord', () => {
    const result = parseBarreChord('F#');
    expect(result).not.toBeNull();
    expect(result.rootNote).toBe('F#');
    expect(result.fretPosition).toBe(2);
  });

  it('parses a flat chord', () => {
    const result = parseBarreChord('Bb');
    expect(result).not.toBeNull();
    // Regex captures [A-G][#b]? so root is 'Bb'
    expect(result.rootNote).toBe('Bb');
  });

  it('returns null for invalid input', () => {
    expect(parseBarreChord('XYZ')).toBeNull();
    expect(parseBarreChord('')).toBeNull();
  });

  it('determines E-shape for natural root without accidental', () => {
    const result = parseBarreChord('G');
    expect(result).not.toBeNull();
    expect(result.barreType).toContain('E-shape');
  });

  it('determines A-shape for accidentals or special naturals', () => {
    const result = parseBarreChord('C#m');
    expect(result).not.toBeNull();
    expect(result.barreType).toContain('A-shape');
  });
});

// ---------------------------------------------------------------------------
// getChordNotes
// ---------------------------------------------------------------------------
describe('getChordNotes', () => {
  it('returns [C, E, G] for C major', () => {
    expect(getChordNotes('C', 'major')).toEqual(['C', 'E', 'G']);
  });

  it('returns [A, C, E] for A minor', () => {
    expect(getChordNotes('A', 'minor')).toEqual(['A', 'C', 'E']);
  });

  it('returns [B, D, F] for B dim', () => {
    expect(getChordNotes('B', 'dim')).toEqual(['B', 'D', 'F']);
  });

  it('handles sharp roots', () => {
    const notes = getChordNotes('F#', 'major');
    expect(notes).toEqual(['F#', 'A#', 'C#']);
  });

  it('handles flat roots', () => {
    const notes = getChordNotes('Bb', 'major');
    expect(notes).toEqual(['A#', 'D', 'F']);
  });

  it('returns empty array for unknown root', () => {
    expect(getChordNotes('Z', 'major')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getChordIntervals
// ---------------------------------------------------------------------------
describe('getChordIntervals', () => {
  it('returns major intervals', () => {
    expect(getChordIntervals('major')).toEqual(['1', '3', '5']);
  });

  it('returns minor intervals', () => {
    expect(getChordIntervals('minor')).toEqual(['1', '\u266D3', '5']);
  });

  it('returns dim intervals', () => {
    expect(getChordIntervals('dim')).toEqual(['1', '\u266D3', '\u266D5']);
  });
});

// ---------------------------------------------------------------------------
// getBarreChordInfo
// ---------------------------------------------------------------------------
describe('getBarreChordInfo', () => {
  it('returns full info for F major', () => {
    const info = getBarreChordInfo('F');
    expect(info).not.toBeNull();
    expect(info.chordName).toBe('F');
    expect(info.rootNote).toBe('F');
    expect(info.fretPosition).toBe(1);
    expect(info.quality).toBe('major');
    expect(info.notes).toEqual(['F', 'A', 'C']);
    expect(info.intervals).toEqual(['1', '3', '5']);
    expect(info.barreType).toContain('E-shape');
    expect(info.imagePath).toBeTruthy();
  });

  it('returns full info for Bm', () => {
    const info = getBarreChordInfo('Bm');
    expect(info).not.toBeNull();
    expect(info.quality).toBe('minor');
    expect(info.notes).toEqual(['B', 'D', 'F#']);
    expect(info.intervals).toEqual(['1', '\u266D3', '5']);
  });

  it('returns null for invalid chord', () => {
    expect(getBarreChordInfo('XYZ')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// barreChordCache
// ---------------------------------------------------------------------------
describe('barreChordCache', () => {
  it('contains pre-computed entries for common barre chords', () => {
    expect(barreChordCache.size).toBeGreaterThan(0);
    expect(barreChordCache.has('F')).toBe(true);
    expect(barreChordCache.has('Bm')).toBe(true);
  });

  it('cached F matches getBarreChordInfo("F")', () => {
    const cached = barreChordCache.get('F');
    const computed = getBarreChordInfo('F');
    expect(cached).toEqual(computed);
  });
});
