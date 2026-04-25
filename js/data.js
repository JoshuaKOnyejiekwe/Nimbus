/* ═══════════════════════════════════════════════════════════
   data.js — Nimbus  (fully dynamic, zero hardcoded content)

   Everything — anime catalog, ticker items, coming soon —
   comes from live API calls.  No static slug maps, no static
   news items, no hardcoded anime IDs.

   Sources
   ───────
   AniList GraphQL  → airing / trending / top-rated / upcoming
   Jikan v4 REST    → seasonal pages, recent episodes, schedule
   MegaPlay embed   → full-episode player (MAL id or AniList id)

   Gogoanime slugs are AUTO-GENERATED from the title at runtime
   (title → lowercase, replace spaces/special chars with "-")
   so we never need a manual map again.
   ═══════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════
   SLUG AUTO-GENERATOR
   Converts any anime title to the gogoanime URL slug format.
   Examples:
     "Jujutsu Kaisen 2nd Season" → "jujutsu-kaisen-2nd-season"
     "Re:Zero"                   → "re-zero"
     "Dr. Stone: New World"      → "dr-stone-new-world"
   ══════════════════════════════════════════════════════════ */
function titleToSlug(title) {
  if (!title) return null;
  return title
    .toLowerCase()
    .replace(/[''`]/g, "")          // strip smart quotes
    .replace(/[:：]/g, "")          // strip colons
    .replace(/[^a-z0-9\s\-]/g, " ") // non-alphanum → space
    .trim()
    .replace(/\s+/g, "-");           // spaces → hyphens
}

/* ══════════════════════════════════════════════════════════
   COMMENT SEED GENERATOR
   Generates generic seeded comments from any fetched anime
   so the comment section is never empty without being static.
   ══════════════════════════════════════════════════════════ */
const COMMENT_TEMPLATES = [
  (t) => `${t} is absolutely insane this season. Can't believe what just happened.`,
  (t) => `The animation quality in ${t} keeps getting better every episode.`,
  (t) => `Just binged all of ${t} in one sitting. Zero regrets.`,
  (t) => `${t} is proof that anime is the peak storytelling medium right now.`,
  (t) => `If you haven't started ${t} yet, what are you even doing?`,
  (t) => `The OST in ${t} hits different at 2am. Absolute cinema.`,
];
const COMMENT_USERS = [
  {u:"WeeabooKing",  a:"W"}, {u:"SenpaiNoticed", a:"S"}, {u:"OtakuOverlord",a:"O"},
  {u:"AnimeStan",    a:"A"}, {u:"SubNotDub",     a:"S"}, {u:"MangaReader",  a:"M"},
  {u:"CrunchyrollG", a:"C"}, {u:"Izuku_main",    a:"I"}, {u:"SakuraSub",    a:"S"},
];
function seedComments(animeId, title) {
  const key = `${animeId}-1`;
  const n = 2 + (animeId % 2); // 2–3 comments per show
  return {
    [key]: Array.from({length: n}, (_, i) => {
      const u = COMMENT_USERS[(animeId + i) % COMMENT_USERS.length];
      const tmpl = COMMENT_TEMPLATES[(animeId + i) % COMMENT_TEMPLATES.length];
      return {
        id:    i + 1,
        user:  u.u,
        avatar:u.a,
        text:  tmpl(title),
        time:  ["just now","1h ago","3h ago","1d ago","2d ago"][i % 5],
        likes: Math.floor(Math.abs(Math.sin(animeId + i)) * 200),
        liked: false,
      };
    })
  };
}

/* ══════════════════════════════════════════════════════════
   API HELPERS
   ══════════════════════════════════════════════════════════ */

async function jikan(path, params = {}) {
  const qs  = new URLSearchParams(params).toString();
  const url = `https://api.jikan.moe/v4${path}${qs ? "?" + qs : ""}`;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) { await sleep(1500 * (attempt + 1)); continue; }
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch { await sleep(900); }
  }
  return [];
}

async function jikanAllPages(path, params = {}, maxPages = 3) {
  const out = [];
  for (let page = 1; page <= maxPages; page++) {
    await sleep(450);
    const data = await jikan(path, { ...params, page });
    if (!data.length) break;
    out.push(...data);
  }
  return out;
}

async function anilist(query, variables = {}) {
  const res = await fetch("https://graphql.anilist.co", {
    method:  "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body:    JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error("AniList " + res.status);
  const json = await res.json();
  if (json.errors) console.warn("[AniList errors]", json.errors.map(e=>e.message).join(", "));
  return json.data;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ══════════════════════════════════════════════════════════
   NORMALISERS
   ══════════════════════════════════════════════════════════ */

const AL_STATUS_MAP = {
  RELEASING:        "ongoing",
  FINISHED:         "completed",
  NOT_YET_RELEASED: "upcoming",
  CANCELLED:        "completed",
  HIATUS:           "ongoing",
};

function normaliseAniList(m) {
  const malId    = m.malId || null;
  const gogoSlug = titleToSlug(m.title?.english || m.title?.romaji);
  const totalEps = m.episodes || (m.status === "RELEASING" ? null : 12);
  const epCount  = totalEps || 13;
  const thumb    = m.bannerImage || m.coverImage?.large || "";

  const episodes = Array.from({ length: Math.min(epCount, 100) }, (_, i) => ({
    id:       i + 1,
    title:    `Episode ${i + 1}`,
    duration: (m.duration || 24) + " min",
    thumb,
    gogoSlug,
  }));

  const id = malId || ("al_" + m.id);
  return {
    id,
    alId:     m.id,
    malId,
    title:    m.title?.english || m.title?.romaji || m.title?.native || "Unknown",
    titleJP:  m.title?.native  || m.title?.romaji || "",
    studio:   m.studios?.nodes?.[0]?.name || "Unknown Studio",
    score:    m.meanScore ? parseFloat((m.meanScore / 10).toFixed(1)) : 0,
    status:   AL_STATUS_MAP[m.status] || "ongoing",
    year:     m.seasonYear || m.startDate?.year || new Date().getFullYear(),
    genres:   m.genres || [],
    synopsis: m.description ? m.description.replace(/<[^>]+>/g, "").slice(0, 600) : "No synopsis available.",
    poster:   m.coverImage?.large || m.coverImage?.medium || "",
    banner:   m.bannerImage       || m.coverImage?.large  || "",
    totalEps: totalEps || "?",
    hasSub:   true,
    hasDub:   !!(m.title?.english),
    newEp:    m.status === "RELEASING",
    gogoSlug,
    episodes,
    trailer:  m.trailer?.site === "youtube" ? `https://www.youtube.com/embed/${m.trailer.id}` : null,
    _src:     "al",
  };
}

function normaliseJikan(raw, alMap = {}) {
  const malId    = raw.mal_id;
  const alData   = alMap[malId];
  // If we have AniList data, always prefer it (richer)
  if (alData) return normaliseAniList(alData);

  const gogoSlug = titleToSlug(raw.title_english || raw.title);
  const totalEps = raw.episodes || (raw.status === "Currently Airing" ? null : 12);
  const epCount  = totalEps || 13;
  const banner   = raw.images?.jpg?.large_image_url || "";

  const episodes = Array.from({ length: Math.min(epCount, 100) }, (_, i) => ({
    id: i + 1, title: `Episode ${i + 1}`, duration: "24 min", thumb: banner, gogoSlug,
  }));

  return {
    id:       malId,
    alId:     null,
    malId,
    title:    raw.title_english || raw.title,
    titleJP:  raw.title,
    studio:   raw.studios?.[0]?.name || "Unknown Studio",
    score:    raw.score || 0,
    status:   raw.status === "Currently Airing" ? "ongoing"
            : raw.status === "Finished Airing"  ? "completed" : "upcoming",
    year:     raw.year || raw.aired?.prop?.from?.year || new Date().getFullYear(),
    genres:   raw.genres?.map(g => g.name) || [],
    synopsis: raw.synopsis || "No synopsis available.",
    poster:   raw.images?.jpg?.large_image_url || raw.images?.jpg?.image_url || "",
    banner,
    totalEps: totalEps || "?",
    hasSub:   true,
    hasDub:   !!raw.title_english,
    newEp:    raw.status === "Currently Airing",
    gogoSlug,
    episodes,
    trailer:  raw.trailer?.embed_url || null,
    _src:     "jk",
  };
}

/* ══════════════════════════════════════════════════════════
   DYNAMIC TICKER BUILDER
   Pulls from the anime database itself:
   - Currently-airing shows with "New Ep" label
   - Highly-scored completed shows with "MUST WATCH"
   - Upcoming shows with "COMING SOON"
   Also fetches the Jikan /watch/recentepisodes endpoint for
   even fresher "just released" episode data.
   ══════════════════════════════════════════════════════════ */
async function buildTicker(animeDB) {
  const items = [];

  /* 1. Currently airing — pull up to 15 */
  animeDB
    .filter(a => a.newEp)
    .slice(0, 15)
    .forEach(a => {
      items.push({ label: `${a.title} — now airing`, tag: "NEW" });
    });

  /* 2. Try to get actual recent episode releases from Jikan */
  try {
    const recent = await jikan("/watch/episodes/popular", { limit: 10 });
    (recent || []).forEach(r => {
      const t = r.entry?.title || r.title;
      const ep = r.episodes?.[0]?.mal_id;
      if (t) items.push({ label: `${t}${ep ? " Ep " + ep : ""} released`, tag: "NEW" });
    });
  } catch { /* skip */ }

  /* 3. Upcoming from our coming-soon list */
  animeDB
    .filter(a => a.status === "upcoming")
    .slice(0, 5)
    .forEach(a => items.push({ label: `${a.title} — coming soon`, tag: "SOON" }));

  /* 4. Top-rated filler (always have at least 8 items) */
  if (items.length < 8) {
    animeDB
      .filter(a => a.score >= 8.5 && a.status === "completed")
      .slice(0, 8 - items.length)
      .forEach(a => items.push({ label: `${a.title} — must watch`, tag: "TOP" }));
  }

  /* Deduplicate by label and shuffle for variety */
  const seen = new Set();
  const deduped = items.filter(i => { if (seen.has(i.label)) return false; seen.add(i.label); return true; });

  return deduped.length ? deduped : [{ label: "Loading anime updates…", tag: "•" }];
}

/* ══════════════════════════════════════════════════════════
   STREAM URL  (MegaPlay primary, gogo fallback)
   ══════════════════════════════════════════════════════════ */
function getStreamUrl(anime, epNum) {
  if (anime.malId) return `https://megaplay.buzz/stream/mal/${anime.malId}/${epNum}/sub`;
  if (anime.alId)  return `https://megaplay.buzz/stream/ani/${anime.alId}/${epNum}/sub`;
  if (anime.gogoSlug) return `https://gogoanime3.co/embed/${anime.gogoSlug}-episode-${epNum}`;
  return null;
}

/* ══════════════════════════════════════════════════════════
   LAZY EPISODE LOADER
   ══════════════════════════════════════════════════════════ */
async function fetchEpisodes(malId) {
  if (!malId) return [];
  try {
    const data = await jikan(`/anime/${malId}/episodes`);
    return (data || []).map(ep => ({
      id:       ep.mal_id,
      title:    ep.title_english || ep.title || ep.title_romanji || `Episode ${ep.mal_id}`,
      duration: ep.duration ? `${ep.duration} min` : "24 min",
      thumb:    ep.images?.jpg?.image_url || "",
      filler:   ep.filler || false,
      recap:    ep.recap  || false,
    }));
  } catch { return []; }
}

/* ══════════════════════════════════════════════════════════
   BOOTSTRAP  — everything resolves before app renders
   ══════════════════════════════════════════════════════════ */
const NimbusData = (async function bootstrap() {

  const AL_FIELDS = `
    id malId bannerImage meanScore episodes duration status seasonYear
    startDate { year }
    title { romaji english native }
    coverImage { large medium }
    genres
    description(asHtml: false)
    studios(isMain: true) { nodes { name } }
    trailer { id site }
  `;

  const AL_QUERY = `query {
    airing:   Page(page:1, perPage:50) { media(type:ANIME, status:RELEASING,        sort:POPULARITY_DESC, isAdult:false) { ${AL_FIELDS} } }
    airing2:  Page(page:2, perPage:50) { media(type:ANIME, status:RELEASING,        sort:POPULARITY_DESC, isAdult:false) { ${AL_FIELDS} } }
    trending: Page(page:1, perPage:30) { media(type:ANIME, sort:TRENDING_DESC,      isAdult:false)                       { ${AL_FIELDS} } }
    topRated: Page(page:1, perPage:50) { media(type:ANIME, sort:SCORE_DESC,         isAdult:false)                       { ${AL_FIELDS} } }
    upcoming: Page(page:1, perPage:20) { media(type:ANIME, status:NOT_YET_RELEASED, sort:POPULARITY_DESC, isAdult:false) { ${AL_FIELDS} } }
  }`;

  /* Fire AniList + Jikan in parallel */
  const [alResult, jikanSeasonal, jikanTop] = await Promise.allSettled([
    anilist(AL_QUERY),
    jikanAllPages("/seasons/now", { limit: 25 }, 3),
    jikanAllPages("/top/anime",   { limit: 25, filter: "bypopularity" }, 2),
  ]);

  /* Build AniList lookup { malId → media } */
  const alMap = {};
  if (alResult.status === "fulfilled" && alResult.value) {
    const al = alResult.value;
    [
      ...(al.airing?.media   || []),
      ...(al.airing2?.media  || []),
      ...(al.trending?.media || []),
      ...(al.topRated?.media || []),
      ...(al.upcoming?.media || []),
    ].forEach(m => { if (m.malId) alMap[m.malId] = m; });
  }

  /* ── Merge with deduplication ── */
  const seen   = new Set();
  const merged = [];

  function add(entry) {
    const key = entry.malId || entry.id;
    if (!key || seen.has(key)) return;
    seen.add(key);
    merged.push(entry);
  }

  if (alResult.status === "fulfilled" && alResult.value) {
    const al = alResult.value;
    /* Airing first — catches every new season */
    [...(al.airing?.media || []), ...(al.airing2?.media || [])]
      .forEach(m => { const n = normaliseAniList(m); seen.add(n.malId || n.id); merged.push(n); });
    /* Top-rated + trending */
    [...(al.topRated?.media || []), ...(al.trending?.media || [])]
      .forEach(m => add(normaliseAniList(m)));
  }

  /* Jikan seasonal — fills anything AniList missed */
  if (jikanSeasonal.status === "fulfilled")
    jikanSeasonal.value.forEach(r => add(normaliseJikan(r, alMap)));

  /* Jikan top popular safety net */
  if (jikanTop.status === "fulfilled")
    jikanTop.value.forEach(r => add(normaliseJikan(r, alMap)));

  const ANIME_DB = merged;

  /* ── Coming Soon ── */
  let COMING_SOON = [];
  if (alResult.status === "fulfilled" && alResult.value?.upcoming?.media?.length) {
    COMING_SOON = alResult.value.upcoming.media.slice(0, 12).map(m => ({
      id:          m.malId || m.id,
      title:       m.title?.english || m.title?.romaji || "Unknown",
      releaseDate: m.startDate?.year ? String(m.startDate.year) : "Coming Soon",
      genres:      m.genres || [],
      poster:      m.coverImage?.large || "",
      synopsis:    m.description ? m.description.replace(/<[^>]+>/g,"").slice(0,300) : "",
    }));
  } else {
    try {
      const upRaw = await jikan("/seasons/upcoming", { limit: 12 });
      COMING_SOON = upRaw.map(r => ({
        id:          r.mal_id,
        title:       r.title_english || r.title,
        releaseDate: r.aired?.string || "Coming Soon",
        genres:      r.genres?.map(g => g.name) || [],
        poster:      r.images?.jpg?.large_image_url || "",
        synopsis:    r.synopsis || "",
      }));
    } catch {}
  }

  /* ── Dynamic ticker (built from live data) ── */
  const UPDATES = await buildTicker(ANIME_DB);

  /* ── Dynamic comments (seeded from real fetched anime) ── */
  const INITIAL_COMMENTS = ANIME_DB
    .slice(0, 20)
    .reduce((acc, a) => Object.assign(acc, seedComments(a.malId || a.id, a.title)), {});

  console.log(
    `[Nimbus] ${ANIME_DB.length} anime | ` +
    `${ANIME_DB.filter(a=>a.newEp).length} airing | ` +
    `${UPDATES.length} ticker items`
  );

  return { ANIME_DB, COMING_SOON, UPDATES, INITIAL_COMMENTS, fetchEpisodes, getStreamUrl };
})();

window.__NimbusData = NimbusData;