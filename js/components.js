/* ═══════════════════════════════════════════════════════════
   components.js — Nimbus (DYNAMIC)
   Shared React components. HeroBanner now receives db prop.
   ═══════════════════════════════════════════════════════════ */

/* ── NAVBAR ─────────────────────────────────────────────────── */
function Navbar({ page, setPage, searchQuery, setSearchQuery }) {
  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => setPage("home")}>
        Nim<span>bus</span>
      </div>
      <div className="nav-links">
        <button className={`nav-link${page==="home"    ?" active":""}`} onClick={() => setPage("home")}>    <IconHome/>     Home     </button>
        <button className={`nav-link${page==="browse"  ?" active":""}`} onClick={() => setPage("browse")}>  <IconCompass/>  Browse   </button>
        <button className={`nav-link${page==="schedule"?" active":""}`} onClick={() => setPage("schedule")}><IconCalendar/> Schedule </button>
        <button className={`nav-link${page==="mylist"  ?" active":""}`} onClick={() => setPage("mylist")}>  <IconList/>     My List  </button>
      </div>
      <div className="search-bar">
        <IconSearch/>
        <input
          placeholder="Search anime…"
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); setPage("browse"); }}
        />
      </div>
      <div className="avatar-btn" onClick={() => setPage("mylist")}>U</div>
    </nav>
  );
}

/* ── UPDATES TICKER ──────────────────────────────────────────── */
/* updates prop = array of {label, tag} from the live API.
   Falls back to a loading placeholder while data loads.       */
function UpdatesTicker({ updates }) {
  const items = (updates && updates.length) ? updates : [{ label: "Fetching latest anime news…", tag: "•" }];
  const doubled = [...items, ...items]; // duplicate for seamless CSS loop
  return (
    <div className="updates-strip">
      <div className="updates-inner">
        {doubled.map((u,i) => (
          <div key={i} className="update-item">
            <div className="update-dot pulse"/>
            <span className="update-new">{u.tag}</span>
            <span className="update-label">{u.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── HERO BANNER ─────────────────────────────────────────────── */
function HeroBanner({ db, onWatch, onDetail }) {
  // Pick 4-5 highly-scored anime for the hero rotation
  var featured = db ? [...db].sort((a,b) => b.score-a.score).slice(0,5) : [];
  var [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    if (!featured.length) return;
    var t = setInterval(() => setIdx(i => (i+1) % featured.length), 5000);
    return () => clearInterval(t);
  }, [featured.length]);

  if (!featured.length) return (
    <div className="hero" style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{color:"var(--text-muted)"}}>Loading featured anime…</div>
    </div>
  );

  var anime = featured[idx];

  return (
    <div className="hero">
      <div className="hero-bg" style={{backgroundImage:`url(${anime.banner||anime.poster})`}}/>
      <div className="hero-gradient"/>
      <div className="hero-content">
        <div className="hero-badge">⚡ {anime.newEp ? "New Episode" : "Featured"}</div>
        <h1 className="hero-title">{anime.title}</h1>
        <div className="hero-meta">
          <span className="star-rating"><IconStar/> {anime.score}</span>
          <div className="dot"/>
          <span>{anime.year}</span>
          <div className="dot"/>
          <span>{anime.genres[0]}</span>
          <div className="dot"/>
          <span style={{color: anime.status==="ongoing"?"#10b981":"#60a5fa"}}>
            {anime.status.charAt(0).toUpperCase()+anime.status.slice(1)}
          </span>
        </div>
        <p className="hero-synopsis">{anime.synopsis}</p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => onWatch(anime, anime.episodes[0])}>
            <IconPlay/> Watch Now
          </button>
          <button className="btn btn-secondary" onClick={() => onDetail(anime)}>
            More Info
          </button>
        </div>
      </div>
      <div className="hero-dots">
        {featured.map((_,i) => (
          <div key={i} className={"hero-dot"+(i===idx?" active":"")} onClick={() => setIdx(i)}/>
        ))}
      </div>
    </div>
  );
}

/* ── ANIME CARD ──────────────────────────────────────────────── */
function AnimeCard({ anime, onDetail, onWatch, favorites, bookmarks, onFavorite, onBookmark }) {
  var isFav  = favorites.includes(anime.id);
  var isBook = bookmarks.includes(anime.id);

  return (
    <div className="anime-card fade-in" onClick={() => onDetail(anime)}>
      <div className="card-poster">
        <img src={anime.poster} alt={anime.title} loading="lazy"
          onError={e => { e.target.src="https://via.placeholder.com/200x300/0a0a0a/D4AF37?text=Anime"; }}
        />
        <div className="card-overlay" onClick={e => e.stopPropagation()}>
          <button className="play-circle" onClick={() => onWatch(anime, anime.episodes[0])}>
            <IconPlay/>
          </button>
        </div>
        <div className="card-score"><IconStar/>{anime.score}</div>
        <div className={"card-status-badge badge-"+anime.status}>{anime.status}</div>
        {anime.newEp && <div className="new-ep-badge">New Ep</div>}
      </div>
      <div className="card-info">
        <div className="card-title truncate">{anime.title}</div>
        <div className="card-meta">
          <span>{anime.year}</span><span>·</span><span>{anime.genres[0]}</span>
        </div>
        <div className="flex gap-1" style={{marginTop:8}} onClick={e => e.stopPropagation()}>
          <button className={"btn-icon"+(isFav?" active":"")} title="Favorite"
            onClick={() => onFavorite(anime.id)}>
            <IconHeart filled={isFav}/>
          </button>
          <button className={"btn-icon"+(isBook?" active":"")} title="Bookmark"
            onClick={() => onBookmark(anime.id)}>
            <IconBookmark filled={isBook}/>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── FOOTER ──────────────────────────────────────────────────── */
function Footer({ setPage }) {
  return (
    <footer>
      <div className="footer">
        <div className="footer-brand">
          <div className="footer-logo">Nimbus</div>
          <p className="footer-tagline">Your home for anime streaming. Watch the latest episodes in sub or dub, track your progress, and connect with the community.</p>
        </div>
        <div>
          <div className="footer-col-title">Navigate</div>
          {["home","browse","schedule","mylist"].map(p => (
            <button key={p} className="footer-link" onClick={() => setPage(p)}>
              {p.charAt(0).toUpperCase()+p.slice(1)}
            </button>
          ))}
        </div>
        <div>
          <div className="footer-col-title">Genres</div>
          {["Action","Fantasy","Romance","Horror","Comedy"].map(g => (
            <span key={g} className="footer-link">{g}</span>
          ))}
        </div>
        <div>
          <div className="footer-col-title">Community</div>
          <a className="footer-link" href="https://myanimelist.net" target="_blank" rel="noopener noreferrer">MyAnimeList</a>
          <span className="footer-link">Discord</span>
          <span className="footer-link">Reddit</span>
          <span className="footer-link">Twitter / X</span>
        </div>
      </div>
      <div className="footer-bottom">
        <span className="footer-copy">© 2026 Nimbus. For demonstration purposes only.</span>
        <span className="footer-copy" style={{color:"var(--accent)"}}>Made with ❤ for anime fans</span>
      </div>
    </footer>
  );
}

/* ── TOAST CONTAINER ─────────────────────────────────────────── */
function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={"toast toast-"+t.type}>
          <span className="toast-icon">{t.type==="success"?"✓":"ℹ"}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}