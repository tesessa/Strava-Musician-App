import { useState } from "react";
import type { PracticeLog } from "@strava-musician-app/shared";
import "./index.css";

type FeedPracticeLogCardProps = {
  practiceLog: PracticeLog;
  onLike: (practiceLogId: string) => Promise<void> | void;
  onUnlike: (practiceLogId: string) => Promise<void> | void;
  onComment: (practiceLogId: string, text: string) => Promise<void> | void;
  onShare: (practiceLog: PracticeLog) => Promise<void> | void;
  onProfileClick?: (userId?: string) => void;
};

const FeedPracticeLogCard = ({
  practiceLog,
  onLike,
  onUnlike,
  onComment,
  onShare,
  onProfileClick,
}: FeedPracticeLogCardProps) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isLiked, setIsLiked] = useState(false); // This should come from server data eventually
  const [likeCount, setLikeCount] = useState(0); // This should come from server data eventually

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    await onComment(practiceLog.practiceLogId, commentText);
    setCommentText("");
    setCommentOpen(true);
  };

  const handleLikeToggle = async () => {
    try {
      if (isLiked) {
        await onUnlike(practiceLog.practiceLogId);
        setLikeCount((prev) => Math.max(0, prev - 1));
      } else {
        await onLike(practiceLog.practiceLogId);
        setLikeCount((prev) => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <article className="feed-card">
      <div className="feed-card-header">
        <button
          className="feed-avatar"
          type="button"
          onClick={() => onProfileClick?.(practiceLog.userId)}
          aria-label="View profile"
        >
          {/* Avatar placeholder - would use username from User entity */}
          👤
        </button>

        <div className="feed-meta">
          <div className="feed-name">
            {/* Username would come from User entity - for now use userId */}
            User {practiceLog.userId.split("-").pop()}
          </div>
          <div className="feed-subtitle">
            {formatDate(practiceLog.createdAt)}
          </div>
        </div>

        <button className="feed-more" aria-label="More options" type="button">
          •••
        </button>
      </div>

      <div className="feed-card-body">
        {/* Title and Post Text */}
        <div className="feed-post-title">{practiceLog.title}</div>
        {practiceLog.postText && (
          <div className="feed-post-text">{practiceLog.postText}</div>
        )}

        {/* Practice Stats - Strava-like */}
        <div className="practice-stats">
          <div className="stat-item">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <div className="stat-label">Duration</div>
              <div className="stat-value">{formatDuration(practiceLog.durationMinutes)}</div>
            </div>
          </div>

          {practiceLog.instrument && (
            <div className="stat-item">
              <div className="stat-icon">🎵</div>
              <div className="stat-content">
                <div className="stat-label">Instrument</div>
                <div className="stat-value">{practiceLog.instrument}</div>
              </div>
            </div>
          )}

          {practiceLog.tempo && (
            <div className="stat-item">
              <div className="stat-icon">🎼</div>
              <div className="stat-content">
                <div className="stat-label">Tempo</div>
                <div className="stat-value">{practiceLog.tempo} BPM</div>
              </div>
            </div>
          )}
        </div>

        {/* Piece Information */}
        {(practiceLog.pieceTitle || practiceLog.composer) && (
          <div className="piece-info">
            {practiceLog.pieceTitle && (
              <div className="piece-title">
                <strong>Piece:</strong> {practiceLog.pieceTitle}
              </div>
            )}
            {practiceLog.composer && (
              <div className="piece-composer">
                <strong>Composer:</strong> {practiceLog.composer}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Media Placeholder - for future media attachments */}
      <div className="feed-media-placeholder" />

      <div className="feed-card-footer">
        <button
          className={`feed-action-btn ${isLiked ? "liked" : ""}`}
          type="button"
          onClick={handleLikeToggle}
        >
          {isLiked ? "❤️" : "🤍"} {likeCount > 0 ? likeCount : ""}
        </button>

        <button
          className="feed-action-btn"
          type="button"
          onClick={() => setCommentOpen((prev) => !prev)}
        >
          💬 Comment
        </button>

        <button
          className="feed-action-btn"
          type="button"
          onClick={() => onShare(practiceLog)}
        >
          🔗 Share
        </button>
      </div>

      {commentOpen && (
        <div className="comment-section">
          {/* Comments would be fetched from server */}
          <div className="comment-box">
            <input
              className="comment-input"
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleCommentSubmit();
                }
              }}
            />
            <button
              className="comment-send"
              type="button"
              onClick={handleCommentSubmit}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </article>
  );
};

export default FeedPracticeLogCard;