import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search } from "lucide-react";
import type { PracticeLog, Instrument, UserSearchResult, User, FriendRequest } from "@strava-musician-app/shared";
import { INSTRUMENTS } from "@strava-musician-app/shared";
import "./index.css";
import FeedPracticeLogCard from "./FeedPracticeLogCard";
import BottomNav from "../navigation/BottomNav";
import { practiceLogService, userService, friendService, friendRequestsService, likesService, commentsService } from "../../model";
type InstrumentFilter = "All" | Instrument;

const Home = () => {
  const navigate = useNavigate();
  

  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentFilter>("All");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
 
  const [practiceLogs, setPracticeLogs] = useState<PracticeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userInitial, setUserInitial] = useState<string>("👤");
  
  // User search state
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  // change this as well
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [requestSenders, setRequestSenders] = useState<Map<string, User>>(new Map());

    // Load current user and initial feed
  useEffect(() => {
    const init = async () => {
      try {
        const user = await userService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          setUserInitial(user.username[0]?.toUpperCase() || "👤");
          
          // Load friends list
          const friends = await friendService.getFriends(undefined, 100);
          const friendIds = new Set(friends.map((f) => f.friendId));
          setFollowedUsers(friendIds);
        }
        await loadFeed();
        await loadNotifications(); // FIXED: Call loadNotifications
      } catch (error) {
        console.error("Failed to initialize:", error);
      }
    };
    init();
  }, []);

  // Reload user data when page becomes visible (catches profile photo updates)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && currentUser) {
        try {
          const user = await userService.getCurrentUser();
          if (user) {
            setCurrentUser(user);
            setUserInitial(user.username[0]?.toUpperCase() || "👤");
          }
        } catch (error) {
          console.error("Failed to reload user:", error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentUser]);

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

  const loadNotifications = async () => {
    try {
      const requests = await friendRequestsService.getIncomingFriendRequests(undefined, 20);
      setFriendRequests(requests);
      setUnreadCount(requests.length);

      const senderMap = new Map<string, User>();
      for (const req of requests) {
        try {
          const sender = await userService.getUser(req.senderId);
          senderMap.set(req.senderId, sender);
        } catch (err) {
          console.error("Failed to load sender:", err);
        }
      }
      setRequestSenders(senderMap);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  }

    const handleAcceptFriendRequest = async (requestId: string) => {
    try {
      await friendRequestsService.acceptFriendRequest(requestId);
      await loadNotifications();
      await loadFeed();
      
      // Reload friends list
      const friends = await friendService.getFriends(undefined, 100);
      const friendIds = new Set(friends.map((f) => f.friendId));
      setFollowedUsers(friendIds);
    } catch (error) {
      console.error("Failed to accept friend request:", error);
    }
  };
 
  const handleRejectFriendRequest = async (requestId: string) => {
    try {
      await friendRequestsService.rejectFriendRequest(requestId);
      await loadNotifications();
    } catch (error) {
      console.error("Failed to reject friend request:", error);
    }
  };

  // Filter posts by instrument and search text
  const visiblePosts = useMemo(() => {
    let filtered = practiceLogs;

    // if (currentUser) {
    //   filtered = filtered.filter(
    //     (log) =>
    //       log.userId === currentUser.userId || followedUsers.has(log.userId)
    //   );
    // }
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
      const results = await userService.searchUsers(query);
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
      await likesService.likePracticeLog(practiceLogId);
      await loadFeed();
    } catch (error) {
      console.error("Failed to like:", error);
    }
  };

  const handleUnlike = async (practiceLogId: string) => {
    try {
      await likesService.unlikePracticeLog(practiceLogId);
      await loadFeed();
    } catch (error) {
      console.error("Failed to unlike:", error);
    }
  };

  const handleComment = async (practiceLogId: string, text: string) => {
    try {
      await commentsService.commentOnPracticeLog(practiceLogId, text);
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
      await practiceLogService.discardPracticeLog(practiceLogId);
      setPracticeLogs((prev) => prev.filter((log) => log.practiceLogId !== practiceLogId));
    } catch (error) {
      console.error("Failed to delete practice log:", error);
      alert("Failed to delete practice log");
    }
  };

  const handleEdit = (practiceLogId: string) => {
    navigate(`/practice-log/edit/${practiceLogId}`);
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
    closeSearch();
  };

  const handleFollowUser = async (userId: string) => {
    try {
      await friendRequestsService.sendFriendRequest(userId);
      alert("Friend request sent!");
      // setFollowedUsers((prev) => new Set([...prev, userId]));
      closeSearch();
      await loadFeed();
    } catch (error) {
      console.error("Failed to send friend request:", error);
      alert("Failed to send request to user");
      closeSearch();
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
                className="home-icon-btn notification-btn"
                aria-label="Notifications"
                onClick={() => setNotificationOpen(!notificationOpen)}
                type="button"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button> 

              <button
                className="home-icon-btn profile-avatar-btn"
                aria-label="Profile"
                onClick={() => navigate("/profile")}
                type="button"
              >
                {currentUser?.profilePhoto ? (
                  <img 
                    src={currentUser.profilePhoto} 
                    alt={currentUser.username}
                    className="topbar-avatar-image"
                  />
                ) : (
                  <div className="topbar-avatar-circle">
                    {userInitial}
                  </div>
                )}
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

      {/* Notification Dropdown */}
      {notificationOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <span className="notification-title">Friend Requests</span>
            <button
              className="notification-close"
              onClick={() => setNotificationOpen(false)}
              type="button"
            >
              ✕
            </button>
          </div>
          <div className="notification-list">
            {friendRequests.length === 0 ? (
              <div className="notification-empty">No pending friend requests</div>
            ) : (
              friendRequests.map((request) => {
                const sender = requestSenders.get(request.senderId);
                if (!sender) return null;
 
                return (
                  <div key={request.requestId} className="notification-item">
                    <div className="notification-user-info">
                      <div className="notification-avatar">
                        {sender.username[0].toUpperCase()}
                      </div>
                      <div className="notification-details">
                        <div className="notification-username">{sender.username}</div>
                        <div className="notification-text">wants to be friends</div>
                      </div>
                    </div>
                    <div className="notification-actions">
                      <button
                        className="notification-accept-btn"
                        onClick={() => handleAcceptFriendRequest(request.requestId)}
                        type="button"
                      >
                        Accept
                      </button>
                      <button
                        className="notification-reject-btn"
                        onClick={() => handleRejectFriendRequest(request.requestId)}
                        type="button"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

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
              {selectedInstrument !== "All" ? (
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
                currentUserId={currentUser?.userId}
                onLike={handleLike}
                onUnlike={handleUnlike}
                onComment={handleComment}
                onShare={handleShare}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onProfileClick={handleUserClick}
              />
            ))
          )}
        </main>
      )}
      {/* {!searchOpen && (
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
      )} */}

      {/* Bottom Nav */}
      <BottomNav active="home" />
    </div>
  );
};

export default Home;