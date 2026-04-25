/* ═══════════════════════════════════════════════════════════
   pages.js — Nimbus (DYNAMIC)
   All pages receive `db` (ANIME_DB array) as a prop.
   WatchPage handles multi-source streaming with fallback UI.
   ═══════════════════════════════════════════════════════════ */

/* ── HOME PAGE ─────────────────────────────────────────────── */
function HomePage({ db, soon, updates, setPage, setCurrentAnime, setCurrentEp, favorites, bookmarks, onFavorite, onBookmark }) {
  function handleDetail(anime) { setCurrentAnime(anime); setPage("detail"); }
  function handleWatch(anime, ep) { setCurrentAnime(anime); setCurrentEp(ep); setPage("watch"); }

  var trending  = [...db].sort((a,b) => b.score - a.score);
  var newEps    = db.filter(a => a.newEp);
  var cardProps = { onDetail: handleDetail, onWatch: handleWatch, favorites, bookmarks, onFavorite, onBookmark };

  return (
    <div className="page">
      <UpdatesTicker updates={updates} />
      <HeroBanner db={db} onWatch={handleWatch} onDetail={handleDetail} />

      <div className="container">
        <div className="section">
          <div className="section-header">
            <div className="section-title">Trending This Season</div>
            <button className="view-all" onClick={() => setPage("browse")}>View All →</button>
          </div>
          <div className="anime-grid">
            {trending.slice(0, 6).map(a => <AnimeCard key={a.id} anime={a} {...cardProps}/>)}
          </div>
        </div>

        {newEps.length > 0 && (
          <div className="section">
            <div className="section-header">
              <div className="section-title">New Episodes</div>
            </div>
            <div className="h-scroll">
              {newEps.slice(0,12).map(a => <AnimeCard key={a.id} anime={a} {...cardProps}/>)}
            </div>
          </div>
        )}

        {soon.length > 0 && (
          <div className="section">
            <div className="section-header">
              <div className="section-title">Coming Soon</div>
              <button className="view-all" onClick={() => setPage("schedule")}>Full Schedule →</button>
            </div>
            <div className="h-scroll">
              {soon.map(anime => (
                <div key={anime.id} className="soon-card">
                  <div className="soon-poster">
                    <img src={anime.poster} alt={anime.title}
                      onError={e => { e.target.src="https://via.placeholder.com/240x140/0a0a0a/D4AF37?text=Soon"; }}
                    />
                    <div className="soon-poster-overlay"/>
                  </div>
                  <div className="soon-info">
                    <div className="soon-title">{anime.title}</div>
                    <div className="soon-date"><IconCalendar/>{anime.releaseDate}</div>
                    <div className="soon-genres">
                      {(anime.genres||[]).slice(0,3).map(g => <span key={g} className="genre-pill">{g}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="section">
          <div className="section-header">
            <div className="section-title">Highest Rated</div>
          </div>
          <div className="anime-grid">
            {[...db].sort((a,b) => b.score-a.score).slice(0,4).map(a => <AnimeCard key={a.id} anime={a} {...cardProps}/>)}
          </div>
        </div>
      </div>

      <Footer setPage={setPage}/>
    </div>
  );
}

/* ── BROWSE PAGE ─────────────────────────────────────────────── */
function BrowsePage({ db, searchQuery, setPage, setCurrentAnime, setCurrentEp, favorites, bookmarks, onFavorite, onBookmark }) {
  const [filter, setFilter] = React.useState("All");
  const [sort,   setSort  ] = React.useState("score");
  const [local,  setLocal ] = React.useState(searchQuery);

  React.useEffect(() => { setLocal(searchQuery); }, [searchQuery]);

  const genres = ["All", ...new Set(db.flatMap(a => a.genres))].slice(0, 20);

  const results = db
    .filter(a => filter === "All" || a.genres.includes(filter))
    .filter(a => !local || a.title.toLowerCase().includes(local.toLowerCase()))
    .sort((a,b) =>
      sort === "score" ? b.score - a.score :
      sort === "year"  ? b.year  - a.year  :
      a.title.localeCompare(b.title)
    );

  const cardProps = {
    onDetail: a => { setCurrentAnime(a); setPage("detail"); },
    onWatch:  (a, ep) => { setCurrentAnime(a); setCurrentEp(ep); setPage("watch"); },
    favorites, bookmarks, onFavorite, onBookmark,
  };

  return (
    <div className="page">
      <div className="container" style={{paddingTop:32}}>
        <div className="section-title" style={{marginBottom:24}}>Browse Anime</div>

        <div className="browse-search-bar">
          <input className="browse-search-input" placeholder="Search by title…"
            value={local} onChange={e => setLocal(e.target.value)}
          />
          <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="score">Top Rated</option>
            <option value="year">Newest</option>
            <option value="title">A–Z</option>
          </select>
        </div>

        <div className="browse-filters">
          {genres.map(g => (
            <button key={g} className={"filter-pill" + (filter===g?" active":"")}
              onClick={() => setFilter(g)}>{g}</button>
          ))}
        </div>

        <p style={{fontSize:13,color:"var(--text-muted)",marginBottom:20}}>
          {results.length} {results.length===1?"anime":"animes"} found
        </p>

        {results.length > 0
          ? <div className="anime-grid">{results.map(a => <AnimeCard key={a.id} anime={a} {...cardProps}/>)}</div>
          : (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <div className="empty-title">No results found</div>
              <p style={{fontSize:14}}>Try a different search or genre filter</p>
            </div>
          )
        }
      </div>
    </div>
  );
}

/* ── SCHEDULE PAGE ───────────────────────────────────────────── */
function SchedulePage({ soon }) {
  return (
    <div className="page">
      <div className="container" style={{paddingTop:32}}>
        <div className="section-title" style={{marginBottom:8}}>Release Schedule</div>
        <p style={{fontSize:13,color:"var(--text-muted)",marginBottom:28}}>Upcoming releases and confirmed dates</p>
        {soon.length === 0 && (
          <div className="empty-state"><div className="empty-icon">📅</div><div className="empty-title">Loading schedule…</div></div>
        )}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:20}}>
          {soon.map(a => (
            <div key={a.id} className="info-panel fade-in">
              <div style={{display:"flex",gap:14,marginBottom:14}}>
                <img src={a.poster} alt={a.title}
                  style={{width:70,height:100,objectFit:"cover",borderRadius:8,flexShrink:0}}
                  onError={e => { e.target.src="https://via.placeholder.com/70x100/0a0a0a/D4AF37?text=S"; }}
                />
                <div>
                  <div style={{fontSize:15,fontWeight:700,marginBottom:6,lineHeight:1.3}}>{a.title}</div>
                  <div style={{fontSize:12,color:"var(--accent)",fontWeight:600,marginBottom:8,display:"flex",alignItems:"center",gap:5}}>
                    <IconCalendar/>{a.releaseDate}
                  </div>
                  <div className="soon-genres">
                    {(a.genres||[]).slice(0,3).map(g => <span key={g} className="genre-pill">{g}</span>)}
                  </div>
                </div>
              </div>
              <p style={{fontSize:12,color:"var(--text-muted)",lineHeight:1.6}}>{a.synopsis}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── DETAIL PAGE ─────────────────────────────────────────────── */
function DetailPage({ anime, setPage, setCurrentEp, userLists, setUserLists, favorites, bookmarks, onFavorite, onBookmark, showToast }) {
  const [dubSub, setDubSub] = React.useState("sub");
  const [episodes, setEpisodes] = React.useState(anime?.episodes || []);
  const [epsLoading, setEpsLoading] = React.useState(false);

  if (!anime) return null;

  // Lazily load richer episode list from Jikan
  React.useEffect(() => {
    setEpsLoading(true);
    window.__NimbusData.then(({ fetchEpisodes, getStreamUrl }) => {
      fetchEpisodes(anime.malId).then(jikanEps => {
        if (jikanEps.length > 0) {
          const merged = jikanEps.map(ep => ({
            ...ep,
            thumb: ep.thumb || anime.poster,
            gogoSlug: anime.gogoSlug,
            streamUrl: getStreamUrl(anime, ep.id),
          }));
          setEpisodes(merged);
        } else {
          // Use placeholder episodes with stream URLs
          const withUrls = (anime.episodes || []).map(ep => ({
            ...ep,
            streamUrl: getStreamUrl(anime, ep.id),
          }));
          setEpisodes(withUrls);
        }
        setEpsLoading(false);
      });
    });
  }, [anime.malId]);

  const currentStatus = Object.keys(userLists).find(k => userLists[k].includes(anime.id)) || null;

  function setStatus(status) {
    setUserLists(prev => {
      const next = Object.assign({}, prev);
      Object.keys(next).forEach(k => { next[k] = next[k].filter(id => id !== anime.id); });
      if (status !== currentStatus) next[status] = [...next[status], anime.id];
      saveStorage("userLists", next);
      return next;
    });
    if (status !== currentStatus) showToast('Added to "' + status + '"', "success");
  }

  const isFav  = favorites.includes(anime.id);
  const isBook = bookmarks.includes(anime.id);
  const trackAvailable = dubSub === "sub" ? anime.hasSub : anime.hasDub;

  function handleWatchEp(ep) {
    setCurrentEp(ep);  /* MegaPlay builds URL from anime.malId/alId */
    setPage("watch");
  }

  return (
    <div className="page fade-in">
      <div style={{position:"absolute",top:72,left:24,zIndex:10}}>
        <button className="btn btn-ghost" onClick={() => setPage("home")}>
          <IconChevronL/> Back
        </button>
      </div>

      <div className="detail-hero">
        <div className="detail-hero-bg" style={{backgroundImage:`url(${anime.banner||anime.poster})`}}/>
        <div className="detail-hero-content">
          <div className="detail-poster">
            <img src={anime.poster} alt={anime.title}
              onError={e => { e.target.src="https://via.placeholder.com/160x230/0a0a0a/D4AF37"; }}
            />
          </div>
          <div className="detail-info">
            <div className="detail-studios">{anime.studio}</div>
            <h1 className="detail-title">{anime.title}</h1>
            <div className="detail-meta-row">
              <div className="detail-rating"><IconStar/>{anime.score} / 10</div>
              <span style={{fontSize:13,color:"var(--text-secondary)"}}>{anime.year}</span>
              <span className={"card-status-badge badge-"+anime.status} style={{position:"static"}}>{anime.status}</span>
              <span style={{fontSize:13,color:"var(--text-secondary)"}}>{anime.totalEps} eps</span>
            </div>
            <div className="detail-tags">
              {anime.genres.map(g => <span key={g} className="genre-pill">{g}</span>)}
            </div>
          </div>
        </div>
      </div>

      <div className="detail-body">
        <div className="detail-grid">
          <div>
            <p className="detail-synopsis" style={{marginBottom:32}}>{anime.synopsis}</p>

            <div className="section-title" style={{marginBottom:14}}>Episodes</div>
            <div className="dub-sub-tabs">
              {anime.hasSub && <button className={"tab-btn"+(dubSub==="sub"?" active":"")} onClick={() => setDubSub("sub")}>SUB</button>}
              {anime.hasDub && <button className={"tab-btn"+(dubSub==="dub"?" active":"")} onClick={() => setDubSub("dub")}>DUB</button>}
            </div>
            {!trackAvailable && (
              <p style={{fontSize:13,color:"var(--accent)",marginBottom:12}}>
                ⚠ {dubSub.toUpperCase()} version not available for this title.
              </p>
            )}

            {epsLoading && (
              <div style={{textAlign:"center",padding:"32px 0",color:"var(--text-muted)"}}>
                <div style={{width:28,height:28,border:"2px solid var(--bg-elevated)",borderTopColor:"var(--accent)",borderRadius:"50%",animation:"spin 0.9s linear infinite",margin:"0 auto 10px"}}/>
                Loading episodes…
              </div>
            )}

            <div className="episode-list">
              {episodes.map(ep => (
                <div key={ep.id} className="episode-item" onClick={() => handleWatchEp(ep)}>
                  <div className="episode-num">E{ep.id}</div>
                  <img className="episode-thumb"
                    src={ep.thumb || anime.poster} alt={ep.title}
                    onError={e => { e.target.src="https://via.placeholder.com/80x48/0a0a0a/D4AF37?text=Ep"; }}
                  />
                  <div className="ep-info">
                    <div className="ep-title">{ep.title}</div>
                    <div className="ep-duration">
                      <IconClock/> {ep.duration} · {dubSub.toUpperCase()}
                      {ep.filler && <span style={{marginLeft:8,fontSize:9,color:"#f59e0b",background:"rgba(245,158,11,0.15)",padding:"1px 5px",borderRadius:3}}>FILLER</span>}
                    </div>
                  </div>
                  <div className="ep-play-btn"><IconPlay/></div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="info-panel">
              <div style={{display:"flex",gap:8,marginBottom:20}}>
                <button className={"btn btn-secondary"+(isFav?" btn-icon active":"")} style={{flex:1}}
                  onClick={() => onFavorite(anime.id)}>
                  <IconHeart filled={isFav}/> {isFav?"Favorited":"Favorite"}
                </button>
                <button className={"btn btn-secondary"+(isBook?" btn-icon active":"")} style={{flex:1}}
                  onClick={() => onBookmark(anime.id)}>
                  <IconBookmark filled={isBook}/> {isBook?"Saved":"Bookmark"}
                </button>
              </div>

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

              <a className="mal-btn" href={`https://myanimelist.net/anime/${anime.malId}`} target="_blank" rel="noopener noreferrer">
                <IconExtLink/> View on MyAnimeList
              </a>

              <div className="status-selector">
                <div className="status-label">My Status</div>
                <div className="status-options">
                  {[
                    {key:"watching",    label:"▶ Currently Watching"},
                    {key:"completed",   label:"✓ Completed"},
                    {key:"planToWatch", label:"🕐 Plan to Watch"},
                    {key:"dropped",     label:"✗ Dropped"},
                  ].map(s => (
                    <button key={s.key}
                      className={"status-btn"+(currentStatus===s.key?" active-status":"")}
                      onClick={() => setStatus(s.key)}>
                      {currentStatus===s.key && <span style={{color:"var(--accent)",marginRight:4}}><IconCheck/></span>}
                      {s.label}
                    </button>
                  ))}
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

/* StreamingPlayer is now in js/player.js */

/* ── WATCH PAGE ──────────────────────────────────────────────── */
function WatchPage({ anime, episode, setCurrentEp, setPage }) {
  const [dubSub, setDubSub] = React.useState("sub");
  const episodes = anime?.episodes || [];

  if (!anime || !episode) return null;

  const epIndex = episodes.findIndex(e => e.id === episode.id);
  const prevEp  = epIndex > 0 ? episodes[epIndex-1] : null;
  const nextEp  = epIndex < episodes.length-1 ? episodes[epIndex+1] : null;

  /* MegaPlay constructs URLs from malId/alId — no streamUrl needed */
  function goEp(ep) { setCurrentEp(ep); }

  return (
    <div className="page">
      <div className="watch-layout">
        <div className="player-column">
          <div className="player-wrapper">
            <StreamingPlayer anime={anime} episode={episode} dubSub={dubSub} />
          </div>

          <div className="player-info">
            <div className="player-title">{anime.title}</div>
            <div className="player-ep">Episode {episode.id}: {episode.title}</div>
            <div className="player-controls">
              <button className="ep-nav-btn" disabled={!prevEp} onClick={() => goEp(prevEp)}>
                <IconChevronL/> Prev
              </button>
              <button className="ep-nav-btn" disabled={!nextEp} onClick={() => goEp(nextEp)}>
                Next <IconChevronR/>
              </button>
              <div className="dub-sub-tabs" style={{marginBottom:0}}>
                <button className={"tab-btn btn-sm"+(dubSub==="sub"?" active":"")} onClick={() => setDubSub("sub")}>SUB</button>
                <button className={"tab-btn btn-sm"+(dubSub==="dub"?" active":"")} onClick={() => setDubSub("dub")}>DUB</button>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage("detail")}>Anime Info</button>
            </div>
          </div>

          <CommentSection animeId={anime.id} epId={episode.id}/>
        </div>

        <div className="watch-sidebar">
          <div className="sidebar-header">Episodes — {dubSub.toUpperCase()}</div>
          {episodes.map(ep => (
            <div key={ep.id} className={"sidebar-ep"+(ep.id===episode.id?" current":"")}
              onClick={() => goEp(ep)}>
              <img className="sidebar-ep-thumb"
                src={ep.thumb || anime.poster} alt={ep.title}
                onError={e => { e.target.src="https://via.placeholder.com/80x48/0a0a0a/D4AF37?text=Ep"; }}
              />
              <div className="sidebar-ep-info">
                <div className="sidebar-ep-num">EP {ep.id}</div>
                <div className="sidebar-ep-title">{ep.title}</div>
                <div style={{fontSize:10,color:"var(--text-muted)",marginTop:3}}><IconClock/> {ep.duration}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── MY LIST PAGE ─────────────────────────────────────────────── */
function MyListPage({ db, userLists, setUserLists, favorites, bookmarks, onFavorite, onBookmark, setCurrentAnime, setPage }) {
  const [activeTab, setActiveTab] = React.useState("watching");

  const tabIds = activeTab==="favorites" ? favorites
               : activeTab==="bookmarks" ? bookmarks
               : userLists[activeTab] || [];

  const animes = db.filter(a => tabIds.includes(a.id));

  function removeFromList(animeId) {
    if (activeTab==="favorites") { onFavorite(animeId); return; }
    if (activeTab==="bookmarks") { onBookmark(animeId); return; }
    setUserLists(prev => {
      const next = Object.assign({}, prev, { [activeTab]: prev[activeTab].filter(id => id!==animeId) });
      saveStorage("userLists", next);
      return next;
    });
  }

  const tabs = [
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
        <p style={{fontSize:13,color:"var(--text-muted)",marginBottom:24}}>Track your progress and sync with MyAnimeList</p>

        <div className="list-tabs">
          {tabs.map(t => (
            <button key={t.key} className={"list-tab"+(activeTab===t.key?" active":"")}
              onClick={() => setActiveTab(t.key)}>
              {t.label}<span className="list-count">{getCount(t)}</span>
            </button>
          ))}
        </div>

        {animes.length===0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-title">Nothing here yet</div>
            <p style={{fontSize:14,color:"var(--text-muted)"}}>Browse anime and add them to your list</p>
            <button className="btn btn-primary" style={{marginTop:16}} onClick={() => setPage("browse")}>Browse Anime</button>
          </div>
        ) : (
          animes.map(a => (
            <div key={a.id} className="list-item" onClick={() => { setCurrentAnime(a); setPage("detail"); }}>
              <img className="list-item-poster" src={a.poster} alt={a.title}
                onError={e => { e.target.src="https://via.placeholder.com/48x68/0a0a0a/D4AF37?text=A"; }}
              />
              <div className="list-item-info">
                <div className="list-item-title">{a.title}</div>
                <div className="list-item-meta">{a.year} · {a.genres[0]} · Score: {a.score}</div>
              </div>
              <div className="list-item-actions" onClick={e => e.stopPropagation()}>
                <button className="remove-btn" onClick={() => removeFromList(a.id)}><IconX/> Remove</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ── COMMENT SECTION ─────────────────────────────────────────── */
function CommentSection({ animeId, epId }) {
  const key = animeId + "-" + epId;
  const seedMap = window.__NimbusComments || {};
  const [comments, setComments] = React.useState(seedMap[key] || []);
  const [text, setText] = React.useState("");

  function postComment() {
    if (!text.trim()) return;
    const newC = { id: Date.now(), user:"You", avatar:"Y", text, time:"just now", likes:0, liked:false };
    setComments(c => [newC, ...c]);
    setText("");
  }

  function toggleLike(id) {
    setComments(c => c.map(x => x.id===id ? {...x, liked:!x.liked, likes: x.liked?x.likes-1:x.likes+1} : x));
  }

  return (
    <div className="comments-section">
      <div className="comments-title">
        Comments <span className="comments-count">{comments.length}</span>
      </div>
      <div className="comment-input-area">
        <div className="comment-avatar">Y</div>
        <div className="comment-box-wrapper">
          <textarea className="comment-textarea" placeholder="Share your thoughts… (no spoilers!)"
            value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => { if(e.ctrlKey && e.key==="Enter") postComment(); }}
          />
          <div className="comment-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => setText("")}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={postComment}>Post</button>
          </div>
        </div>
      </div>
      <div className="comment-thread">
        {comments.map(c => (
          <div key={c.id} className="comment-item">
            <div className="comment-avatar" style={{background:"linear-gradient(135deg,#7c3aed,#D4AF37)"}}>{c.avatar}</div>
            <div className="comment-body">
              <div className="comment-header">
                <span className="comment-user">{c.user}</span>
                <span className="comment-time">{c.time}</span>
              </div>
              <div className="comment-text">{c.text}</div>
              <div className="comment-likes">
                <button className={"like-btn"+(c.liked?" liked":"")} onClick={() => toggleLike(c.id)}>
                  <IconThumb/> {fmt(c.likes)}
                </button>
                <button className="like-btn">Reply</button>
              </div>
            </div>
          </div>
        ))}
        {comments.length===0 && (
          <p style={{fontSize:13,color:"var(--text-muted)",textAlign:"center",padding:"20px 0"}}>No comments yet. Be the first!</p>
        )}
      </div>
    </div>
  );
}