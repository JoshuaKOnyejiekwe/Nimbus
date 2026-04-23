/* ═══════════════════════════════════════════════════════════
   pages.js — Nimbus
   One function per page/route:
     HomePage · BrowsePage · SchedulePage
     DetailPage · WatchPage · MyListPage · CommentSection
   Depends on: components.js, icons.js, helpers.js, data.js
   ═══════════════════════════════════════════════════════════ */

/* ── HOME PAGE ──────────────────────────────────────────────
   Landing page. Sections: ticker → hero → trending →
   new episodes → coming soon → highest rated → footer.      */
function HomePage({ setPage, setCurrentAnime, setCurrentEp, favorites, bookmarks, onFavorite, onBookmark }) {
  function handleDetail(anime) { setCurrentAnime(anime); setPage("detail"); }
  function handleWatch(anime, ep) { setCurrentAnime(anime); setCurrentEp(ep); setPage("watch"); }

  var trending  = [...ANIME_DB].sort(function(a,b) { return b.score - a.score; });
  var newEps    = ANIME_DB.filter(function(a) { return a.newEp; });
  var cardProps = { onDetail: handleDetail, onWatch: handleWatch, favorites, bookmarks, onFavorite, onBookmark };

  return (
    <div className="page">
      <UpdatesTicker />
      <HeroBanner onWatch={handleWatch} onDetail={handleDetail} />

      <div className="container">
        {/* Trending */}
        <div className="section">
          <div className="section-header">
            <div className="section-title">Trending This Season</div>
            <button className="view-all" onClick={function() { setPage("browse"); }}>View All →</button>
          </div>
          <div className="anime-grid">
            {trending.slice(0,6).map(function(a) { return <AnimeCard key={a.id} anime={a} {...cardProps}/>; })}
          </div>
        </div>

        {/* New Episodes */}
        <div className="section">
          <div className="section-header">
            <div className="section-title">New Episodes</div>
          </div>
          <div className="h-scroll">
            {newEps.map(function(a) { return <AnimeCard key={a.id} anime={a} {...cardProps}/>; })}
          </div>
        </div>

        {/* Coming Soon */}
        <div className="section">
          <div className="section-header">
            <div className="section-title">Coming Soon</div>
            <button className="view-all" onClick={function() { setPage("schedule"); }}>Full Schedule →</button>
          </div>
          <div className="h-scroll">
            {COMING_SOON.map(function(anime) {
              return (
                <div key={anime.id} className="soon-card">
                  <div className="soon-poster">
                    <img src={anime.poster} alt={anime.title}
                      onError={function(e) { e.target.src="https://via.placeholder.com/240x140/0d0d26/7c3aed?text=Soon"; }}
                    />
                    <div className="soon-poster-overlay"/>
                  </div>
                  <div className="soon-info">
                    <div className="soon-title">{anime.title}</div>
                    <div className="soon-date"><IconCalendar/>{anime.releaseDate}</div>
                    <div className="soon-genres">
                      {anime.genres.map(function(g) { return <span key={g} className="genre-pill">{g}</span>; })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Highest Rated */}
        <div className="section">
          <div className="section-header">
            <div className="section-title">Highest Rated</div>
          </div>
          <div className="anime-grid">
            {[...ANIME_DB].sort(function(a,b) { return b.score-a.score; }).slice(0,4).map(function(a) {
              return <AnimeCard key={a.id} anime={a} {...cardProps}/>;
            })}
          </div>
        </div>
      </div>

      <Footer setPage={setPage}/>
    </div>
  );
}

/* ── BROWSE PAGE ────────────────────────────────────────────
   Full catalog: search input + genre pills + sort select.
   All filtering is done client-side against ANIME_DB.       */
function BrowsePage({ searchQuery, setPage, setCurrentAnime, setCurrentEp, favorites, bookmarks, onFavorite, onBookmark }) {
  var [filter, setFilter] = React.useState("All");
  var [sort,   setSort  ] = React.useState("score");
  var [local,  setLocal ] = React.useState(searchQuery);

  // Sync the local input when the navbar search changes
  React.useEffect(function() { setLocal(searchQuery); }, [searchQuery]);

  var genres = ["All", ...new Set(ANIME_DB.flatMap(function(a) { return a.genres; }))];

  // Filter → search → sort pipeline
  var results = ANIME_DB
    .filter(function(a) { return filter === "All" || a.genres.includes(filter); })
    .filter(function(a) { return !local || a.title.toLowerCase().includes(local.toLowerCase()); })
    .sort(function(a, b) {
      return sort==="score" ? b.score-a.score
           : sort==="year"  ? b.year-a.year
           : a.title.localeCompare(b.title);
    });

  var cardProps = {
    onDetail: function(a) { setCurrentAnime(a); setPage("detail"); },
    onWatch:  function(a, ep) { setCurrentAnime(a); setCurrentEp(ep); setPage("watch"); },
    favorites, bookmarks, onFavorite, onBookmark
  };

  return (
    <div className="page">
      <div className="container" style={{paddingTop:32}}>
        <div className="section-title" style={{marginBottom:24}}>Browse Anime</div>

        {/* Search + sort row */}
        <div className="browse-search-bar">
          <input className="browse-search-input" placeholder="Search by title..."
            value={local} onChange={function(e) { setLocal(e.target.value); }}
          />
          <select className="sort-select" value={sort} onChange={function(e) { setSort(e.target.value); }}>
            <option value="score">Top Rated</option>
            <option value="year">Newest</option>
            <option value="title">A–Z</option>
          </select>
        </div>

        {/* Genre filter pills */}
        <div className="browse-filters">
          {genres.map(function(g) {
            return (
              <button key={g} className={"filter-pill" + (filter===g?" active":"")}
                onClick={function() { setFilter(g); }}>
                {g}
              </button>
            );
          })}
        </div>

        <p style={{fontSize:13,color:"var(--text-muted)",marginBottom:20}}>
          {results.length} {results.length===1 ? "anime" : "animes"} found
        </p>

        {results.length > 0
          ? <div className="anime-grid">{results.map(function(a) { return <AnimeCard key={a.id} anime={a} {...cardProps}/>; })}</div>
          : (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <div className="empty-title">No results found</div>
              <p style={{fontSize:14}}>Try a different search or filter</p>
            </div>
          )
        }
      </div>
    </div>
  );
}

/* ── SCHEDULE PAGE ──────────────────────────────────────────
   Grid of upcoming anime with poster, release date, synopsis. */
function SchedulePage() {
  return (
    <div className="page">
      <div className="container" style={{paddingTop:32}}>
        <div className="section-title" style={{marginBottom:8}}>Release Schedule</div>
        <p style={{fontSize:13,color:"var(--text-muted)",marginBottom:28}}>Upcoming releases and confirmed dates</p>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:20}}>
          {COMING_SOON.map(function(a) {
            return (
              <div key={a.id} className="info-panel fade-in">
                <div style={{display:"flex",gap:14,marginBottom:14}}>
                  <img src={a.poster} alt={a.title} style={{width:70,height:100,objectFit:"cover",borderRadius:8,flexShrink:0}}
                    onError={function(e) { e.target.src="https://via.placeholder.com/70x100/0d0d26/7c3aed?text=S"; }}
                  />
                  <div>
                    <div style={{fontSize:15,fontWeight:700,marginBottom:6,lineHeight:1.3}}>{a.title}</div>
                    <div style={{fontSize:12,color:"var(--accent)",fontWeight:600,marginBottom:8,display:"flex",alignItems:"center",gap:5}}>
                      <IconCalendar/>{a.releaseDate}
                    </div>
                    <div className="soon-genres">
                      {a.genres.map(function(g) { return <span key={g} className="genre-pill">{g}</span>; })}
                    </div>
                  </div>
                </div>
                <p style={{fontSize:12,color:"var(--text-muted)",lineHeight:1.6}}>{a.synopsis}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── DETAIL PAGE ────────────────────────────────────────────
   Full single-anime view: hero banner, synopsis, episode list,
   info sidebar with MAL link and user watch-status selector.  */
function DetailPage({ anime, setPage, setCurrentEp, userLists, setUserLists, favorites, bookmarks, onFavorite, onBookmark, showToast }) {
  var [dubSub, setDubSub] = React.useState("sub"); // audio track preference

  if (!anime) return null;

  // Determine current user status for this anime
  var currentStatus = Object.keys(userLists).find(function(k) { return userLists[k].includes(anime.id); }) || null;

  // Add/move anime to a watch-status bucket; toggle off if already active
  function setStatus(status) {
    setUserLists(function(prev) {
      var next = Object.assign({}, prev);
      // Remove from all buckets first
      Object.keys(next).forEach(function(k) { next[k] = next[k].filter(function(id) { return id !== anime.id; }); });
      if (status !== currentStatus) { next[status] = [...next[status], anime.id]; }
      saveStorage("userLists", next);
      return next;
    });
    if (status !== currentStatus) showToast('Added to "' + status + '"', "success");
  }

  var isFav  = favorites.includes(anime.id);
  var isBook = bookmarks.includes(anime.id);
  var trackAvailable = dubSub === "sub" ? anime.hasSub : anime.hasDub;

  return (
    <div className="page fade-in">
      {/* Back button */}
      <div style={{position:"absolute",top:72,left:24,zIndex:10}}>
        <button className="btn btn-ghost" onClick={function() { setPage("home"); }}>
          <IconChevronL/> Back
        </button>
      </div>

      {/* Hero banner — blurred background + poster overlay */}
      <div className="detail-hero">
        <div className="detail-hero-bg" style={{backgroundImage:"url("+(anime.banner||anime.poster)+")"}}/>
        <div className="detail-hero-content">
          <div className="detail-poster">
            <img src={anime.poster} alt={anime.title}
              onError={function(e) { e.target.src="https://via.placeholder.com/160x230/0d0d26/7c3aed"; }}
            />
          </div>
          <div className="detail-info">
            <div className="detail-studios">{anime.studio}</div>
            <h1 className="detail-title">{anime.title}</h1>
            <div className="detail-meta-row">
              <div className="detail-rating"><IconStar />{anime.score} / 10</div>
              <span style={{fontSize:13,color:"var(--text-secondary)"}}>{anime.year}</span>
              <span className={"card-status-badge badge-"+anime.status} style={{position:"static"}}>{anime.status}</span>
              <span style={{fontSize:13,color:"var(--text-secondary)"}}>{anime.totalEps} eps</span>
            </div>
            <div className="detail-tags">
              {anime.genres.map(function(g) { return <span key={g} className="genre-pill">{g}</span>; })}
            </div>
          </div>
        </div>
      </div>

      {/* Body: two-column — episodes left, info panel right */}
      <div className="detail-body">
        <div className="detail-grid">
          {/* Left: synopsis + episode list */}
          <div>
            <p className="detail-synopsis" style={{marginBottom:32}}>{anime.synopsis}</p>

            {/* Dub / Sub tabs */}
            <div className="section-title" style={{marginBottom:14}}>Episodes</div>
            <div className="dub-sub-tabs">
              {anime.hasSub && <button className={"tab-btn"+(dubSub==="sub"?" active":"")} onClick={function() { setDubSub("sub"); }}>SUB</button>}
              {anime.hasDub && <button className={"tab-btn"+(dubSub==="dub"?" active":"")} onClick={function() { setDubSub("dub"); }}>DUB</button>}
            </div>
            {!trackAvailable && (
              <p style={{fontSize:13,color:"var(--accent)",marginBottom:12}}>
                ⚠ {dubSub.toUpperCase()} version not available for this title.
              </p>
            )}

            {/* Episode list */}
            <div className="episode-list">
              {anime.episodes.map(function(ep) {
                return (
                  <div key={ep.id} className="episode-item"
                    onClick={function() { setCurrentEp(ep); setPage("watch"); }}>
                    <div className="episode-num">E{ep.id}</div>
                    <img className="episode-thumb" src={ep.thumb} alt={ep.title}
                      onError={function(e) { e.target.src="https://via.placeholder.com/80x48/0d0d26/7c3aed?text=Ep"; }}
                    />
                    <div className="ep-info">
                      <div className="ep-title">{ep.title}</div>
                      <div className="ep-duration"><IconClock /> {ep.duration} · {dubSub.toUpperCase()}</div>
                    </div>
                    <div className="ep-play-btn"><IconPlay/></div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: info panel */}
          <div>
            <div className="info-panel">
              {/* Favorite + Bookmark */}
              <div style={{display:"flex",gap:8,marginBottom:20}}>
                <button className={"btn btn-secondary"+(isFav?" btn-icon active":"")} style={{flex:1}}
                  onClick={function() { onFavorite(anime.id); }}>
                  <IconHeart filled={isFav}/> {isFav?"Favorited":"Favorite"}
                </button>
                <button className={"btn btn-secondary"+(isBook?" btn-icon active":"")} style={{flex:1}}
                  onClick={function() { onBookmark(anime.id); }}>
                  <IconBookmark filled={isBook}/> {isBook?"Saved":"Bookmark"}
                </button>
              </div>

              {/* Stats */}
              <div className="info-stat"><div className="info-label">Studio</div><div className="info-value">{anime.studio}</div></div>
              <div className="info-stat"><div className="info-label">Episodes</div><div className="info-value">{anime.totalEps}</div></div>
              <div className="info-stat"><div className="info-label">Year</div><div className="info-value">{anime.year}</div></div>
              <div className="info-stat">
                <div className="info-label">Score</div>
                <div className="info-value" style={{color:"#fbbf24"}}>{stars(anime.score)} ({anime.score})</div>
              </div>
              <div className="info-stat">
                <div className="info-label">Available</div>
                <div className="info-value" style={{display:"flex",gap:6}}>
                  {anime.hasSub && <span className="genre-pill" style={{color:"#34d399",borderColor:"rgba(52,211,153,0.3)"}}>SUB</span>}
                  {anime.hasDub && <span className="genre-pill" style={{color:"#60a5fa",borderColor:"rgba(96,165,250,0.3)"}}>DUB</span>}
                </div>
              </div>

              {/* MAL external link */}
              <a className="mal-btn" href={"https://myanimelist.net/anime/"+anime.malId} target="_blank" rel="noopener noreferrer">
                <IconExtLink/> View on MyAnimeList
              </a>

              {/* Watch status selector */}
              <div className="status-selector">
                <div className="status-label">My Status</div>
                <div className="status-options">
                  {[
                    {key:"watching",    label:"▶ Currently Watching"},
                    {key:"completed",   label:"✓ Completed"},
                    {key:"planToWatch", label:"🕐 Plan to Watch"},
                    {key:"dropped",     label:"✗ Dropped"},
                  ].map(function(s) {
                    return (
                      <button key={s.key}
                        className={"status-btn"+(currentStatus===s.key?" active-status":"")}
                        onClick={function() { setStatus(s.key); }}>
                        {currentStatus===s.key && <span style={{color:"var(--accent)",marginRight:4}}><IconCheck/></span>}
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer setPage={setPage}/>
    </div>
  );
}

/* ── COMMENT SECTION ────────────────────────────────────────
   Per-episode comment thread. Key: "{animeId}-{epId}".
   Supports: post new, like/unlike. State is local (in-memory). */
function CommentSection({ animeId, epId }) {
  var key = animeId + "-" + epId;
  var [comments, setComments] = React.useState(INITIAL_COMMENTS[key] || []);
  var [text, setText] = React.useState("");

  // Prepend new comment to thread
  function postComment() {
    if (!text.trim()) return;
    var newC = { id: Date.now(), user:"You", avatar:"Y", text:text, time:"just now", likes:0, liked:false };
    setComments(function(c) { return [newC, ...c]; });
    setText("");
  }

  // Toggle thumbs-up; adjusts likes count to match
  function toggleLike(id) {
    setComments(function(c) {
      return c.map(function(x) {
        return x.id===id ? {...x, liked:!x.liked, likes: x.liked ? x.likes-1 : x.likes+1} : x;
      });
    });
  }

  return (
    <div className="comments-section">
      <div className="comments-title">
        Comments <span className="comments-count">{comments.length}</span>
      </div>

      {/* Input area */}
      <div className="comment-input-area">
        <div className="comment-avatar">Y</div>
        <div className="comment-box-wrapper">
          <textarea className="comment-textarea" placeholder="Share your thoughts… (no spoilers!)"
            value={text} onChange={function(e) { setText(e.target.value); }}
            onKeyDown={function(e) { if(e.ctrlKey && e.key==="Enter") postComment(); }}
          />
          <div className="comment-actions">
            <button className="btn btn-ghost btn-sm" onClick={function() { setText(""); }}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={postComment}>Post</button>
          </div>
        </div>
      </div>

      {/* Comment thread */}
      <div className="comment-thread">
        {comments.map(function(c) {
          return (
            <div key={c.id} className="comment-item">
              <div className="comment-avatar" style={{background:"linear-gradient(135deg,#7c3aed,#e8304a)"}}>{c.avatar}</div>
              <div className="comment-body">
                <div className="comment-header">
                  <span className="comment-user">{c.user}</span>
                  <span className="comment-time">{c.time}</span>
                </div>
                <div className="comment-text">{c.text}</div>
                <div className="comment-likes">
                  <button className={"like-btn"+(c.liked?" liked":"")} onClick={function() { toggleLike(c.id); }}>
                    <IconThumb/> {fmt(c.likes)}
                  </button>
                  <button className="like-btn">Reply</button>
                </div>
              </div>
            </div>
          );
        })}
        {comments.length === 0 && (
          <p style={{fontSize:13,color:"var(--text-muted)",textAlign:"center",padding:"20px 0"}}>
            No comments yet. Be the first!
          </p>
        )}
      </div>
    </div>
  );
}

/* ── WATCH PAGE ─────────────────────────────────────────────
   Video player page. Layout: player + controls + comments (left)
   and episode sidebar (right). Uses YouTube embed.            */
function WatchPage({ anime, episode, setCurrentEp, setPage }) {
  var [dubSub, setDubSub] = React.useState("sub");

  if (!anime || !episode) return null;

  var epIndex = anime.episodes.findIndex(function(e) { return e.id === episode.id; });
  var prevEp  = epIndex > 0 ? anime.episodes[epIndex-1] : null;
  var nextEp  = epIndex < anime.episodes.length-1 ? anime.episodes[epIndex+1] : null;

  // YouTube embed — autoplay, minimal branding
  var embedUrl = "https://www.youtube.com/embed/" + episode.videoId + "?autoplay=1&rel=0&modestbranding=1";

  return (
    <div className="page">
      <div className="watch-layout">
        {/* Left: player + info + comments */}
        <div className="player-column">
          <div className="player-wrapper">
            <div className="video-container">
              <iframe src={embedUrl} title={episode.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* Player info bar */}
          <div className="player-info">
            <div className="player-title">{anime.title}</div>
            <div className="player-ep">Episode {episode.id}: {episode.title}</div>
            <div className="player-controls">
              {/* Prev / Next navigation */}
              <button className="ep-nav-btn" disabled={!prevEp} onClick={function() { setCurrentEp(prevEp); }}>
                <IconChevronL/> Prev
              </button>
              <button className="ep-nav-btn" disabled={!nextEp} onClick={function() { setCurrentEp(nextEp); }}>
                Next <IconChevronR/>
              </button>
              {/* Dub / Sub switcher */}
              <div className="dub-sub-tabs" style={{marginBottom:0}}>
                {anime.hasSub && <button className={"tab-btn btn-sm"+(dubSub==="sub"?" active":"")} onClick={function() { setDubSub("sub"); }}>SUB</button>}
                {anime.hasDub && <button className={"tab-btn btn-sm"+(dubSub==="dub"?" active":"")} onClick={function() { setDubSub("dub"); }}>DUB</button>}
              </div>
              <button className="btn btn-secondary btn-sm" onClick={function() { setPage("detail"); }}>Anime Info</button>
            </div>
          </div>

          {/* Comments for this specific episode */}
          <CommentSection animeId={anime.id} epId={episode.id} />
        </div>

        {/* Right: episode sidebar */}
        <div className="watch-sidebar">
          <div className="sidebar-header">Episodes — {dubSub.toUpperCase()}</div>
          {anime.episodes.map(function(ep) {
            return (
              <div key={ep.id} className={"sidebar-ep"+(ep.id===episode.id?" current":"")}
                onClick={function() { setCurrentEp(ep); }}>
                <img className="sidebar-ep-thumb" src={ep.thumb} alt={ep.title}
                  onError={function(e) { e.target.src="https://via.placeholder.com/80x48/0d0d26/7c3aed?text=Ep"; }}
                />
                <div className="sidebar-ep-info">
                  <div className="sidebar-ep-num">EP {ep.id}</div>
                  <div className="sidebar-ep-title">{ep.title}</div>
                  <div style={{fontSize:10,color:"var(--text-muted)",marginTop:3}}><IconClock/> {ep.duration}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── MY LIST PAGE ───────────────────────────────────────────
   User's personal tracking page.
   Tabs: Watching · Completed · Plan to Watch · Dropped
         Favorites · Bookmarks
   Supports removing anime from any list.                    */
function MyListPage({ userLists, setUserLists, favorites, bookmarks, onFavorite, onBookmark, setCurrentAnime, setPage }) {
  var [activeTab, setActiveTab] = React.useState("watching");

  // Resolve which IDs belong to the current tab
  var tabIds = activeTab === "favorites" ? favorites
             : activeTab === "bookmarks" ? bookmarks
             : userLists[activeTab] || [];

  var animes = ANIME_DB.filter(function(a) { return tabIds.includes(a.id); });

  // Remove from the active list; delegates favorites/bookmarks to parent toggles
  function removeFromList(animeId) {
    if (activeTab === "favorites") { onFavorite(animeId); return; }
    if (activeTab === "bookmarks") { onBookmark(animeId); return; }
    setUserLists(function(prev) {
      var next = Object.assign({}, prev, { [activeTab]: prev[activeTab].filter(function(id) { return id !== animeId; }) });
      saveStorage("userLists", next);
      return next;
    });
  }

  // Tab definitions; count displayed as a pill badge
  var tabs = [
    {key:"watching",    label:"Watching"},
    {key:"completed",   label:"Completed"},
    {key:"planToWatch", label:"Plan to Watch"},
    {key:"dropped",     label:"Dropped"},
    {key:"favorites",   label:"Favorites"},
    {key:"bookmarks",   label:"Bookmarks"},
  ];

  function getCount(t) {
    return t.key==="favorites" ? favorites.length
         : t.key==="bookmarks" ? bookmarks.length
         : (userLists[t.key]||[]).length;
  }

  return (
    <div className="page">
      <div className="my-list-page">
        <div className="section-title" style={{marginBottom:8}}>My Anime List</div>
        <p style={{fontSize:13,color:"var(--text-muted)",marginBottom:24}}>
          Track your progress and sync with MyAnimeList
        </p>

        {/* Tab bar */}
        <div className="list-tabs">
          {tabs.map(function(t) {
            return (
              <button key={t.key} className={"list-tab"+(activeTab===t.key?" active":"")}
                onClick={function() { setActiveTab(t.key); }}>
                {t.label}<span className="list-count">{getCount(t)}</span>
              </button>
            );
          })}
        </div>

        {/* Anime rows or empty state */}
        {animes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-title">Nothing here yet</div>
            <p style={{fontSize:14,color:"var(--text-muted)"}}>Browse anime and add them to your list</p>
            <button className="btn btn-primary" style={{marginTop:16}} onClick={function() { setPage("browse"); }}>
              Browse Anime
            </button>
          </div>
        ) : (
          animes.map(function(a) {
            return (
              <div key={a.id} className="list-item"
                onClick={function() { setCurrentAnime(a); setPage("detail"); }}>
                <img className="list-item-poster" src={a.poster} alt={a.title}
                  onError={function(e) { e.target.src="https://via.placeholder.com/48x68/0d0d26/7c3aed?text=A"; }}
                />
                <div className="list-item-info">
                  <div className="list-item-title">{a.title}</div>
                  <div className="list-item-meta">{a.year} · {a.genres[0]} · Score: {a.score}</div>
                </div>
                <div className="list-item-actions" onClick={function(e) { e.stopPropagation(); }}>
                  <button className="remove-btn" onClick={function() { removeFromList(a.id); }}>
                    <IconX/> Remove
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
