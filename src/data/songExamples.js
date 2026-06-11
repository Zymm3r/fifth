/**
 * @fileoverview Song Examples Database
 * Maps chord progressions to well-known songs that use them.
 * Used to display real-world examples to users.
 * Includes both international and Thai (เพลงไทย) songs.
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
      { title: "Don't Stop Believin'", artist: "Journey", year: 1981, album: "Escape", genre: "Rock" },
      { title: "If I Were a Boy", artist: "Beyoncé", year: 2008, album: "I Am... Sasha Fierce", genre: "Pop" },
      // 🇹🇭 Thai Songs
      { title: "คนมีเสน่ห์", artist: "Palmy (ปาล์มมี่)", year: 2004, genre: "Thai Pop" },
      { title: "ลมหายใจ", artist: "Bodyslam (บอดี้สแลม)", year: 2006, album: "ครั้งหนึ่ง..ไม่ถึงตาย", genre: "Thai Rock" },
      { title: "ใจความสำคัญ", artist: "Scrubb (สครับ)", year: 2005, genre: "Thai Pop" },
      { title: "รักเธอ", artist: "Pause (พอส)", year: 2003, genre: "Thai Pop Rock" }
    ]
  },
  {
    progressionId: "ii-V-I",
    keyExample: "C",
    songs: [
      { title: "Autumn Leaves", artist: "Joseph Kosma", year: 1945, album: "Les Portes de la Nuit", genre: "Jazz" },
      { title: "Fly Me to the Moon", artist: "Bart Howard", year: 1954, genre: "Jazz Standard" },
      { title: "All the Things You Are", artist: "Jerome Kern", year: 1939, genre: "Jazz Standard" },
      { title: "Misty", artist: "Erroll Garner", year: 1954, genre: "Jazz" },
      // 🇹🇭 Thai Songs
      { title: "ฤดูที่แตกต่าง", artist: "Slot Machine (สล็อตแมชชีน)", year: 2010, genre: "Thai Rock" },
      { title: "จันทร์เจ้า", artist: "Loso (โลโซ)", year: 1998, album: "อันดับ 1", genre: "Thai Rock" }
    ]
  },
  {
    progressionId: "I-IV-V",
    keyExample: "A",
    songs: [
      { title: "La Bamba", artist: "Ritchie Valens", year: 1958, genre: "Rock & Roll" },
      { title: "Louie Louie", artist: "The Kingsmen", year: 1963, genre: "Garage Rock" },
      { title: "Wild Thing", artist: "The Troggs", year: 1966, genre: "Rock" },
      // 🇹🇭 Thai Songs
      { title: "ยิ้มได้", artist: "Kala (คาลา)", year: 2001, genre: "Thai Pop" },
      { title: "ก่อนฤดูฝน", artist: "The Impossibles (ดิ อิมพอสซิเบิล)", year: 1973, genre: "Thai Classic" },
      { title: "เมดอินไทยแลนด์", artist: "Carabao (คาราบาว)", year: 1984, album: "เมดอินไทยแลนด์", genre: "Phleng Phuea Chiwit" }
    ]
  },
  {
    progressionId: "vi-IV-I-V",
    keyExample: "C",
    songs: [
      { title: "Someone Like You", artist: "Adele", year: 2011, album: "21", genre: "Pop" },
      { title: "Apologize", artist: "OneRepublic", year: 2006, album: "Dreaming Out Loud", genre: "Pop Rock" },
      { title: "Hello", artist: "Adele", year: 2015, album: "25", genre: "Pop" },
      // 🇹🇭 Thai Songs
      { title: "คำยินดี", artist: "Potato (โปเตโต้)", year: 2008, genre: "Thai Pop Rock" },
      { title: "ค่าน้ำนม", artist: "Paradox (พาราด็อกซ์)", year: 2000, genre: "Thai Rock" },
      { title: "ลืมไปแล้ว", artist: "Musketeers (มัสคีเทียร์ส)", year: 2017, genre: "Thai Indie Pop" }
    ]
  },
  {
    progressionId: "I-bVII-IV",
    keyExample: "G",
    songs: [
      { title: "Sweet Child O' Mine", artist: "Guns N' Roses", year: 1987, album: "Appetite for Destruction", genre: "Hard Rock" },
      { title: "Sympathy for the Devil", artist: "The Rolling Stones", year: 1968, album: "Beggars Banquet", genre: "Rock" },
      // 🇹🇭 Thai Songs
      { title: "เท่าที่มี", artist: "Big Ass (บิ๊กแอส)", year: 2003, genre: "Thai Rock" },
      { title: "โปรดเถิดรัก", artist: "Hugo (ฮิวโก้)", year: 2009, genre: "Thai Rock" }
    ]
  },
  {
    progressionId: "I-vi-IV-V",
    keyExample: "C",
    songs: [
      { title: "Earth Angel", artist: "The Penguins", year: 1954, genre: "Doo-Wop" },
      { title: "Unchained Melody", artist: "The Righteous Brothers", year: 1965, album: "Just Once in My Life", genre: "Blue-Eyed Soul" },
      { title: "Save the Last Dance for Me", artist: "The Drifters", year: 1960, genre: "Doo-Wop" },
      { title: "Stand by Me", artist: "Ben E. King", year: 1961, genre: "Soul" },
      // 🇹🇭 Thai Songs
      { title: "ฝากไว้", artist: "Labanoon (ลาบานูน)", year: 2005, genre: "Thai Pop Rock" },
      { title: "กลับคำสาหล่า", artist: "พงษ์สิทธิ์ คำภีร์", year: 1995, genre: "Phleng Phuea Chiwit" },
      { title: "สิ่งเล็กๆ ที่เรียกว่ารัก", artist: "Klear (เคลียร์)", year: 2010, genre: "Thai Pop" }
    ]
  },
  {
    progressionId: "i-bVII-bVI-V",
    keyExample: "Am",
    songs: [
      { title: "Stairway to Heaven", artist: "Led Zeppelin", year: 1971, album: "Led Zeppelin IV", genre: "Rock" },
      { title: "Hit the Road Jack", artist: "Ray Charles", year: 1961, genre: "R&B" },
      // 🇹🇭 Thai Songs
      { title: "คิดถึง", artist: "Bodyslam (บอดี้สแลม)", year: 2004, album: "คราม", genre: "Thai Rock" },
      { title: "อย่าทำให้ฉันรักเธอ", artist: "Da Endorphine (ดา เอ็นโดรฟิน)", year: 2003, genre: "Thai Pop" },
      { title: "ถามหน่อย", artist: "Thaitanium (ไทยเทเนี่ยม)", year: 2005, genre: "Thai Hip-Hop" }
    ]
  },
  {
    progressionId: "I-III-IV-IV",
    keyExample: "D",
    songs: [
      { title: "Pachelbel Canon in D", artist: "Johann Pachelbel", year: 1680, genre: "Classical" },
      { title: "Go West", artist: "Pet Shop Boys / Village People", year: 1978, genre: "Disco" },
      { title: "Let It Be (variation)", artist: "The Beatles", year: 1970, album: "Let It Be", genre: "Rock" },
      { title: "Streets of London", artist: "Ralph McTell", year: 1969, album: "Spiral Staircase", genre: "Folk" },
      // 🇹🇭 Thai Songs
      { title: "ทะเลใจ", artist: "ไมโคร (Micro)", year: 1987, genre: "Thai Pop" },
      { title: "กว่าจะรู้", artist: "Crescendo (เครสเซนโด้)", year: 1994, genre: "Thai Pop Rock" }
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