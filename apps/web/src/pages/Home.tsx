import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import type { PracticeLog, FeedPracticeLog, Instrument } from "@strava-musician-app/shared";
import "../index.css";

function toFeedPracticeLog(log: PracticeLog): FeedPracticeLog {
  return {
    ...log,
    name: log.userId,
    details: log.postText ?? "",
    instrument: log.instrument ?? "",
    createdAt: new Date(log.createdAt),
  };
}

import FeedPracticeLogCard from "../components/home/FeedPracticeLogCard";
import BottomNav from "../components/navigation/BottomNav";
import { PracticeLogService } from "../model/service";
import { FakeDataServer } from "../model/network";

type InstrumentFilter = "All" | Instrument;

const Home = () => {
  const navigate = useNavigate();
  const practiceLogService = useMemo(() => new PracticeLogService(new FakeDataServer()), []);

  const [selectedInstrument, setSelectedInstrument] =
    useState<InstrumentFilter>("All");

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [practiceLogs, setPracticeLogs] = useState<PracticeLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    loadFeed();
  }, []);

  // const visiblePosts = useMemo(() => {
  //   const byInstrument =
  //     selectedInstrument === "All"
  //       ? posts
  //       : posts.filter((p) => p.instrument === selectedInstrument);

  //   const query = searchText.trim().toLowerCase();
  //   if (!query) return byInstrument;

  //   return byInstrument.filter((p) => {
  //     const haystack =
  //       `${p.name} ${p.title} ${p.details} ${p.instrument}`.toLowerCase();
  //     return haystack.includes(query);
  //   });
  // }, [posts, selectedInstrument, searchText]);

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchText("");
  };

  const refreshFeed = async () => {
    try {
      const feed = await practiceLogService.getFeed();
      setPracticeLogs(feed);
    } catch (error) {
      console.error("Failed to refresh feed:", error);
    }
  };

  const handleLike = async (practiceLog: PracticeLog) => {
    try {
      // if (practiceLog.likedByMe) {
      //   await practiceLogService.unlikePracticeLog(practiceLog.practiceLogId);
      // } else {
      //   await practiceLogService.likePracticeLog(practiceLog.practiceLogId);
      // }
      void practiceLog; // used when like API is wired
      await refreshFeed();
    } catch (error) {
      console.error("Failed to like:", error);
    }
  };

  const handleComment = async (practiceLogId: string, text: string) => {
    try {
      await practiceLogService.commentOnPracticeLog(practiceLogId, text);
      await refreshFeed();
    } catch (error) {
      console.error("Failed to comment on practice log:", error);
    }
  };

  const handleShare = async (practiceLogId: string) => {
    try {
      await practiceLogService.sharePracticeLog(practiceLogId);
      alert("TBD");
    } catch (error) {
      console.error("Failed to share practice log:", error);
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
        </button>
      </div>
    </>
  ) : (
    <div className="header-search-wrap">
      <input
        className="header-search-input"
        placeholder="Search practice logs..."
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

      {/* Filter Bar */}
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
            <option value="Other">Other</option>
          </select>
        </div>

        {/* <div className="filter-status">
          Showing <strong>{visiblePosts.length}</strong>{" "}
          {visiblePosts.length === 1 ? "post" : "posts"}
        </div> */}
      </div>

      {/* Feed */}
      <main className="home-feed">
        {loading ? (
          <div className="feed-empty">Loading feed...</div>
        ) : practiceLogs.length === 0 ? (
          <div className="feed-empty">
            No practice logs found for <strong>{selectedInstrument}</strong>.
          </div>
        ) : (
          practiceLogs.map((practiceLog) => (
            <FeedPracticeLogCard
              key={practiceLog.practiceLogId}
              practiceLog={toFeedPracticeLog(practiceLog)}
              onLike={(practiceLogId) => {
                const p = practiceLogs.find((x) => x.practiceLogId === practiceLogId);
                if (p) handleLike(p);
              }}
              onComment={handleComment}
              onShare={handleShare}
              onProfileClick={() => navigate("/profile")}
            />
          ))
        )}
      </main>

      {/* Bottom Nav */}
      <BottomNav active="home" />
    </div>
  );
};

export default Home;