import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import type { PracticeLog, Instrument, UserSearchResult } from "@strava-musician-app/shared";
import "./index.css";
import FeedPracticeLogCard from "./FeedPracticeLogCard";
import BottomNav from "../navigation/BottomNav";
import { PracticeLogService } from "../../model/service";
import { FakeDataServer } from "../../model/network/FakeDataServer";
// import { ServerFacade } from "../../model/network/ServerFacade";

type InstrumentFilter = "All" | Instrument;
type SearchMode = "posts" | "users";

const Home = () => {
  const navigate = useNavigate();
  
  // Use FakeDataServer for now, switch to ServerFacade when ready
  const practiceLogService = useMemo(() => new PracticeLogService(new FakeDataServer()), []);
  // const practiceLogService = useMemo(() => new PracticeLogService(new ServerFacade()), []);

  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentFilter>("All");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("users");

  const [practiceLogs, setPracticeLogs] = useState<PracticeLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // User search state
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Load initial feed
  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const feed = await practiceLogService.getPracticeLogsFeed({});
      setPracticeLogs(feed);
    } catch (error) {
      console.error("Failed to load feed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter posts by instrument and search text
  const visiblePosts = useMemo(() => {
    let filtered = practiceLogs;

    // Filter by instrument
    if (selectedInstrument !== "All") {
      filtered = filtered.filter((log) => log.instrument === selectedInstrument);
    }

    // Filter by search text (when in posts mode)
    if (searchMode === "posts" && searchText.trim()) {
      const query = searchText.trim().toLowerCase();
      filtered = filtered.filter((log) => {
        const haystack = `${log.title} ${log.postText || ""} ${log.instrument || ""} ${log.pieceTitle || ""} ${log.composer || ""}`.toLowerCase();
        return haystack.includes(query);
      });
    }

    return filtered;
  }, [practiceLogs, selectedInstrument, searchText, searchMode]);

  // Handle user search
  useEffect(() => {
    if (searchMode === "users" && searchText.trim()) {
      const timer = setTimeout(() => {
        searchUsers(searchText);
      }, 300); // Debounce

      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchText, searchMode]);

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const results = await practiceLogService.searchUsers(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Failed to search users:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchText("");
    setSearchResults([]);
  };

  const handleLike = async (practiceLogId: string) => {
    try {
      // Find if already liked (would need to track this in the UI state or fetch from server)
      await practiceLogService.likePracticeLog(practiceLogId);
      await loadFeed();
    } catch (error) {
      console.error("Failed to like:", error);
    }
  };

  const handleUnlike = async (practiceLogId: string) => {
    try {
      await practiceLogService.unlikePracticeLog(practiceLogId);
      await loadFeed();
    } catch (error) {
      console.error("Failed to unlike:", error);
    }
  };

  const handleComment = async (practiceLogId: string, text: string) => {
    try {
      await practiceLogService.commentOnPracticeLog(practiceLogId, { text });
      await loadFeed();
    } catch (error) {
      console.error("Failed to comment on practice log:", error);
    }
  };

  const handleShare = async (practiceLogId: string) => {
    try {
      await practiceLogService.sharePracticeLog(practiceLogId);
      alert("Shared! (Share functionality coming soon)");
    } catch (error) {
      console.error("Failed to share practice log:", error);
    }
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
    closeSearch();
  };

  const handleFollowUser = async (userId: string) => {
    try {
      await practiceLogService.sendFriendRequest(userId);
      alert("Friend request sent!");
    } catch (error) {
      console.error("Failed to send friend request:", error);
    }
  };

  return (
    <div className="home-container">
      {/* Top Bar */}
      <header className="home-topbar">
        {!searchOpen ? (
          <>
            <h1 className="home-title">Home</h1>

            <div className="home-actions">
              <button
                className="home-icon-btn"
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
                type="button"
              >
                <Search size={20} />
              </button>

              <button
                className="home-icon-btn"
                aria-label="Profile"
                onClick={() => navigate("/profile")}
                type="button"
              >
                {/* profile icon / initials later */}
                👤
              </button>
            </div>
          </>
        ) : (
          <div className="header-search-wrap">
            <div className="search-mode-tabs">
              <button
                className={searchMode === "users" ? "active" : ""}
                onClick={() => setSearchMode("users")}
                type="button"
              >
                Users
              </button>
              <button
                className={searchMode === "posts" ? "active" : ""}
                onClick={() => setSearchMode("posts")}
                type="button"
              >
                Posts
              </button>
            </div>
            <input
              className="header-search-input"
              placeholder={
                searchMode === "users"
                  ? "Search for users..."
                  : "Search practice logs..."
              }
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              autoFocus
            />
            <button
              className="header-search-close"
              type="button"
              onClick={closeSearch}
            >
              ✕
            </button>
          </div>
        )}
      </header>

      {/* Search Results */}
      {searchOpen && searchMode === "users" && searchText.trim() && (
        <div className="search-results">
          {searchLoading ? (
            <div className="search-loading">Searching...</div>
          ) : searchResults.length === 0 ? (
            <div className="search-empty">No users found</div>
          ) : (
            <div className="user-results-list">
              {searchResults.map((user) => (
                <div key={user.userId} className="user-result-item">
                  <button
                    className="user-result-profile"
                    onClick={() => handleUserClick(user.userId)}
                    type="button"
                  >
                    <div className="user-result-avatar">
                      {user.username[0].toUpperCase()}
                    </div>
                    <div className="user-result-info">
                      <div className="user-result-name">{user.username}</div>
                      {user.bio && (
                        <div className="user-result-bio">{user.bio}</div>
                      )}
                    </div>
                  </button>
                  <button
                    className="user-result-follow"
                    onClick={() => handleFollowUser(user.userId)}
                    type="button"
                  >
                    Follow
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filter Bar */}
      {(!searchOpen || searchMode === "posts") && (
        <div className="feed-filterbar">
          <div className="filter-group">
            <label className="filter-label" htmlFor="instrumentFilter">
              Instrument
            </label>

            <select
              id="instrumentFilter"
              className="filter-select"
              value={selectedInstrument}
              onChange={(e) =>
                setSelectedInstrument(e.target.value as InstrumentFilter)
              }
            >
              <option value="All">All</option>
              <option value="Piano">Piano</option>
              <option value="Violin">Violin</option>
              <option value="Clarinet">Clarinet</option>
              <option value="Guitar">Guitar</option>
              <option value="Saxophone">Saxophone</option>
              <option value="Cello">Cello</option>
              <option value="Flute">Flute</option>
              <option value="Drums">Drums</option>
              <option value="Voice">Voice</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="filter-status">
            Showing <strong>{visiblePosts.length}</strong>{" "}
            {visiblePosts.length === 1 ? "log" : "logs"}
          </div>
        </div>
      )}

      {/* Feed */}
      {(!searchOpen || searchMode === "posts") && (
        <main className="home-feed">
          {loading ? (
            <div className="feed-empty">Loading feed...</div>
          ) : visiblePosts.length === 0 ? (
            <div className="feed-empty">
              {searchText && searchMode === "posts" ? (
                <>No practice logs found matching "{searchText}"</>
              ) : selectedInstrument !== "All" ? (
                <>
                  No practice logs found for <strong>{selectedInstrument}</strong>.
                </>
              ) : (
                <>No practice logs yet. Start practicing and share your progress!</>
              )}
            </div>
          ) : (
            visiblePosts.map((practiceLog) => (
              <FeedPracticeLogCard
                key={practiceLog.practiceLogId}
                practiceLog={practiceLog}
                onLike={handleLike}
                onUnlike={handleUnlike}
                onComment={handleComment}
                onShare={handleShare}
                onProfileClick={handleUserClick}
              />
            ))
          )}
        </main>
      )}

      {/* Bottom Nav */}
      <BottomNav active="home" />
    </div>
  );
};

export default Home;