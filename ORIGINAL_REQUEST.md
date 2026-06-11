# Original User Request

## Initial Request — 2026-06-11T12:32:52Z

# Teamwork Project Prompt

Fix global variable errors (`CHORD_DICT`), fix DOM traversal errors (`closest`), and implement realistic guitar chord and progression audio playback using Tone.js.

Working directory: c:/Users/HP/OneDrive/เอกสาร/circle/fifth
Integrity mode: development

## Requirements

### R1. Fix JavaScript Errors
- Remove implicit global usage of `CHORD_DICT`. Export/import it correctly across files or pass it explicitly.
- Refactor `getChordFingeringInternal()` so it does not depend on global scope.
- Fix `e.target.closest is not a function` errors. Add a safe Element guard before `closest()` and refactor all usages to use a new `safeClosest()` helper.

### R2. Audio Engine Setup
- Add `Tone.js` (version 14.8.49) via CDN to `index.html`.
- Create `src/utils/audioPlayer.js` with a singleton audio initialization (`initializeAudio()`) that calls `await Tone.start()` once upon the first `pointerdown` event on the document (to comply with browser autoplay policies).
- Initialize 6 instances of `Tone.PluckSynth` (one for each string) routed through a `Tone.Limiter` and safe output gain to avoid clipping.

### R3. Guitar Chord Playback API
- Implement `playGuitarChord(chordName, chordDict, direction='down')`.
- Convert fret positions from the dictionary to actual frequencies based on standard tuning MIDI: `[40, 45, 50, 55, 59, 64]`. Ignore muted strings (`X`).
- Apply a 30ms delay per string to simulate a strum. Support both downstroke (6→1) and upstroke (1→6).
- **Slash Chords:** Support slash chords (e.g., C/G) by dynamically calculating the bass note and overriding the lowest played string to match the bass note.

### R4. UI Integration & Progression Playback
- Import the audio API into `src/components/progressionExplorer.js`.
- Add a 🔊 Play Chord button inside the chord modal.
- Make clicking the SVG chord diagram play the chord.
- Add a ▶ Play Progression button to each progression card.
- **Sequencing:** Use `Tone.Transport` to sequence progression playback at exactly 100 BPM (1 bar per chord).

## Acceptance Criteria

### Verification & Testing
- [ ] Programmatic logic checks pass: `CHORD_DICT` is properly exported/imported, and `e.target.closest` is safely guarded.
- [ ] No audio clipping occurs during rapid playback (verified via limiter implementation).
- [ ] `Tone.Transport` successfully sequences chords at 100 BPM.

### Manual Verification (User)
- [ ] Audio plays back smoothly across Chrome, Edge, Safari, and iOS.
- [ ] Strumming direction matches the `direction` parameter.
- [ ] Chord voicings exactly match the fingering defined in `CHORD_DICT`, with slash chords correctly playing the alternate bass note.
