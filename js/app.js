/* ═══════════════════════════════════════════════════════════
   app.js — Nimbus
   Root App component: holds all global state and routes
   between pages. Also the React 18 entry point.

   State managed here:
     page          — current route (string, no react-router)
     searchQuery   — navbar search value
     currentAnime  — the anime being viewed / watched
     currentEp     — the episode being watched
     favorites     — array of anime IDs (persisted)
     bookmarks     — array of anime IDs (persisted)
     userLists     — { watching, completed, planToWatch, dropped }

   Load order: React → data.js → helpers.js → icons.js
               → components.js → pages.js → app.js
   ═══════════════════════════════════════════════════════════ */
function App() {
  /* ── Routing ── */
  const [page,         setPage        ] = React.useState("home");
  const [searchQuery,  setSearchQuery ] = React.useState("");
  const [currentAnime, setCurrentAnime] = React.useState(null);
  const [currentEp,    setCurrentEp   ] = React.useState(null);

  /* ── Persistent user data (seeded from localStorage on mount) ── */
  const [favorites, setFavorites] = React.useState(() => loadStorage("favorites", []));
  const [bookmarks, setBookmarks] = React.useState(() => loadStorage("bookmarks", []));
  const [userLists, setUserLists] = React.useState(() =>
    loadStorage("userLists", { watching:[], completed:[], planToWatch:[], dropped:[] })
  );

  const { toasts, showToast } = useToast();

  /* ── Toggle favorite — persists immediately ── */
  const onFavorite = (id) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(x => x!==id) : [...prev, id];
      saveStorage("favorites", next);
      showToast(prev.includes(id) ? "Removed from Favorites" : "Added to Favorites ❤");
      return next;
    });
  };

  /* ── Toggle bookmark — persists immediately ── */
  const onBookmark = (id) => {
    setBookmarks(prev => {
      const next = prev.includes(id) ? prev.filter(x => x!==id) : [...prev, id];
      saveStorage("bookmarks", next);
      showToast(prev.includes(id) ? "Removed Bookmark" : "Bookmarked 🔖");
      return next;
    });
  };

  // Bundle props shared by most page components
  const listProps = { favorites, bookmarks, onFavorite, onBookmark, showToast };

  /* ── Page router — switch on `page` string ── */
  const renderPage = () => {
    switch (page) {
      case "home":
        return <HomePage     setPage={setPage} setCurrentAnime={setCurrentAnime} setCurrentEp={setCurrentEp} {...listProps}/>;
      case "browse":
        return <BrowsePage   searchQuery={searchQuery} setPage={setPage} setCurrentAnime={setCurrentAnime} setCurrentEp={setCurrentEp} {...listProps}/>;
      case "schedule":
        return <SchedulePage />;
      case "detail":
        return <DetailPage   anime={currentAnime} setPage={setPage} setCurrentEp={setCurrentEp} userLists={userLists} setUserLists={setUserLists} {...listProps}/>;
      case "watch":
        return <WatchPage    anime={currentAnime} episode={currentEp} setCurrentEp={setCurrentEp} setPage={setPage}/>;
      case "mylist":
        return <MyListPage   userLists={userLists} setUserLists={setUserLists} setCurrentAnime={setCurrentAnime} setPage={setPage} {...listProps}/>;
      default:
        return <HomePage     setPage={setPage} setCurrentAnime={setCurrentAnime} setCurrentEp={setCurrentEp} {...listProps}/>;
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

/* ── Entry point — React 18 concurrent mode ── */
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
