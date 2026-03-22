import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import type { PracticeLog, Instrument, UserSearchResult } from "@strava-musician-app/shared";
import { INSTRUMENTS } from "@strava-musician-app/shared";
import "./index.css";
import FeedPracticeLogCard from "./FeedPracticeLogCard";
import BottomNav from "../navigation/BottomNav";
import { practiceLogService, userService } from "../../model";
type InstrumentFilter = "All" | Instrument;

const Home = () => {
  const navigate = useNavigate();
  

  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentFilter>("All");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
 
  const [practiceLogs, setPracticeLogs] = useState<PracticeLog[]>([]);
  const [loading, setLoading] = useState(true);
  //change to user
  const [currentUser, setCurrentUser] = useState<{ userId: String, username: string} | null>(null);
  const [userInitial, setUserInitial] = useState<string>("👤");
  
  // User search state
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  // change this as well
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

    // Load current user and initial feed
  useEffect(() => {
    const init = async () => {
      try {
        const user = await userService.getCurrentUser();
        if (user) {
          setCurrentUser({ userId: user.userId, username: user.username });
          setUserInitial(user.username[0]?.toUpperCase() || "U");
          
          // Load friends list
          const friends = await practiceLogService.getFriends(undefined, 100);
          const friendIds = new Set(friends.map((f) => f.friendId));
          setFollowedUsers(friendIds);
        }
        await loadFeed();
      } catch (error) {
        console.error("Failed to initialize:", error);
      }
    };
    init();
  }, []);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const feed = await practiceLogService.getFeed();
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

    if (currentUser) {
      filtered = filtered.filter(
        (log) =>
          log.userId === currentUser.userId || followedUsers.has(log.userId)
      );
    }
    // Filter by instrument
    if (selectedInstrument !== "All") {
      filtered = filtered.filter((log) => log.instrument === selectedInstrument);
    }

    return filtered;
  }, [practiceLogs, selectedInstrument]);

  // Handle user search
  useEffect(() => {
    if (searchText.trim()) {
      const timer = setTimeout(() => {
        searchUsers(searchText);
      }, 300); // Debounce

      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchText]);

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
      await practiceLogService.commentOnPracticeLog(practiceLogId, text);
      await loadFeed();
    } catch (error) {
      console.error("Failed to comment on practice log:", error);
    }
  };

  const handleShare = async (feedLog: PracticeLog) => {
    const title = feedLog.title?.trim() || "Practice log";
    const textParts = [feedLog.title, feedLog.postText].filter(
      (s) => typeof s === "string" && s.trim().length > 0,
    ) as string[];
    const text =
      textParts.length > 0 ? textParts.join("\n\n") : undefined;
    const url =
      typeof window !== "undefined" ? window.location.href : undefined;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (error) {
        const name = error instanceof DOMException ? error.name : "";
        if (name === "AbortError") return;
        console.error("Share failed:", error);
      }
      return;
    }

    const fallback = [title, text, url].filter(Boolean).join("\n\n");
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(fallback);
        alert("Copied to clipboard — you can paste into any app to share.");
      } else {
        alert(fallback);
      }
    } catch (error) {
      console.error("Share fallback failed:", error);
      alert("Sharing isn’t supported in this browser.");
    }
  };

  const handleDelete = async (practiceLogId: string) => {
    try {
      await practiceLogService.deletePracticeLog(practiceLogId);
      setPracticeLogs((prev) => prev.filter((log) => log.practiceLogId !== practiceLogId));
    } catch (error) {
      console.error("Failed to delete practice log:", error);
      alert("Failed to delete practice log");
    }
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
    closeSearch();
  };

  const handleFollowUser = async (userId: string) => {
    try {
      await practiceLogService.sendFriendRequest(userId);
      setFollowedUsers((prev) => new Set([...prev, userId]));
      closeSearch();
      await loadFeed();
    } catch (error) {
      console.error("Failed to send friend request:", error);
      alert("Failed to follow user");
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
                className="home-icon-btn profile-avatar-btn"
                aria-label="Profile"
                onClick={() => navigate("/profile")}
                type="button"
              >
                <div className="topbar-avatar-circle">
                    {userInitial}
                </div>
                {/* profile icon / initials later */}
                👤
              </button>
            </div>
          </>
        ) : (
          <div className="header-search-wrap">
            <input
              className="header-search-input"
              placeholder="Search for users..."
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

    {searchOpen && searchText.trim() && (
        <div className="search-results">
          {searchLoading ? (
            <div className="search-loading">Searching...</div>
          ) : searchResults.length === 0 ? (
            <div className="search-empty">No users found</div>
          ) : (
            <div className="user-results-list">
              {searchResults.map((user) => {
                const isFollowing = followedUsers.has(user.userId);
                const isSelf = user.userId === currentUser?.userId;
                
                return (
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
                    {!isSelf && (
                      <button
                        className={`user-result-follow ${isFollowing ? "following" : ""}`}
                        onClick={() => handleFollowUser(user.userId)}
                        type="button"
                        disabled={isFollowing}
                      >
                        {isFollowing ? "Following" : "Follow"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Filter Bar */}
      {!searchOpen  && (
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
              <option value = "All">All</option>
              {INSTRUMENTS.map((inst) => (
                <option key={inst} value={inst}>
                  {inst}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-status">
            Showing <strong>{visiblePosts.length}</strong>{" "}
            {visiblePosts.length === 1 ? "log" : "logs"}
          </div>
        </div>
      )}

      {/* Feed */}
      {!searchOpen && (
        <main className="home-feed">
          {loading ? (
            <div className="feed-empty">Loading feed...</div>
          ) : visiblePosts.length === 0 ? (
            <div className="feed-empty">
              {followedUsers.size === 0 ? (
                <>
                  <p>Welcome to Koda! 🎵</p>
                  <p>Search for users above and follow them to see their practice logs in your feed</p>
                </>
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