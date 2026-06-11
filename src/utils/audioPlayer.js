/**
 * @fileoverview Audio Engine using Tone.js
 * Implements realistic guitar chord playback using Tone.PluckSynth and limits output to prevent clipping.
 */

// We assume Tone is available globally via CDN.
let isAudioInitialized = false;
let initPromise = null;

// 6 synths for 6 strings
let synths = [];
let limiter = null;
let outputGain = null;

/**
 * Initialize Tone.js audio engine as a singleton.
 * @returns {Promise<void>}
 */
export async function initializeAudio() {
  if (isAudioInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // Must await Tone.start() on user interaction
      await Tone.start();
      
      // Setup audio graph
      limiter = new Tone.Limiter(-2).toDestination();
      outputGain = new Tone.Volume(-10).connect(limiter);

      // Initialize 6 PluckSynths (one per string)
      for (let i = 0; i < 6; i++) {
        const synth = new Tone.PluckSynth({
          attackNoise: 1,
          dampening: 4000,
          resonance: 0.9,
          release: 1.5,
        }).connect(outputGain);
        synths.push(synth);
      }

      isAudioInitialized = true;
      console.log("[audioPlayer] Audio engine initialized successfully.");
    } catch (e) {
      console.error("[audioPlayer] Failed to initialize audio engine:", e);
      initPromise = null; // Reset so we can try again
    }
  })();

  return initPromise;
}

// Standard tuning MIDI mapping: E2, A2, D3, G3, B3, E4
const STANDARD_TUNING = [40, 45, 50, 55, 59, 64];

/**
 * Get MIDI notes for a given chord dictionary fingering array.
 * @param {string} chordName 
 * @param {string[]} fretPositions Array of 6 frets, e.g., ["X", "3", "2", "0", "1", "0"]
 * @returns {number[]} Array of MIDI notes to play
 */
function getMidiNotesForFingering(chordName, fretPositions) {
  let notes = [];
  let lowestPlayedIndex = -1;

  for (let i = 0; i < 6; i++) {
    const fret = fretPositions[i];
    if (fret !== "X") {
      const midiNote = STANDARD_TUNING[i] + parseInt(fret, 10);
      notes.push({ stringIndex: i, midiNote });
      if (lowestPlayedIndex === -1) {
        lowestPlayedIndex = i;
      }
    }
  }

  // Handle slash chords dynamically (e.g. C/G)
  if (chordName.includes('/')) {
    const parts = chordName.split('/');
    if (parts.length === 2 && lowestPlayedIndex !== -1) {
      const bassNoteName = parts[1];
      // Convert bass note to a rough bass MIDI frequency
      // Let's find the nearest MIDI note around octave 2 or 3 for the bass
      const noteMap = {
        'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
        'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8,
        'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
      };
      
      const pc = noteMap[bassNoteName];
      if (pc !== undefined) {
        // E2 is 40. We want a bass note between E2 (40) and D#3 (51).
        let bassMidi = 36 + pc; // C2 is 36
        if (bassMidi < 40) bassMidi += 12; // Bring up to at least E2 range (40+)
        
        // Replace the lowest played string's note with this calculated bass note
        const lowestNoteObj = notes.find(n => n.stringIndex === lowestPlayedIndex);
        if (lowestNoteObj) {
          lowestNoteObj.midiNote = bassMidi;
        }
      }
    }
  }

  return notes;
}

/**
 * Play a guitar chord by strumming the strings.
 * @param {string} chordName The name of the chord.
 * @param {string[]} chordDict Array of 6 frets.
 * @param {string} direction 'down' or 'up'
 * @param {number} time Tone.js scheduling time (optional)
 */
export function playGuitarChord(chordName, chordDict, direction = 'down', time = undefined) {
  if (!isAudioInitialized) {
    console.warn("[audioPlayer] Audio not initialized. Call initializeAudio() first.");
    return;
  }

  if (!chordDict || chordDict.length !== 6) return;

  const notesToPlay = getMidiNotesForFingering(chordName, chordDict);
  if (notesToPlay.length === 0) return;

  // For downstroke, play lowest pitch first. For upstroke, highest pitch first.
  if (direction === 'up') {
    notesToPlay.reverse();
  }

  const startTime = time !== undefined ? time : Tone.now();
  const strumDelay = 0.03; // 30ms

  notesToPlay.forEach((noteData, index) => {
    // Determine frequency
    const freq = Tone.Frequency(noteData.midiNote, "midi").toFrequency();
    const synth = synths[noteData.stringIndex];
    
    // Trigger the synth
    synth.triggerAttackRelease(freq, "+1.5", startTime + (index * strumDelay));
  });
}

// Progression playback state
let currentProgressionEvents = [];

/**
 * Play a progression of chords sequentially using Tone.Transport.
 * @param {Array<{chordName: string, strings: string[]}>} chords Array of chord objects
 */
export function playProgression(chords) {
  if (!isAudioInitialized) return;

  stopProgression(); // Clear any existing playing progression

  const bps = 100 / 60; // 100 BPM
  const barDuration = 4 / bps; // 4/4 time, 1 bar per chord = 4 beats
  
  // Set Transport BPM
  Tone.Transport.bpm.value = 100;

  // Schedule each chord
  chords.forEach((chordData, index) => {
    const startTime = index * barDuration;
    // Downstroke on the 1st beat
    const eventId = Tone.Transport.schedule((time) => {
      playGuitarChord(chordData.chordName, chordData.strings, 'down', time);
    }, startTime);
    
    currentProgressionEvents.push(eventId);
  });

  // Stop transport after the last chord has finished ringing
  const stopTime = chords.length * barDuration + 2; 
  const stopEventId = Tone.Transport.schedule((time) => {
    Tone.Transport.stop();
  }, stopTime);
  currentProgressionEvents.push(stopEventId);

  // Start transport
  Tone.Transport.start();
}

/**
 * Stop currently playing progression.
 */
export function stopProgression() {
  if (currentProgressionEvents.length > 0) {
    currentProgressionEvents.forEach(id => Tone.Transport.clear(id));
    currentProgressionEvents = [];
  }
  Tone.Transport.stop();
  Tone.Transport.position = 0;
}
