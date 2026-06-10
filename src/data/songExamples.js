/**
 * @fileoverview Song Examples Database
 * Maps chord progressions to well-known songs that use them.
 * Used to display real-world examples to users.
 */

/**
 * @typedef {Object} SongExample
 * @property {string} title - Song title
 * @property {string} artist - Artist or band name
 * @property {number} [year] - Release year (optional)
 * @property {string} [album] - Album name (optional)
 * @property {string} [genre] - Genre tag (optional)
 */

/**
 * @typedef {Object} ProgressionSongs
 * @property {string} progressionId - Matches Progression.id
 * @property {SongExample[]} songs - List of songs using this progression
 * @property {string} [keyExample] - Example key the song is commonly played in
 */

/** @type {ProgressionSongs[]} */
const SONG_EXAMPLES = [
  {
    progressionId: "I-V-vi-IV",
    keyExample: "C",
    songs: [
      { title: "Let It Be", artist: "The Beatles", year: 1970, album: "Let It Be", genre: "Rock" },
      { title: "Someone Like You", artist: "Adele", year: 2011, album: "21", genre: "Pop" },
      { title: "With or Without You", artist: "U2", year: 1987, album: "The Joshua Tree", genre: "Rock" },
      { title: "Don't Stop Believin'", artist: "Journey", year: 1981, album: "Escape", genre: "Rock" },
      { title: "I'm Yours", artist: "Jason Mraz", year: 2008, album: "We Sing. We Dance. We Steal Things.", genre: "Pop" },
      { title: "No Woman No Cry", artist: "Bob Marley & The Wailers", year: 1974, album: "Natty Dread", genre: "Reggae" },
      { title: "If I Were a Boy", artist: "Beyoncé", year: 2008, album: "I Am... Sasha Fierce", genre: "Pop" }
    ]
  },
  {
    progressionId: "ii-V-I",
    keyExample: "C",
    songs: [
      { title: "Autumn Leaves", artist: "Joseph Kosma", year: 1945, album: "Les Portes de la Nuit", genre: "Jazz" },
      { title: "Fly Me to the Moon", artist: "Bart Howard", year: 1954, genre: "Jazz Standard" },
      { title: "Girl from Ipanema", artist: "Antônio Carlos Jobim", year: 1962, album: "Getz/Gilberto", genre: "Bossa Nova" },
      { title: "All the Things You Are", artist: "Jerome Kern", year: 1939, genre: "Jazz Standard" },
      { title: "Misty", artist: "Erroll Garner", year: 1954, genre: "Jazz" }
    ]
  },
  {
    progressionId: "I-IV-V",
    keyExample: "A",
    songs: [
      { title: "Johnny B. Goode", artist: "Chuck Berry", year: 1958, album: "Chuck Berry Is on Top", genre: "Rock & Roll" },
      { title: "La Bamba", artist: "Ritchie Valens", year: 1958, genre: "Rock & Roll" },
      { title: "Louie Louie", artist: "The Kingsmen", year: 1963, genre: "Garage Rock" },
      { title: "Wild Thing", artist: "The Troggs", year: 1966, genre: "Rock" },
      { title: "Hound Dog", artist: "Elvis Presley", year: 1956, genre: "Rock & Roll" },
      { title: "Tutti Frutti", artist: "Little Richard", year: 1955, genre: "Rock & Roll" }
    ]
  },
  {
    progressionId: "vi-IV-I-V",
    keyExample: "C",
    songs: [
      { title: "Someone Like You", artist: "Adele", year: 2011, album: "21", genre: "Pop" },
      { title: "Apologize", artist: "OneRepublic", year: 2006, album: "Dreaming Out Loud", genre: "Pop Rock" },
      { title: "Complicated", artist: "Avril Lavigne", year: 2002, album: "Let Go", genre: "Pop Rock" },
      { title: "Hello", artist: "Adele", year: 2015, album: "25", genre: "Pop" }
    ]
  },
  {
    progressionId: "I-bVII-IV",
    keyExample: "G",
    songs: [
      { title: "Sweet Child O' Mine", artist: "Guns N' Roses", year: 1987, album: "Appetite for Destruction", genre: "Hard Rock" },
      { title: "Sympathy for the Devil", artist: "The Rolling Stones", year: 1968, album: "Beggars Banquet", genre: "Rock" },
      { title: "You Give Love a Bad Name", artist: "Bon Jovi", year: 1986, album: "Slippery When Wet", genre: "Rock" },
      { title: "Born to Be Wild", artist: "Steppenwolf", year: 1968, album: "Steppenwolf", genre: "Hard Rock" }
    ]
  },
  {
    progressionId: "I-vi-IV-V",
    keyExample: "C",
    songs: [
      { title: "Earth Angel", artist: "The Penguins", year: 1954, genre: "Doo-Wop" },
      { title: "Unchained Melody", artist: "The Righteous Brothers", year: 1965, album: "Just Once in My Life", genre: "Blue-Eyed Soul" },
      { title: "Save the Last Dance for Me", artist: "The Drifters", year: 1960, genre: "Doo-Wop" },
      { title: "Stand by Me", artist: "Ben E. King", year: 1961, genre: "Soul" }
    ]
  },
  {
    progressionId: "i-bVII-bVI-V",
    keyExample: "Am",
    songs: [
      { title: "House of the Rising Sun", artist: "The Animals", year: 1964, album: "The Animals", genre: "Folk Rock" },
      { title: "Stairway to Heaven", artist: "Led Zeppelin", year: 1971, album: "Led Zeppelin IV", genre: "Rock" },
      { title: "Hit the Road Jack", artist: "Ray Charles", year: 1961, genre: "R&B" }
    ]
  },
  {
    progressionId: "I-III-IV-IV",
    keyExample: "D",
    songs: [
      { title: "Pachelbel Canon in D", artist: "Johann Pachelbel", year: 1680, genre: "Classical" },
      { title: "Go West", artist: "Pet Shop Boys / Village People", year: 1978, genre: "Disco" },
      { title: "Let It Be (variation)", artist: "The Beatles", year: 1970, album: "Let It Be", genre: "Rock" },
      { title: "Streets of London", artist: "Ralph McTell", year: 1969, album: "Spiral Staircase", genre: "Folk" }
    ]
  }
];

// Freeze to prevent mutation
Object.freeze(SONG_EXAMPLES);
Object.freeze(SONG_EXAMPLES.map(ps => {
  ps.songs.forEach(s => Object.freeze(s));
  return Object.freeze(ps);
}));

export default SONG_EXAMPLES;