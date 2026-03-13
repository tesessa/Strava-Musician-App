import { useState } from "react";
import type { FeedPost } from "@strava-musician-app/shared";
import "../../index.css";

type FeedPostCardProps = {
  post: FeedPost;
  onLike: (postId: string) => Promise<void> | void;
  onComment: (postId: string, text: string) => Promise<void> | void;
  onShare: (postId: string) => Promise<void> | void;
  onProfileClick?: (userId?: string) => void;
};

const FeedPostCard = ({
  post,
  onLike,
  onComment,
  onShare,
  onProfileClick,
}: FeedPostCardProps) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState("");

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    await onComment(post.id, commentText);
    setCommentText("");
    setCommentOpen(true);
  };

  return (
    <article className="feed-card">
      <div className="feed-card-header">
        <button
          className="feed-avatar"
          type="button"
          onClick={() => onProfileClick?.(post.userId)}
          aria-label="Open profile"
        >
          {post.name[0]}
        </button>

        <div className="feed-meta">
          <div className="feed-name">{post.name}</div>
          <div className="feed-subtitle">
            {new Date(post.createdAt).toLocaleString()}
          </div>
        </div>

        <button className="feed-more" aria-label="More options" type="button">
          •••
        </button>
      </div>

      <div className="feed-card-body">
        <div className="feed-post-title">{post.title}</div>
        <div className="feed-post-details">{post.details}</div>
        <div className="feed-instrument-tag">Instrument: {post.instrument}</div>
      </div>

      <div className="feed-media-placeholder" />

      <div className="feed-card-footer">
        <button
          className="feed-action-btn"
          type="button"
          onClick={() => onLike(post.id)}
        >
          {post.likedByMe ? "Unlike" : "Like"}
          {typeof post.likeCount === "number" ? ` (${post.likeCount})` : ""}
        </button>

        <button
          className="feed-action-btn"
          type="button"
          onClick={() => setCommentOpen((prev) => !prev)}
        >
          Comment
          {typeof post.commentCount === "number"
            ? ` (${post.commentCount})`
            : ""}
        </button>

        <button
          className="feed-action-btn"
          type="button"
          onClick={() => onShare(post.id)}
        >
          Share
        </button>
      </div>

      {commentOpen && (
        <div className="comment-section">
          {post.comments && post.comments.length > 0 && (
            <div className="comment-list">
              {post.comments.map((comment) => (
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

export default FeedPostCard;