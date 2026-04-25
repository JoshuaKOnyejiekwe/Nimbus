/* ═══════════════════════════════════════════════════════════
   data.js — Nimbus (DYNAMIC)
   Fetches live data from Jikan (MAL) and AniList APIs.
   Exposes a global window.NimbusData promise that resolves
   once data is ready, plus helpers used across pages.
   ═══════════════════════════════════════════════════════════ */

/* ── STREAMING SOURCES ──────────────────────────────────────
   Priority order per episode. Each source is tried in sequence
   until one loads successfully. All are public/free embeds.   */
const STREAM_SOURCES = [
  /* gogoanime embed — most reliable, widest catalog */
  (slug, ep) => `https://gogoanime3.co/embed/${slug}-episode-${ep}`,
  /* 9anime fallback */
  (slug, ep) => `https://9anime.to/embed/${slug}-episode-${ep}`,
  /* AllAnime via anify */
  (slug, ep) => `https://anify.tv/embed/anime/${slug}/${ep}`,
];

/* Map MAL anime IDs → gogoanime slugs for direct embedding.
   Extend this list as needed; missing entries fall back to
   the AniList trailer or the YouTube search page.            */
const MAL_TO_GOGO = {
  5114:  "fullmetal-alchemist-brotherhood",
  1535:  "death-note",
  11061: "hunter-x-hunter-2011",
  9253:  "steins-gate",
  38000: "demon-slayer-kimetsu-no-yaiba",
  40748: "jujutsu-kaisen",
  41467: "shingeki-no-kyojin-the-final-season-part-2",
  48316: "spy-x-family",
  51009: "vinland-saga-season-2",
  52991: "sousou-no-frieren",
  54595: "dungeon-meshi",
  50739: "oshi-no-ko",
  49596: "jigokuraku",
  50265: "dr-stone-new-world",
  47917: "bleach-sennen-kessen-hen",
  42938: "mushoku-tensei-isekai-ittara-honki-dasu",
  40456: "dr-stone",
  37779: "yakusoku-no-neverland",
  16498: "shingeki-no-kyojin",
  21: "one-piece",
  20: "naruto",
  1735: "naruto-shippuuden",
  269:  "bleach",
  6547: "angel-beats",
  15417:"ansatsu-kyoushitsu",
  28977: "koe-no-katachi",
  45576: "shingeki-no-kyojin-the-final-season-part-3",
};

/* ── NEWS TICKER ITEMS ─────────────────────────────────────── */
var UPDATES = [
  { label: "Demon Slayer S4 Ep 8",                tag: "NEW"  },
  { label: "Jujutsu Kaisen S3 Ep 12",             tag: "NEW"  },
  { label: "Solo Leveling Season 2 confirmed",    tag: "NEWS" },
  { label: "Chainsaw Man Part 2 announced",       tag: "NEWS" },
  { label: "Frieren Movie announced",             tag: "NEWS" },
  { label: "Attack on Titan Special Ep released", tag: "NEW"  },
  { label: "Vinland Saga S3 in production",       tag: "NEWS" },
  { label: "My Hero Academia Final Season",       tag: "NEWS" },
];

/* ── INITIAL COMMENTS (kept as seed data) ─────────────────── */
var INITIAL_COMMENTS = {
  "5114-1": [
    { id:1, user:"AlchemyFan", avatar:"A", text:"The Brotherhood adaptation is flawless from ep 1.", time:"2d ago", likes:42, liked:false },
    { id:2, user:"EdwardElric_fan", avatar:"E", text:"Better than the 2003 version in every way.", time:"5d ago", likes:28, liked:false },
  ],
  "1535-1": [
    { id:1, user:"Kira_Supremacy", avatar:"K", text:"Light's plan in ep 1 already shows his genius.", time:"1d ago", likes:55, liked:false },
  ],
};

/* ── API HELPERS ─────────────────────────────────────────────  */

/* Jikan v4 — wraps fetch with a simple rate-limit retry.
   Jikan has a 60 req/min cap; we back off 1s on 429.         */
async function jikan(path, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const url = `https://api.jikan.moe/v4${path}${qs ? "?" + qs : ""}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url);
    if (res.status === 429) { await sleep(1200); continue; }
    if (!res.ok) throw new Error(`Jikan ${res.status}: ${path}`);
    const json = await res.json();
    return json.data;
  }
  throw new Error("Jikan rate limit exceeded: " + path);
}

/* AniList GraphQL wrapper */
async function anilist(query, variables = {}) {
  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error("AniList error " + res.status);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ── ANIME NORMALISER ────────────────────────────────────────
   Converts a raw Jikan anime object into the shape the
   Nimbus components expect, enriching with AniList data.     */
function normaliseAnime(raw, alData = null) {
  const malId = raw.mal_id;
  const gogoSlug = MAL_TO_GOGO[malId] || null;

  // Build episodes array (placeholder — real eps loaded on detail open)
  const totalEps = raw.episodes || (raw.status === "Currently Airing" ? "?" : 12);
  const epCount  = typeof totalEps === "number" ? totalEps : 13;

  const episodes = Array.from({ length: Math.min(epCount, 50) }, (_, i) => ({
    id: i + 1,
    title: `Episode ${i + 1}`,
    duration: "24 min",
    thumb: raw.images?.jpg?.large_image_url || "",
    videoId: null,           // filled by loadEpisodeStream()
    gogoSlug,
  }));

  return {
    id:        malId,
    malId,
    title:     raw.title_english || raw.title,
    titleJP:   raw.title,
    studio:    raw.studios?.[0]?.name || "Unknown Studio",
    score:     raw.score || 0,
    status:    raw.status === "Currently Airing" ? "ongoing"
             : raw.status === "Finished Airing"  ? "completed" : "upcoming",
    year:      raw.year || raw.aired?.prop?.from?.year || 2024,
    genres:    raw.genres?.map(g => g.name) || [],
    synopsis:  raw.synopsis || "No synopsis available.",
    poster:    raw.images?.jpg?.large_image_url || raw.images?.jpg?.image_url || "",
    banner:    alData?.bannerImage || raw.images?.jpg?.large_image_url || "",
    totalEps:  totalEps,
    hasSub:    true,
    hasDub:    raw.title_english != null,
    newEp:     raw.status === "Currently Airing",
    gogoSlug,
    episodes,
    trailer:   raw.trailer?.embed_url || null,
    alId:      alData?.id || null,
  };
}

/* ── STREAMING RESOLVER ──────────────────────────────────────
   Returns the best embed URL for a given episode.
   Priority: gogoanime slug → AniList trailer → YouTube search  */
function getStreamUrl(anime, epNum) {
  if (anime.gogoSlug) {
    return `https://gogoanime3.co/embed/${anime.gogoSlug}-episode-${epNum}`;
  }
  // Fallback 1: anime's own trailer (ep 1 only)
  if (epNum === 1 && anime.trailer) return anime.trailer;
  // Fallback 2: YouTube search for the episode
  const q = encodeURIComponent(`${anime.title} episode ${epNum} english sub`);
  return `https://www.youtube.com/results?search_query=${q}`;
}

/* Extra per-anime episode data from Jikan (called lazily on detail open) */
async function fetchEpisodes(malId) {
  try {
    const data = await jikan(`/anime/${malId}/episodes`);
    return (data || []).map(ep => ({
      id:       ep.mal_id,
      title:    ep.title || ep.title_romanji || `Episode ${ep.mal_id}`,
      duration: ep.duration ? `${ep.duration} min` : "24 min",
      thumb:    ep.images?.jpg?.image_url || "",
      filler:   ep.filler,
      recap:    ep.recap,
    }));
  } catch { return []; }
}

/* ── MAIN DATA BOOTSTRAP ────────────────────────────────────  */
const NimbusData = (async function bootstrap() {
  /* AniList query — fetch top 30 trending + top-rated in one call */
  const AL_QUERY = `
    query {
      trending: Page(page:1, perPage:20) {
        media(type:ANIME, sort:TRENDING_DESC, isAdult:false) {
          id malId bannerImage title { romaji english }
        }
      }
      topRated: Page(page:1, perPage:20) {
        media(type:ANIME, sort:SCORE_DESC, isAdult:false) {
          id malId bannerImage title { romaji english }
        }
      }
    }`;

  /* Fetch in parallel — Jikan seasonal + popular, AniList enrichment */
  const [seasonal, popular, alRaw] = await Promise.allSettled([
    jikan("/seasons/now", { limit: 25 }),
    jikan("/top/anime",  { limit: 25, filter: "bypopularity" }),
    anilist(AL_QUERY),
  ]);

  /* Build banner lookup from AniList { malId → bannerImage } */
  const bannerMap = {};
  if (alRaw.status === "fulfilled") {
    const alData = alRaw.value;
    [...(alData.trending?.media || []), ...(alData.topRated?.media || [])]
      .forEach(m => { if (m.malId) bannerMap[m.malId] = m.bannerImage; });
  }

  /* Merge & deduplicate by MAL id */
  const seen = new Set();
  const rawList = [
    ...(seasonal.status === "fulfilled" ? seasonal.value : []),
    ...(popular.status  === "fulfilled" ? popular.value  : []),
  ];

  const ANIME_DB = rawList
    .filter(r => { if (seen.has(r.mal_id)) return false; seen.add(r.mal_id); return true; })
    .filter(r => r.score && r.score > 0)
    .map(r => normaliseAnime(r, bannerMap[r.mal_id] ? { bannerImage: bannerMap[r.mal_id] } : null));

  /* Upcoming — from Jikan /seasons/upcoming */
  let COMING_SOON = [];
  try {
    const upcoming = await jikan("/seasons/upcoming", { limit: 8 });
    COMING_SOON = upcoming.slice(0, 8).map(r => ({
      id:          r.mal_id,
      title:       r.title_english || r.title,
      releaseDate: r.aired?.string || "Coming Soon",
      genres:      r.genres?.map(g => g.name) || [],
      poster:      r.images?.jpg?.large_image_url || "",
      synopsis:    r.synopsis || "",
    }));
  } catch { /* leave empty */ }

  return { ANIME_DB, COMING_SOON, fetchEpisodes, getStreamUrl };
})();

/* Expose globally so components can await it */
window.__NimbusData = NimbusData;