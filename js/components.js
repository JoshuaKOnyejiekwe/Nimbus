/* ═══════════════════════════════════════════════════════════
   components.js — Nimbus
   Shared React components used across multiple pages.
   Depends on: icons.js, helpers.js, data.js (UPDATES, COMING_SOON)
   ═══════════════════════════════════════════════════════════ */

/* ── NAVBAR ─────────────────────────────────────────────────
   Fixed top bar. Highlights the active page tab.
   Typing in search auto-navigates to Browse.               */
function Navbar({ page, setPage, searchQuery, setSearchQuery }) {
  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => setPage("home")}>
        ANI<span>VERSE</span>
      </div>
      <div className="nav-links">
        <button className={`nav-link${page==="home"   ?" active":""}`} onClick={() => setPage("home")}>    <IconHome />    Home     </button>
        <button className={`nav-link${page==="browse" ?" active":""}`} onClick={() => setPage("browse")}>  <IconCompass /> Browse   </button>
        <button className={`nav-link${page==="schedule"?" active":""}`}onClick={() => setPage("schedule")}><IconCalendar />Schedule </button>
        <button className={`nav-link${page==="mylist" ?" active":""}`} onClick={() => setPage("mylist")}>  <IconList />    My List  </button>
      </div>
      {/* Value propagates up; parent routes to Browse on change */}
      <div className="search-bar">
        <IconSearch />
        <input
          placeholder="Search anime..."
          value={searchQuery}
          onChange={function(e) { setSearchQuery(e.target.value); setPage("browse"); }}
        />
      </div>
      {/* Avatar shortcut to My List */}
      <div className="avatar-btn" onClick={() => setPage("mylist")}>U</div>
    </nav>
  );
}

/* ── UPDATES TICKER ─────────────────────────────────────────
   Infinite-scroll news strip. Array is doubled so the CSS
   marquee animation loops without a visible jump.           */
function UpdatesTicker() {
  var doubled = [...UPDATES, ...UPDATES]; // duplicate for seamless loop
  return (
    <div className="updates-strip">
      <div className="updates-inner">
        {doubled.map(function(u, i) {
          return (
            <div key={i} className="update-item">
              <div className="update-dot pulse" />
              <span className="update-new">{u.tag}</span>
              <span className="update-label">{u.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── HERO BANNER ────────────────────────────────────────────
   Rotates through top-scored anime every 5 seconds.
   Dot indicators allow manual switching.                    */
function HeroBanner({ onWatch, onDetail }) {
  var featured = ANIME_DB.filter(function(a) { return a.score >= 8.5; }).slice(0, 4);
  var [idx, setIdx] = React.useState(0);
  var anime = featured[idx];

  // Auto-advance every 5 s; clear on unmount to prevent leaks
  React.useEffect(function() {
    var t = setInterval(function() {
      setIdx(function(i) { return (i + 1) % featured.length; });
    }, 5000);
    return function() { clearInterval(t); };
  }, []);

  return (
    <div className="hero">
      {/* Background image + gradient overlay */}
      <div className="hero-bg" style={{ backgroundImage: "url(" + (anime.banner || anime.poster) + ")" }} />
      <div className="hero-gradient" />
      <div className="hero-content">
        <div className="hero-badge">⚡ {anime.newEp ? "New Episode" : "Featured"}</div>
        <h1 className="hero-title">{anime.title}</h1>
        <div className="hero-meta">
          <span className="star-rating"><IconStar /> {anime.score}</span>
          <div className="dot" />
          <span>{anime.year}</span>
          <div className="dot" />
          <span>{anime.genres[0]}</span>
          <div className="dot" />
          <span style={{color: anime.status==="ongoing" ? "#10b981" : "#60a5fa"}}>
            {anime.status.charAt(0).toUpperCase() + anime.status.slice(1)}
          </span>
        </div>
        <p className="hero-synopsis">{anime.synopsis}</p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={function() { onWatch(anime, anime.episodes[0]); }}>
            <IconPlay /> Watch Now
          </button>
          <button className="btn btn-secondary" onClick={function() { onDetail(anime); }}>
            More Info
          </button>
        </div>
      </div>
      {/* Manual dot navigation */}
      <div className="hero-dots">
        {featured.map(function(_, i) {
          return (
            <div key={i} className={"hero-dot" + (i===idx?" active":"")}
              onClick={function() { setIdx(i); }} />
          );
        })}
      </div>
    </div>
  );
}

/* ── ANIME CARD ─────────────────────────────────────────────
   Poster card used in grids and horizontal scroll rows.
   Hover overlay reveals quick-play button and action icons.  */
function AnimeCard({ anime, onDetail, onWatch, favorites, bookmarks, onFavorite, onBookmark }) {
  var isFav  = favorites.includes(anime.id);
  var isBook = bookmarks.includes(anime.id);

  return (
    <div className="anime-card fade-in" onClick={function() { onDetail(anime); }}>
      <div className="card-poster">
        <img src={anime.poster} alt={anime.title} loading="lazy"
          onError={function(e) { e.target.src = "https://via.placeholder.com/200x300/0d0d26/7c3aed?text=Anime"; }}
        />
        {/* Overlay — stopPropagation prevents card click from firing */}
        <div className="card-overlay" onClick={function(e) { e.stopPropagation(); }}>
          <button className="play-circle" onClick={function() { onWatch(anime, anime.episodes[0]); }}>
            <IconPlay />
          </button>
        </div>
        <div className="card-score"><IconStar />{anime.score}</div>
        <div className={"card-status-badge badge-" + anime.status}>{anime.status}</div>
        {anime.newEp && <div className="new-ep-badge">New Ep</div>}
      </div>
      <div className="card-info">
        <div className="card-title truncate">{anime.title}</div>
        <div className="card-meta">
          <span>{anime.year}</span><span>·</span><span>{anime.genres[0]}</span>
        </div>
        {/* Action buttons — stopPropagation prevents navigating to detail */}
        <div className="flex gap-1" style={{marginTop:8}} onClick={function(e) { e.stopPropagation(); }}>
          <button className={"btn-icon" + (isFav?" active":"")} title="Favorite"
            onClick={function() { onFavorite(anime.id); }}>
            <IconHeart filled={isFav} />
          </button>
          <button className={"btn-icon" + (isBook?" active":"")} title="Bookmark"
            onClick={function() { onBookmark(anime.id); }}>
            <IconBookmark filled={isBook} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── FOOTER ─────────────────────────────────────────────────
   Site-wide footer with brand, navigation, genres, community. */
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
          {["home","browse","schedule","mylist"].map(function(p) {
            return (
              <button key={p} className="footer-link" onClick={function() { setPage(p); }}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            );
          })}
        </div>
        <div>
          <div className="footer-col-title">Genres</div>
          {["Action","Fantasy","Romance","Horror","Comedy"].map(function(g) {
            return <span key={g} className="footer-link">{g}</span>;
          })}
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

/* ── TOAST CONTAINER ────────────────────────────────────────
   Renders the floating stack of toast messages bottom-right.  */
function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(function(t) {
        return (
          <div key={t.id} className={"toast toast-" + t.type}>
            <span className="toast-icon">{t.type==="success" ? "✓" : "ℹ"}</span>
            {t.msg}
          </div>
        );
      })}
    </div>
  );
}
