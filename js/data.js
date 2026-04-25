/* ═══════════════════════════════════════════════════════════
   data.js — Nimbus
   All static mock data used site-wide.
   In production, replace with API calls (e.g. Jikan / your backend).
   ═══════════════════════════════════════════════════════════ */

fetch("https://api.jikan.moe/v4/anime")
  .then(res => res.json())
  .then(data => console.log(data));

/* ── ANIME DATABASE ─────────────────────────────────────────
   Each entry: id, title, studio, MAL id, score, status, year,
   genres, synopsis, hasDub/hasSub flags, episodes array.
   Episodes hold a YouTube videoId for the embedded player.   */
var ANIME_DB = [ ]

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