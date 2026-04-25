/* ═══════════════════════════════════════════════════════════
   app.js — Nimbus (DYNAMIC)
   Root App: awaits NimbusData, then renders the full app.
   ═══════════════════════════════════════════════════════════ */

function App() {
  /* ── Data bootstrap state ── */
  const [db,      setDb     ] = React.useState(null);   // ANIME_DB array
  const [soon,    setSoon   ] = React.useState([]);     // COMING_SOON
  const [loading, setLoading] = React.useState(true);
  const [dbError, setDbError] = React.useState(null);

  /* ── Routing ── */
  const [page,         setPage        ] = React.useState("home");
  const [searchQuery,  setSearchQuery ] = React.useState("");
  const [currentAnime, setCurrentAnime] = React.useState(null);
  const [currentEp,    setCurrentEp   ] = React.useState(null);

  /* ── Persistent user data ── */
  const [favorites, setFavorites] = React.useState(() => loadStorage("favorites", []));
  const [bookmarks, setBookmarks] = React.useState(() => loadStorage("bookmarks", []));
  const [updates,   setUpdates  ] = React.useState([]);
  const [userLists, setUserLists] = React.useState(() =>
    loadStorage("userLists", { watching:[], completed:[], planToWatch:[], dropped:[] })
  );

  const { toasts, showToast } = useToast();

  /* ── Boot: resolve NimbusData promise ── */
  React.useEffect(function() {
    window.__NimbusData
      .then(function(data) {
        setDb(data.ANIME_DB);
        setSoon(data.COMING_SOON);
        setUpdates(data.UPDATES || []);
        // Expose INITIAL_COMMENTS globally so CommentSection can read it
        window.__NimbusComments = data.INITIAL_COMMENTS || {};
        setLoading(false);
      })
      .catch(function(err) {
        setDbError(err.message || "Failed to load anime data");
        setLoading(false);
      });
  }, []);

  /* ── Favorite toggle ── */
  const onFavorite = (id) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id];
      saveStorage("favorites", next);
      showToast(prev.includes(id) ? "Removed from Favorites" : "Added to Favorites ❤");
      return next;
    });
  };

  /* ── Bookmark toggle ── */
  const onBookmark = (id) => {
    setBookmarks(prev => {
      const next = prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id];
      saveStorage("bookmarks", next);
      showToast(prev.includes(id) ? "Removed Bookmark" : "Bookmarked 🔖");
      return next;
    });
  };

  const listProps = { favorites, bookmarks, onFavorite, onBookmark, showToast };

  /* ── Loading screen ── */
  if (loading) {
    return (
      <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"var(--bg-base)",gap:20}}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:36,color:"var(--accent)",letterSpacing:3,textShadow:"0 0 30px var(--accent-glow)"}}>
          ANI<span style={{color:"#fff"}}>VERSE</span>
        </div>
        <div style={{width:48,height:48,border:"3px solid var(--bg-elevated)",borderTopColor:"var(--accent)",borderRadius:"50%",animation:"spin 0.9s linear infinite"}}/>
        <div style={{fontSize:13,color:"var(--text-muted)"}}>Fetching latest anime…</div>
      </div>
    );
  }

  /* ── Error screen (shows static fallback notice) ── */
  if (dbError || !db) {
    return (
      <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"var(--bg-base)",gap:16,padding:24}}>
        <div style={{fontSize:48}}>⚠️</div>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:"var(--accent)"}}>Could not load anime data</div>
        <p style={{fontSize:14,color:"var(--text-muted)",textAlign:"center",maxWidth:400}}>
          {dbError || "Unknown error"}. This may be a CORS or network issue. Try opening the page from a local server.
        </p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  /* ── Page router ── */
  const renderPage = () => {
    switch (page) {
      case "home":
        return <HomePage     db={db} soon={soon} updates={updates} setPage={setPage} setCurrentAnime={setCurrentAnime} setCurrentEp={setCurrentEp} {...listProps}/>;
      case "browse":
        return <BrowsePage   db={db} searchQuery={searchQuery} setPage={setPage} setCurrentAnime={setCurrentAnime} setCurrentEp={setCurrentEp} {...listProps}/>;
      case "schedule":
        return <SchedulePage soon={soon} />;
      case "detail":
        return <DetailPage   anime={currentAnime} setPage={setPage} setCurrentEp={setCurrentEp} userLists={userLists} setUserLists={setUserLists} {...listProps}/>;
      case "watch":
        return <WatchPage    anime={currentAnime} episode={currentEp} setCurrentEp={setCurrentEp} setPage={setPage}/>;
      case "mylist":
        return <MyListPage   db={db} userLists={userLists} setUserLists={setUserLists} setCurrentAnime={setCurrentAnime} setPage={setPage} {...listProps}/>;
      default:
        return <HomePage     db={db} soon={soon} setPage={setPage} setCurrentAnime={setCurrentAnime} setCurrentEp={setCurrentEp} {...listProps}/>;
    }
  };

  return (
    <>
      <Navbar page={page} setPage={setPage} searchQuery={searchQuery} setSearchQuery={setSearchQuery}/>
      {renderPage()}
      <ToastContainer toasts={toasts}/>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);