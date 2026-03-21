import { useState } from "react";
import type { FeedPracticeLog } from "@strava-musician-app/shared";
import "../../index.css";

type FeedPracticeLogCardProps = {
  practiceLog: FeedPracticeLog;
  onLike: (practiceLogId: string) => Promise<void> | void;
  onComment: (practiceLogId: string, text: string) => Promise<void> | void;
  onShare: (practiceLog: FeedPracticeLog) => Promise<void> | void;
  onProfileClick?: (userId?: string) => void;
};

const FeedPracticeLogCard = ({
  practiceLog,
  onLike,
  onComment,
  onShare,
  onProfileClick,
}: FeedPracticeLogCardProps) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState("");

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    await onComment(practiceLog.practiceLogId, commentText);
    setCommentText("");
    setCommentOpen(true);
  };

  return (
    <article className="feed-card">
      <div className="feed-card-header">
        <button
          className="feed-avatar"
          type="button"
          onClick={() => onProfileClick?.(practiceLog.userId)}
          aria-label="Open profile"
        >
          {practiceLog.name[0]}
        </button>

        <div className="feed-meta">
          <div className="feed-name">{practiceLog.name}</div>
          <div className="feed-subtitle">
            {new Date(practiceLog.createdAt).toLocaleString()}
          </div>
        </div>

        <button className="feed-more" aria-label="More options" type="button">
          •••
        </button>
      </div>

      <div className="feed-card-body">
        <div className="feed-post-title">{practiceLog.title}</div>
        <div className="feed-post-details">{practiceLog.details}</div>
        <div className="feed-instrument-tag">Instrument: {practiceLog.instrument}</div>
      </div>

      <div className="feed-media-placeholder" />

      <div className="feed-card-footer">
        <button
          className="feed-action-btn"
          type="button"
          onClick={() => onLike(practiceLog.practiceLogId)}
        >
          {practiceLog.likedByMe ? "Unlike" : "Like"}
          {typeof practiceLog.likeCount === "number" ? ` (${practiceLog.likeCount})` : ""}
        </button>

        <button
          className="feed-action-btn"
          type="button"
          onClick={() => setCommentOpen((prev) => !prev)}
        >
          Comment
          {typeof practiceLog.commentCount === "number"
            ? ` (${practiceLog.commentCount})`
            : ""}
        </button>

        <button
          className="feed-action-btn"
          type="button"
          onClick={() => onShare(practiceLog)}
        >
          Share
        </button>
      </div>

      {commentOpen && (
        <div className="comment-section">
          {practiceLog.comments && practiceLog.comments.length > 0 && (
            <div className="comment-list">
              {practiceLog.comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-author">{comment.authorName}</div>
                  <div className="comment-text">{comment.text}</div>
                </div>
              ))}
            </div>
          )}

          <div className="comment-box">
            <input
              className="comment-input"
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
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
