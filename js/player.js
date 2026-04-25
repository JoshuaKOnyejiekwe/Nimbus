/* ═══════════════════════════════════════════════════════════
   player.js — Nimbus
   Real HLS streaming player.

   Flow per episode click:
     1. Search aniwatch-api for the anime by title → get hianime id
     2. Fetch episode list → get hianime episode id
     3. Fetch stream sources → get real .m3u8 URL + subtitles
     4. Play with HLS.js in a native <video> tag

   Falls back gracefully if the backend isn't configured yet.
   ═══════════════════════════════════════════════════════════ */

/* ── API base from config.js ────────────────────────────────── */
function getApiBase() {
  return (window.NIMBUS_CONFIG && window.NIMBUS_CONFIG.ANIWATCH_API) || "";
}

/* ── Fetch wrapper with timeout ─────────────────────────────── */
async function apiFetch(url, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

/* ── Step 1: Search for anime on HiAnime, return its hianime id ─ */
async function searchHiAnime(title) {
  const base = getApiBase();
  if (!base) throw new Error("NO_API");
  const q   = encodeURIComponent(title);
  const data = await apiFetch(`${base}/api/v2/hianime/search?q=${q}&page=1`);
  const animes = data?.data?.animes;
  if (!animes?.length) throw new Error("NOT_FOUND");
  // Return best match (first result)
  return animes[0].id; // e.g. "demon-slayer-kimetsu-no-yaiba-47"
}

/* ── Step 2: Get episode list for a hianime anime id ──────────── */
async function getHiAnimeEpisodes(hiAnimeId) {
  const base = getApiBase();
  const data = await apiFetch(`${base}/api/v2/hianime/anime/${hiAnimeId}/episodes`);
  return data?.data?.episodes || [];
}

/* ── Step 3: Get stream sources for a hianime episode id ─────── */
async function getStreamSources(hiAnimeEpId, category = "sub") {
  const base = getApiBase();
  const epEnc = encodeURIComponent(hiAnimeEpId);
  // Try hd-1 server first, then hd-2 as backup
  for (const server of ["hd-1", "hd-2", "megacloud"]) {
    try {
      const data = await apiFetch(
        `${base}/api/v2/hianime/episode/sources?animeEpisodeId=${epEnc}&server=${server}&category=${category}`
      );
      const sources = data?.data?.sources;
      if (sources?.length) {
        return {
          m3u8: sources[0].url,
          subtitles: data?.data?.tracks?.filter(t => t.kind === "captions") || [],
          intro:     data?.data?.intro  || null,
          outro:     data?.data?.outro  || null,
        };
      }
    } catch { /* try next server */ }
  }
  throw new Error("NO_SOURCES");
}

/* ══════════════════════════════════════════════════════════════
   StreamingPlayer React component
   ══════════════════════════════════════════════════════════════ */
function StreamingPlayer({ anime, episode, dubSub }) {
  const lang = dubSub || "sub";

  /* State */
  const [phase,    setPhase   ] = React.useState("idle"); // idle | loading | playing | error
  const [errorMsg, setErrorMsg] = React.useState("");
  const [streamInfo, setStreamInfo] = React.useState(null); // { m3u8, subtitles }
  const [hlsLoaded, setHlsLoaded] = React.useState(typeof Hls !== "undefined");

  const videoRef  = React.useRef(null);
  const hlsRef    = React.useRef(null);

  /* Load HLS.js dynamically if not already on page */
  React.useEffect(() => {
    if (typeof Hls !== "undefined") { setHlsLoaded(true); return; }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.5.7/hls.min.js";
    script.onload = () => setHlsLoaded(true);
    document.head.appendChild(script);
  }, []);

  /* Main fetch: search → episodes → stream, runs when episode/lang changes */
  React.useEffect(() => {
    if (!anime || !episode || !hlsLoaded) return;

    let cancelled = false;
    setPhase("loading");
    setStreamInfo(null);
    setErrorMsg("");

    async function load() {
      const apiBase = getApiBase();

      if (!apiBase) {
        if (!cancelled) {
          setPhase("no_api");
        }
        return;
      }

      try {
        /* 1. Find this anime on HiAnime */
        const hiAnimeId = await searchHiAnime(anime.title);
        if (cancelled) return;

        /* 2. Get episode list and find matching episode number */
        const episodes = await getHiAnimeEpisodes(hiAnimeId);
        if (cancelled) return;

        const targetEp = episodes.find(e => e.number === episode.id) || episodes[episode.id - 1];
        if (!targetEp) throw new Error("EP_NOT_FOUND");

        /* 3. Get actual stream URL */
        const info = await getStreamSources(targetEp.episodeId, lang);
        if (cancelled) return;

        setStreamInfo(info);
        setPhase("playing");
      } catch (e) {
        if (!cancelled) {
          setPhase("error");
          setErrorMsg(
            e.message === "NO_API"       ? "Backend not configured. See SETUP.md." :
            e.message === "NOT_FOUND"    ? `"${anime.title}" not found on HiAnime.` :
            e.message === "EP_NOT_FOUND" ? `Episode ${episode.id} not available.` :
            e.message === "NO_SOURCES"   ? "No stream sources returned for this episode." :
            `Stream error: ${e.message}`
          );
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [anime?.malId, anime?.title, episode?.id, lang, hlsLoaded]);

  /* Attach HLS.js to video element when streamInfo arrives */
  React.useEffect(() => {
    if (phase !== "playing" || !streamInfo?.m3u8 || !videoRef.current) return;

    const video = videoRef.current;

    /* Destroy previous HLS instance */
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }

    if (Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength:        60,
        maxMaxBufferLength:     120,
        startLevel:             -1, // auto quality
        capLevelToPlayerSize:   true,
        xhrSetup: (xhr, url) => {
          /* Some HiAnime CDN segments require the Referer header.
             This only works when your page is served from a real domain
             (not file://). Set to your site's actual URL in production. */
          xhr.setRequestHeader("Referer", "https://hianime.to");
        },
      });
      hlsRef.current = hls;
      hls.loadSource(streamInfo.m3u8);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setPhase("error");
          setErrorMsg("HLS playback error — stream may have expired. Try reloading.");
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS (Safari / iOS)
      video.src = streamInfo.m3u8;
      video.play().catch(() => {});
    } else {
      setPhase("error");
      setErrorMsg("Your browser doesn't support HLS streaming.");
    }

    /* Attach subtitle tracks */
    (streamInfo.subtitles || []).forEach(track => {
      const el = document.createElement("track");
      el.kind    = "subtitles";
      el.label   = track.label || "English";
      el.srclang = track.default ? "en" : (track.label || "en").slice(0,2).toLowerCase();
      el.src     = track.file;
      if (track.default) el.default = true;
      video.appendChild(el);
    });

    return () => {
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    };
  }, [phase, streamInfo]);

  /* ── Renders ── */

  if (phase === "loading") {
    return (
      <div style={playerBox}>
        <div style={{textAlign:"center"}}>
          <div style={spinner}/>
          <p style={{color:"var(--text-muted)",fontSize:13,marginTop:16}}>
            Fetching stream for <strong style={{color:"var(--text-primary)"}}>{anime?.title}</strong> EP {episode?.id}…
          </p>
          <p style={{color:"var(--text-muted)",fontSize:11,marginTop:6}}>Searching HiAnime → getting episode ID → resolving stream</p>
        </div>
      </div>
    );
  }

  if (phase === "no_api") {
    return (
      <div style={playerBox}>
        <div style={{textAlign:"center",maxWidth:480}}>
          <div style={{fontSize:48,marginBottom:12}}>⚙️</div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:"var(--accent)",marginBottom:12}}>
            Backend Not Configured
          </div>
          <p style={{fontSize:13,color:"var(--text-muted)",lineHeight:1.7,marginBottom:20}}>
            To stream full episodes you need to deploy the free aniwatch-api backend
            and set your URL in <code style={{color:"var(--accent)"}}>js/config.js</code>.
            It takes about 5 minutes and is completely free.
          </p>
          <div style={{background:"var(--bg-elevated)",border:"1px solid var(--border)",borderRadius:8,padding:16,textAlign:"left",fontSize:12,fontFamily:"monospace",color:"#a8ff78",marginBottom:20}}>
            <div style={{color:"var(--text-muted)",marginBottom:8}}># 1. Deploy this repo free on render.com:</div>
            <div>github.com/ghoshRitesh12/aniwatch-api</div>
            <div style={{color:"var(--text-muted)",marginTop:12,marginBottom:8}}># 2. Set your URL in js/config.js:</div>
            <div>ANIWATCH_API: "https://your-app.onrender.com"</div>
          </div>
          <p style={{fontSize:11,color:"var(--text-muted)"}}>Full instructions in <strong>SETUP.md</strong> included with the project files.</p>
          <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:16,flexWrap:"wrap"}}>
            <a href="https://render.com" target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">Deploy on Render (free)</a>
            <a href="https://railway.app" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">Deploy on Railway</a>
            {watchLinks(anime, episode)}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div style={playerBox}>
        <div style={{textAlign:"center",maxWidth:460}}>
          <div style={{fontSize:44,marginBottom:12}}>⚠️</div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:"var(--accent)",marginBottom:10}}>
            Stream Unavailable
          </div>
          <p style={{fontSize:13,color:"var(--text-muted)",lineHeight:1.7,marginBottom:20}}>{errorMsg}</p>
          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
            <button className="btn btn-primary btn-sm"
              onClick={() => { setPhase("idle"); setTimeout(() => setPhase("loading"), 50); }}>
              ↻ Retry
            </button>
            {watchLinks(anime, episode)}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "playing") {
    return (
      <div style={{position:"relative",width:"100%",aspectRatio:"16/9",background:"#000"}}>
        <video
          ref={videoRef}
          style={{width:"100%",height:"100%",display:"block",background:"#000"}}
          controls
          playsInline
          crossOrigin="anonymous"
        />
        {/* Skip intro button — shown when HLS.js gives us intro timestamps */}
        {streamInfo?.intro && <SkipButton label="Skip Intro" region={streamInfo.intro} videoRef={videoRef}/>}
        {streamInfo?.outro && <SkipButton label="Skip Outro" region={streamInfo.outro} videoRef={videoRef}/>}
      </div>
    );
  }

  /* phase === "idle" — shouldn't linger here, shown briefly on mount */
  return <div style={{...playerBox,background:"#000"}}/>;
}

/* ── Skip button (intro / outro) ────────────────────────────── */
function SkipButton({ label, region, videoRef }) {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    function onTime() {
      const t = video.currentTime;
      setVisible(t >= region.start && t < region.end);
    }
    video.addEventListener("timeupdate", onTime);
    return () => video.removeEventListener("timeupdate", onTime);
  }, [region]);

  if (!visible) return null;
  return (
    <button
      style={{
        position:"absolute",bottom:60,right:16,
        background:"rgba(0,0,0,0.75)",border:"1px solid rgba(255,255,255,0.3)",
        color:"#fff",padding:"8px 18px",borderRadius:6,fontSize:13,fontWeight:600,
        cursor:"pointer",fontFamily:"inherit",backdropFilter:"blur(4px)",zIndex:20,
      }}
      onClick={() => { if (videoRef.current) videoRef.current.currentTime = region.end; }}>
      {label} ›
    </button>
  );
}

/* ── Shared styles ────────────────────────────────────────────── */
const playerBox = {
  width:"100%", aspectRatio:"16/9", background:"#080808",
  display:"flex", alignItems:"center", justifyContent:"center",
  padding:28,
};
const spinner = {
  width:40, height:40, margin:"0 auto",
  border:"3px solid var(--bg-elevated)",
  borderTopColor:"var(--accent)",
  borderRadius:"50%", animation:"spin 0.85s linear infinite",
};

/* ── Watch-elsewhere links (shown in error/no-api states) ─────── */
function watchLinks(anime, episode) {
  if (!anime) return null;
  const slug = (anime.title||"").toLowerCase().replace(/[^a-z0-9]+/g,"-");
  return (
    <>
      <a href={`https://hianime.to/search?keyword=${encodeURIComponent(anime.title)}`}
        target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
        ↗ HiAnime
      </a>
      <a href={`https://www.crunchyroll.com/search?q=${encodeURIComponent(anime.title)}`}
        target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
        ↗ Crunchyroll
      </a>
    </>
  );
}