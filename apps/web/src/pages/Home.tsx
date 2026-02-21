import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from 'lucide-react';
import "../index.css";

type Instrument = "All" | "Piano" | "Violin" | "Clarinet" | "Other";

type Post = {
  id: number;
  name: string;
  time: string;
  title: string;
  details: string;
  instrument: Exclude<Instrument, "All">;
};

const Home = () => {
  const navigate = useNavigate();

  // Instrument dropdown filter
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>("All");

  // Search bar
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Temp feed items (hard-coded until backend exists)
  const posts: Post[] = [
    {
      id: 1,
      name: "Tessa A.",
      time: "Today at 8:09 AM",
      title: "Long tones + scales",
      details: "Clarinet • 35m • Tempo: 96",
      instrument: "Clarinet",
    },
    {
      id: 2,
      name: "Jocelyn E.",
      time: "Yesterday",
      title: "Chopin Etude Op. 10 No. 4",
      details: "Piano • 50m • Tempo: 132",
      instrument: "Piano",
    },
    {
      id: 3,
      name: "Kona V.",
      time: "2 days ago",
      title: "Sight-reading session",
      details: "Violin • 25m • Tempo: 88",
      instrument: "Violin",
    },
    {
      id: 4,
      name: "Sam R.",
      time: "2 days ago",
      title: "Warmup + articulation",
      details: "Other • 20m • Tempo: 104",
      instrument: "Other",
    },
  ];

  // Filter by instrument first, then by search text
  const visiblePosts = useMemo(() => {
    const byInstrument =
      selectedInstrument === "All"
        ? posts
        : posts.filter((p) => p.instrument === selectedInstrument);

    const q = searchText.trim().toLowerCase();
    if (!q) return byInstrument;

    return byInstrument.filter((p) => {
      const haystack = `${p.name} ${p.title} ${p.details} ${p.instrument}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [posts, selectedInstrument, searchText]);

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchText("");
  };

  return (
    <div className="home-container">
      {/* Top Bar */}
      <header className="home-topbar">
        <h1 className="home-title">Home</h1>

        <div className="home-actions">

          <button
            className="home-icon-btn"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
          >
            <Search size ={20}/>
    
            {/* <span style={{ fontSize: '1.2rem' }}>⌕</span> */}
          </button>
                    <button
            className="home-icon-btn"
            aria-label="Profile"
            onClick={() => navigate("/profile")}
          >
            {/* 👤 */}
          </button>

        </div>
      </header>

      {/* Search Bar */}
      {searchOpen && (
        <div
          className="search-overlay"
          onClick={(e) => {
            // close when clicking background and not the panel
            if (e.target === e.currentTarget) closeSearch();
          }}
        >
          <div className="search-panel">
            <div className="search-header">
              <div className="search-title">Search</div>
              <button className="search-close" onClick={closeSearch} aria-label="Close search">
                ✕
              </button>
            </div>

            <input
              className="search-input"
              placeholder="Search stuff yuh yuh"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              autoFocus
            />

            <div className="search-hint">
              (add backend hehe).
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar (dropdown) */}
      <div className="feed-filterbar">
        <div className="filter-group">
          <label className="filter-label" htmlFor="instrumentFilter">
            Instrument
          </label>

          <select
            id="instrumentFilter"
            className="filter-select"
            value={selectedInstrument}
            onChange={(e) => setSelectedInstrument(e.target.value as Instrument)}
          >
            <option value="All">All</option>
            <option value="Piano">Piano</option>
            <option value="Violin">Violin</option>
            <option value="Clarinet">Clarinet</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="filter-status">
          Showing <strong>{visiblePosts.length}</strong>{" "}
          {visiblePosts.length === 1 ? "post" : "posts"}
        </div>
      </div>

      {/* Feed */}
      <main className="home-feed">
        {visiblePosts.length === 0 ? (
          <div className="feed-empty">
            No posts found for <strong>{selectedInstrument}</strong>.
          </div>
        ) : (
          visiblePosts.map((p) => (
            <article className="feed-card" key={p.id}>
              <div className="feed-card-header">
                <div className="feed-avatar">{p.name[0]}</div>

                <div className="feed-meta">
                  <div className="feed-name">{p.name}</div>
                  <div className="feed-subtitle">{p.time}</div>
                </div>

                <button className="feed-more" aria-label="More options">
                  •••
                </button>
              </div>

              <div className="feed-card-body">
                <div className="feed-post-title">{p.title}</div>
                <div className="feed-post-details">{p.details}</div>

                {/* optional debug line to confirm filtering instrument tags */}
                <div className="feed-instrument-tag">Instrument: {p.instrument}</div>
              </div>

              <div className="feed-media-placeholder" />

              <div className="feed-card-footer">
                <button className="feed-action-btn">Like</button>
                <button className="feed-action-btn">Comment</button>
                <button className="feed-action-btn">Share</button>
              </div>
            </article>
          ))
        )}
      </main>

      {/* Bottom Nav (4 main pages) */}
      <nav className="home-bottomnav">
        <button className="nav-btn nav-btn-active" onClick={() => navigate("/home")}>
          Home
        </button>
        <button className="nav-btn" onClick={() => navigate("/record")}>
          Record
        </button>
        <button className="nav-btn" onClick={() => navigate("/calendar")}>
          Calendar
        </button>
        <button className="nav-btn" onClick={() => navigate("/profile")}>
          Profile
        </button>
      </nav>
    </div>
  );
};

export default Home;
