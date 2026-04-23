/* ═══════════════════════════════════════════════════════════
   data.js — Nimbus
   All static mock data used site-wide.
   In production, replace with API calls (e.g. Jikan / your backend).
   ═══════════════════════════════════════════════════════════ */

/* ── ANIME DATABASE ─────────────────────────────────────────
   Each entry: id, title, studio, MAL id, score, status, year,
   genres, synopsis, hasDub/hasSub flags, episodes array.
   Episodes hold a YouTube videoId for the embedded player.   */
var ANIME_DB = [
  {
    id: 1, title: "Demon Slayer: Kimetsu no Yaiba", studio: "ufotable",
    malId: 38000, score: 8.7, status: "ongoing", year: 2019,
    genres: ["Action","Fantasy","Historical"],
    synopsis: "Tanjiro Kamado, a kind-hearted boy who sells charcoal for a living, finds his family slaughtered by a demon. To make matters worse, his younger sister Nezuko, the sole survivor, has been transformed into a demon herself.",
    hasDub: true, hasSub: true, newEp: true, totalEps: 44,
    poster: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
    banner: "https://i.imgur.com/YmHUyef.jpg",
    episodes: [
      { id:1, title:"Cruelty",                      thumb:"https://cdn.myanimelist.net/images/anime/1286/99889.jpg", duration:"24 min", videoId:"VQGCKyvzIM4" },
      { id:2, title:"Trainer Sakonji Urokodaki",    thumb:"https://cdn.myanimelist.net/images/anime/1286/99889.jpg", duration:"24 min", videoId:"VQGCKyvzIM4" },
      { id:3, title:"Sabito and Makomo",             thumb:"https://cdn.myanimelist.net/images/anime/1286/99889.jpg", duration:"24 min", videoId:"VQGCKyvzIM4" },
      { id:4, title:"Final Selection",               thumb:"https://cdn.myanimelist.net/images/anime/1286/99889.jpg", duration:"24 min", videoId:"VQGCKyvzIM4" },
    ]
  },
  {
    id: 2, title: "Jujutsu Kaisen", studio: "MAPPA",
    malId: 40748, score: 8.6, status: "ongoing", year: 2020,
    genres: ["Action","Supernatural","School"],
    synopsis: "A boy swallows a cursed talisman — the finger of a demon — and becomes cursed himself. He enters a shaman's school in hopes of finding a cure.",
    hasDub: true, hasSub: true, newEp: true, totalEps: 47,
    poster: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg",
    banner: "https://i.imgur.com/TkFrEbF.jpg",
    episodes: [
      { id:1, title:"Ryomen Sukuna",  thumb:"https://cdn.myanimelist.net/images/anime/1171/109222.jpg", duration:"24 min", videoId:"pkKu9hLT-t8" },
      { id:2, title:"For Myself",     thumb:"https://cdn.myanimelist.net/images/anime/1171/109222.jpg", duration:"24 min", videoId:"pkKu9hLT-t8" },
      { id:3, title:"Girl of Steel",  thumb:"https://cdn.myanimelist.net/images/anime/1171/109222.jpg", duration:"24 min", videoId:"pkKu9hLT-t8" },
    ]
  },
  {
    id: 3, title: "Attack on Titan", studio: "MAPPA / WIT Studio",
    malId: 16498, score: 9.0, status: "completed", year: 2013,
    genres: ["Action","Drama","Dark Fantasy"],
    synopsis: "After his hometown is destroyed and his mother is killed, young Eren Yeager vows to cleanse the earth of the giant humanoid Titans that have brought humanity to the brink of extinction.",
    hasDub: true, hasSub: true, newEp: false, totalEps: 87,
    poster: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
    banner: "https://i.imgur.com/wuqtjS4.jpg",
    episodes: [
      { id:1, title:"To You, in 2000 Years",        thumb:"https://cdn.myanimelist.net/images/anime/10/47347.jpg", duration:"24 min", videoId:"MGRm4IzK1SQ" },
      { id:2, title:"That Day",                     thumb:"https://cdn.myanimelist.net/images/anime/10/47347.jpg", duration:"24 min", videoId:"MGRm4IzK1SQ" },
      { id:3, title:"A Dim Light Amid Despair",     thumb:"https://cdn.myanimelist.net/images/anime/10/47347.jpg", duration:"24 min", videoId:"MGRm4IzK1SQ" },
    ]
  },
  {
    id: 4, title: "Chainsaw Man", studio: "MAPPA",
    malId: 44511, score: 8.5, status: "ongoing", year: 2022,
    genres: ["Action","Horror","Dark Fantasy"],
    synopsis: "Denji is a teenage boy living with a Chainsaw Devil named Pochita. Due to the debt his father left behind, he has been living a rock-bottom life while repaying his debt.",
    hasDub: true, hasSub: true, newEp: false, totalEps: 12,
    poster: "https://cdn.myanimelist.net/images/anime/1806/126216.jpg",
    banner: "https://i.imgur.com/b3FNqBP.jpg",
    episodes: [
      { id:1, title:"Dog & Chainsaw",    thumb:"https://cdn.myanimelist.net/images/anime/1806/126216.jpg", duration:"24 min", videoId:"q9L3tDd52Fg" },
      { id:2, title:"Arrival in Tokyo",  thumb:"https://cdn.myanimelist.net/images/anime/1806/126216.jpg", duration:"24 min", videoId:"q9L3tDd52Fg" },
    ]
  },
  {
    id: 5, title: "Frieren: Beyond Journey's End", studio: "Madhouse",
    malId: 52991, score: 9.1, status: "completed", year: 2023,
    genres: ["Adventure","Fantasy","Slice of Life"],
    synopsis: "The adventure is over but life goes on for an elf mage just beginning to explore what these experiences mean to her.",
    hasDub: true, hasSub: true, newEp: false, totalEps: 28,
    poster: "https://cdn.myanimelist.net/images/anime/1015/138006.jpg",
    banner: "https://i.imgur.com/qG0vYm5.jpg",
    episodes: [
      { id:1, title:"Journey's End",                    thumb:"https://cdn.myanimelist.net/images/anime/1015/138006.jpg", duration:"24 min", videoId:"lWNQQrZkBrI" },
      { id:2, title:"The Value of Something Eternal",   thumb:"https://cdn.myanimelist.net/images/anime/1015/138006.jpg", duration:"24 min", videoId:"lWNQQrZkBrI" },
    ]
  },
  {
    id: 6, title: "Solo Leveling", studio: "A-1 Pictures",
    malId: 55041, score: 8.5, status: "ongoing", year: 2024,
    genres: ["Action","Fantasy","Isekai"],
    synopsis: "Known as the weakest of all Hunters, Sung Jinwoo is the weakest of the weak. One day he barely survives a horrific double dungeon that would have killed most.",
    hasDub: true, hasSub: true, newEp: true, totalEps: 13,
    poster: "https://cdn.myanimelist.net/images/anime/1887/138744.jpg",
    banner: "https://i.imgur.com/S3LnYT2.jpg",
    episodes: [
      { id:1, title:"I'm Used to It",             thumb:"https://cdn.myanimelist.net/images/anime/1887/138744.jpg", duration:"23 min", videoId:"jSmFT9PGblM" },
      { id:2, title:"If I Had One More Chance",   thumb:"https://cdn.myanimelist.net/images/anime/1887/138744.jpg", duration:"23 min", videoId:"jSmFT9PGblM" },
    ]
  },
  {
    id: 7, title: "Vinland Saga", studio: "WIT Studio",
    malId: 37521, score: 8.7, status: "completed", year: 2019,
    genres: ["Action","Adventure","Historical","Drama"],
    synopsis: "As a child, Thorfinn sat at the feet of the great Leif Ericson and thrilled to stories of a land far to the west. But his youthful fantasies were shattered by a mercenary raid.",
    hasDub: true, hasSub: true, newEp: false, totalEps: 48,
    poster: "https://cdn.myanimelist.net/images/anime/1170/124312.jpg",
    banner: "https://i.imgur.com/FTrLHRl.jpg",
    episodes: [
      { id:1, title:"Normanni",  thumb:"https://cdn.myanimelist.net/images/anime/1170/124312.jpg", duration:"48 min", videoId:"pC8mU7iqBKs" },
      { id:2, title:"Þrasnes",   thumb:"https://cdn.myanimelist.net/images/anime/1170/124312.jpg", duration:"22 min", videoId:"pC8mU7iqBKs" },
    ]
  },
  {
    id: 8, title: "My Hero Academia", studio: "Bones",
    malId: 31964, score: 7.8, status: "completed", year: 2016,
    genres: ["Action","Superhero","School"],
    synopsis: "In a world where most people have superpowers, a boy born without any dreams of becoming the greatest hero of all.",
    hasDub: true, hasSub: true, newEp: false, totalEps: 138,
    poster: "https://cdn.myanimelist.net/images/anime/10/78745.jpg",
    banner: "https://i.imgur.com/JFwnPLz.jpg",
    episodes: [
      { id:1, title:"Izuku Midoriya: Origin",          thumb:"https://cdn.myanimelist.net/images/anime/10/78745.jpg", duration:"24 min", videoId:"EPVSkvadRfc" },
      { id:2, title:"What It Takes to Be a Hero",      thumb:"https://cdn.myanimelist.net/images/anime/10/78745.jpg", duration:"24 min", videoId:"EPVSkvadRfc" },
    ]
  },
];

/* ── COMING SOON ────────────────────────────────────────────
   Upcoming anime shown on Home and the Schedule page.        */
var COMING_SOON = [
  {
    id: 101, title: "Bleach: Thousand-Year Blood War — Part 4",
    releaseDate: "July 2025", genres: ["Action","Supernatural"],
    poster: "https://cdn.myanimelist.net/images/anime/1370/134321.jpg",
    synopsis: "The final arc of Bleach continues as Ichigo faces the Quincy King."
  },
  {
    id: 102, title: "Dungeon Meshi Season 2",
    releaseDate: "October 2025", genres: ["Adventure","Fantasy","Comedy"],
    poster: "https://cdn.myanimelist.net/images/anime/1358/135861.jpg",
    synopsis: "Laios and the gang continue their dungeon dining adventures."
  },
  {
    id: 103, title: "One Piece: Egghead Arc (Part 2)",
    releaseDate: "Spring 2025", genres: ["Action","Adventure","Comedy"],
    poster: "https://cdn.myanimelist.net/images/anime/1244/138851.jpg",
    synopsis: "The Straw Hats continue their daring escape from Egghead Island."
  },
  {
    id: 104, title: "Re:Zero Season 3 Part 2",
    releaseDate: "Summer 2025", genres: ["Isekai","Fantasy","Drama"],
    poster: "https://cdn.myanimelist.net/images/anime/1521/135919.jpg",
    synopsis: "Subaru continues to fight alongside new allies in the Sanctuary arc's climax."
  },
];

/* ── NEWS TICKER ITEMS ──────────────────────────────────────
   Shown in the scrolling strip at the top of the home page.  */
var UPDATES = [
  { label: "Demon Slayer S4 Ep 8",               tag: "NEW"  },
  { label: "Jujutsu Kaisen S3 Ep 12",            tag: "NEW"  },
  { label: "Solo Leveling Season 2 confirmed",   tag: "NEWS" },
  { label: "Chainsaw Man Part 2 announced",      tag: "NEWS" },
  { label: "Frieren Movie announced",            tag: "NEWS" },
  { label: "Attack on Titan Special Ep released",tag: "NEW"  },
  { label: "Vinland Saga S3 in production",      tag: "NEWS" },
  { label: "My Hero Academia Final Season confirmed", tag: "NEWS" },
];

/* ── MOCK COMMENTS ──────────────────────────────────────────
   Pre-seeded comments keyed by "{animeId}-{epId}".
   In production, replace with a comment API / database.      */
var INITIAL_COMMENTS = {
  "1-1": [
    { id:1, user:"Kenshin42",  avatar:"K", text:"The animation quality is insane. ufotable never misses.",                             time:"2h ago",  likes:142, liked:false },
    { id:2, user:"AnimeGuru",  avatar:"A", text:"First episode hit different. Tanjiro's reaction to the family scene is so well done.", time:"5h ago",  likes:87,  liked:false },
    { id:3, user:"NezukoFan",  avatar:"N", text:"The music in this episode sets the tone perfectly for the whole series.",              time:"1d ago",  likes:64,  liked:false },
  ],
  "2-1": [
    { id:1, user:"JJKFan",       avatar:"J", text:"Sukuna's design is just *chef's kiss*. MAPPA went all out.",             time:"3h ago", likes:203, liked:false },
    { id:2, user:"CursedEnergy", avatar:"C", text:"The way they adapted the manga in this episode was perfect.",            time:"6h ago", likes:95,  liked:false },
  ],
};
