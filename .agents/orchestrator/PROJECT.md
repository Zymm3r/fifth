# Project: Guitar Chord Audio Engine

## Architecture
- `src/utils/audioPlayer.js` handles all Tone.js interactions, initialization, and sequencing.
- `src/data/chordDictionary.js` stores chord shapes. Needs explicit exports.
- `src/components/progressionExplorer.js` handles UI and DOM events, interacting with audioPlayer.js for sound.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Fix JS Errors | `CHORD_DICT` export/import, `getChordFingeringInternal()` refactoring, `e.target.closest` fix with `safeClosest()`. | none | PLANNED |
| 2 | Audio Engine & API | Add Tone.js CDN to `index.html`. Create `src/utils/audioPlayer.js` for init, PluckSynths, limiter, and `playGuitarChord`. | M1 | PLANNED |
| 3 | UI Integration | Import audio into `progressionExplorer.js`. Add Play buttons. Sequence with `Tone.Transport` at 100BPM. | M2 | PLANNED |

## Interface Contracts
### `src/utils/audioPlayer.js`
- `initializeAudio()`: Initializes Tone.start() and synths on first pointerdown.
- `playGuitarChord(chordName, chordDict, direction='down')`: Plays a chord array sequentially.
- `playProgression(progressionObj, chordDict)`: Uses `Tone.Transport` to sequence progression playback at 100 BPM.

### `src/utils/domUtils.js` (suggested for safeClosest)
- `safeClosest(element, selector)`: returns closest element safely matching selector.

## Code Layout
- Root: `index.html`, `script.js`
- Data: `src/data/chordDictionary.js`
- Utils: `src/utils/audioPlayer.js` (new), `src/utils/chordLookup.js`
- Components: `src/components/progressionExplorer.js`
