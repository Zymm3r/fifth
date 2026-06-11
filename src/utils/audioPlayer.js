/**
 * @fileoverview Audio Engine using Tone.js
 * Primary: Tone.Sampler with real acoustic guitar samples from nbrosowsky/tonejs-instruments.
 * Fallback: Tone.PluckSynth if samples fail to load.
 *
 * Public API (unchanged):
 *   initializeAudio()
 *   playGuitarChord(chordName, chordDict, direction, time)
 *   playProgression(chords)
 *   stopProgression()
 */

// ── State ──────────────────────────────────────────────────────
let isAudioInitialized = false;
let initPromise = null;

/** @type {Tone.Sampler|null} */
let sampler = null;

/** @type {boolean} true when the Sampler loaded OK */
let samplerReady = false;

// Fallback PluckSynth instances (6 strings)
let fallbackSynths = [];

/** @type {Tone.Limiter|null} */
let limiter = null;
/** @type {Tone.Volume|null} */
let outputGain = null;

// ── Sample URL config ──────────────────────────────────────────
const SAMPLE_BASE_URL =
  'https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/guitar-acoustic/';

/**
 * We load a sparse set of samples across the guitar range (E2–E5).
 * Tone.Sampler pitch-shifts between them automatically.
 * Using every-other semitone keeps load time under ~2 s on broadband.
 */
const SAMPLE_MAP = {
  'E2':  'E2.mp3',
  'A2':  'A2.mp3',
  'D3':  'D3.mp3',
  'G3':  'G3.mp3',
  'B3':  'B3.mp3',
  'E4':  'E4.mp3',
  // Extra samples for better quality in common ranges
  'F#2': 'Fs2.mp3',
  'C3':  'C3.mp3',
  'F3':  'F3.mp3',
  'A3':  'A3.mp3',
  'C4':  'C4.mp3',
  'A4':  'A4.mp3',
};

// ── Standard tuning ────────────────────────────────────────────
const STANDARD_TUNING = [40, 45, 50, 55, 59, 64]; // E2, A2, D3, G3, B3, E4

// ── Initialization ─────────────────────────────────────────────

/**
 * Initialize Tone.js audio engine (singleton, idempotent).
 * Loads acoustic-guitar samples; falls back to PluckSynth on failure.
 * @returns {Promise<void>}
 */
export async function initializeAudio() {
  if (isAudioInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      await Tone.start();

      // Audio graph: instrument → gain → limiter → speakers
      limiter = new Tone.Limiter(-2).toDestination();
      outputGain = new Tone.Volume(-6).connect(limiter);

      // ── Try loading the Sampler ──
      try {
        sampler = new Tone.Sampler({
          urls: SAMPLE_MAP,
          baseUrl: SAMPLE_BASE_URL,
          release: 1.5,
          onload: () => {
            samplerReady = true;
            console.log('[audioPlayer] ✓ Acoustic guitar samples loaded.');
          },
          onerror: (err) => {
            console.warn('[audioPlayer] Sample load error, using PluckSynth fallback:', err);
            samplerReady = false;
          },
        }).connect(outputGain);

        // Wait up to 8 s for samples to load
        await Promise.race([
          Tone.loaded(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000)),
        ]);
      } catch (loadErr) {
        console.warn('[audioPlayer] Sampler loading failed/timed-out, using PluckSynth fallback:', loadErr);
        samplerReady = false;
      }

      // ── Always create the fallback PluckSynths ──
      for (let i = 0; i < 6; i++) {
        const synth = new Tone.PluckSynth({
          attackNoise: 1,
          dampening: 4000,
          resonance: 0.9,
          release: 1.5,
        }).connect(outputGain);
        fallbackSynths.push(synth);
      }

      isAudioInitialized = true;
      console.log(`[audioPlayer] Audio engine ready (mode: ${samplerReady ? 'Sampler' : 'PluckSynth'}).`);
    } catch (e) {
      console.error('[audioPlayer] Fatal init error:', e);
      initPromise = null;
    }
  })();

  return initPromise;
}

// ── MIDI helpers ───────────────────────────────────────────────

/**
 * Convert a fingering array + chord name into an array of { stringIndex, midiNote }.
 * Handles slash chords (e.g. C/G).
 */
function getMidiNotesForFingering(chordName, fretPositions) {
  const notes = [];
  let lowestPlayedIndex = -1;

  for (let i = 0; i < 6; i++) {
    const fret = fretPositions[i];
    if (fret !== 'X') {
      const midiNote = STANDARD_TUNING[i] + parseInt(fret, 10);
      notes.push({ stringIndex: i, midiNote });
      if (lowestPlayedIndex === -1) lowestPlayedIndex = i;
    }
  }

  // Slash-chord bass override
  if (chordName.includes('/')) {
    const parts = chordName.split('/');
    if (parts.length === 2 && lowestPlayedIndex !== -1) {
      const bassNoteName = parts[1];
      const noteMap = {
        'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
        'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8,
        'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
      };
      const pc = noteMap[bassNoteName];
      if (pc !== undefined) {
        let bassMidi = 36 + pc; // C2 = 36
        if (bassMidi < 40) bassMidi += 12;
        const low = notes.find(n => n.stringIndex === lowestPlayedIndex);
        if (low) low.midiNote = bassMidi;
      }
    }
  }

  return notes;
}

/**
 * Convert MIDI number to scientific pitch (e.g. 40 → "E2").
 */
function midiToNoteName(midi) {
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const oct = Math.floor(midi / 12) - 1;
  return names[midi % 12] + oct;
}

// ── Playback ───────────────────────────────────────────────────

/**
 * Play a guitar chord by strumming strings.
 * @param {string}   chordName  Chord label (e.g. "Am", "C/G")
 * @param {string[]} chordDict  6-element fret array ["X","0","2","2","1","0"]
 * @param {string}   direction  'down' (6→1) or 'up' (1→6)
 * @param {number}   [time]     Tone.js transport time; defaults to Tone.now()
 */
export function playGuitarChord(chordName, chordDict, direction = 'down', time = undefined) {
  if (!isAudioInitialized) {
    console.warn('[audioPlayer] Not initialised yet.');
    return;
  }
  if (!chordDict || chordDict.length !== 6) return;

  const notesToPlay = getMidiNotesForFingering(chordName, chordDict);
  if (notesToPlay.length === 0) return;

  if (direction === 'up') notesToPlay.reverse();

  const startTime = time !== undefined ? time : Tone.now();
  const strumDelay = 0.03; // 30 ms per string

  notesToPlay.forEach((noteData, index) => {
    const noteTime = startTime + index * strumDelay;

    if (samplerReady && sampler) {
      // ── Sampler path (realistic) ──
      const noteName = midiToNoteName(noteData.midiNote);
      sampler.triggerAttackRelease(noteName, '2n', noteTime);
    } else {
      // ── PluckSynth fallback ──
      const freq = Tone.Frequency(noteData.midiNote, 'midi').toFrequency();
      const synth = fallbackSynths[noteData.stringIndex];
      if (synth) synth.triggerAttackRelease(freq, '+1.5', noteTime);
    }
  });
}

// ── Progression playback (Transport-based) ─────────────────────
let currentProgressionEvents = [];

/**
 * Play a chord progression using Tone.Transport at 130 BPM.
 * @param {Array<{chordName: string, strings: string[]}>} chords
 */
export function playProgression(chords) {
  if (!isAudioInitialized) return;

  stopProgression();

  Tone.Transport.bpm.value = 130;
  const barDuration = 4 / (130 / 60); // 4 beats at 130 BPM

  chords.forEach((chordData, index) => {
    const eventId = Tone.Transport.schedule((time) => {
      playGuitarChord(chordData.chordName, chordData.strings, 'down', time);
    }, index * barDuration);
    currentProgressionEvents.push(eventId);
  });

  // Auto-stop after last chord rings out
  const stopId = Tone.Transport.schedule(() => {
    Tone.Transport.stop();
  }, chords.length * barDuration + 2);
  currentProgressionEvents.push(stopId);

  Tone.Transport.start();
}

/**
 * Stop the currently playing progression and clear all scheduled events.
 */
export function stopProgression() {
  currentProgressionEvents.forEach(id => Tone.Transport.clear(id));
  currentProgressionEvents = [];
  Tone.Transport.stop();
  Tone.Transport.position = 0;
}
