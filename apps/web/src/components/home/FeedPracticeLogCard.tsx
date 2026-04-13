import { memo, useEffect, useState } from "react";
import type { PracticeLogWithAuthor, Media } from "@strava-musician-app/shared";
import "./index.css";
import { userService, practiceLogService } from "../../model";

type FeedPracticeLogCardProps = {
  practiceLog: PracticeLogWithAuthor;
  currentUserId?: string;
  onLike: (practiceLogId: string) => Promise<void> | void;
  onUnlike: (practiceLogId: string) => Promise<void> | void;
  onComment: (practiceLogId: string, text: string) => Promise<void> | void;
  onShare: (practiceLog: PracticeLogWithAuthor) => Promise<void> | void;
  onDelete?: (PracticeLogId: string) => Promise<void> | void;
  onEdit?: (PracticeLogId: string) => void;
  onProfileClick?: (userId: string) => void;
};

function FeedPracticeLogCard({
  practiceLog,
  currentUserId,
  onLike,
  onUnlike,
  onComment,
  onShare,
  onDelete,
  onEdit,
  onProfileClick,
}: FeedPracticeLogCardProps) {
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isLiked, setIsLiked] = useState(false); // This should come from server data eventually
  const [likeCount, setLikeCount] = useState(0); // This should come from server data eventually
  const displayName = practiceLog.author?.username ?? "User";
  const userInitial = displayName[0]?.toUpperCase() ?? "U";
  const [media, setMedia] = useState<Media[]>([]);
  // temporary for now
  const [showMenu, setShowMenu] = useState(false);
  const [comments, setComments] = useState<Array<{ text: string; username: string }>>([]);

  const isOwnPost = currentUserId === practiceLog.userId;

  useEffect(() => {
    const fetchMedia = async () => {
        try {
            const mediaList = await practiceLogService.getPracticeLogMedia(
                practiceLog.practiceLogId
            );
            setMedia(mediaList);
        } catch (error) {
            console.error("Failed to fetch media", error);
        }
    };
    fetchMedia();
  }, [practiceLog.practiceLogId]);

  useEffect(() => {
    const fetchLikesAndComments = async () => {
        try {
            const likes = await practiceLogService.getPracticeLogLikes(
                practiceLog.practiceLogId
            );
            setLikeCount(likes.length);

            if (currentUserId) {
                setIsLiked(likes.some((like) => like.userId === currentUserId));
            }

            const commentsData = await practiceLogService.getPracticeLogComments(
                practiceLog.practiceLogId
            );

            setComments(
              commentsData.map((comment) => ({
                text: comment.text,
                username: comment.author.username,
              })),
            );
        } catch (error) {
            console.error("Failed to fetch likes/comments:", error);
        }
    };
    fetchLikesAndComments();
  }, [practiceLog.practiceLogId, currentUserId]);

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
        try {
            await onComment(practiceLog.practiceLogId, commentText);
      
            // Add comment to local state immediately
            const currentUser = await userService.getCurrentUser();
            setComments((prev) => [
                ...prev,
                { text: commentText, username: currentUser?.username || "You" },
            ]);
            setCommentText("");
            // setCommentOpen(true);
        } catch (error) {
            console.error("Failed to submit comment:", error);
        }
    // await onComment(practiceLog.practiceLogId, commentText);
    // setCommentText("");
    // setCommentOpen(true);
  };

  const handleLikeToggle = async () => {
    const previousLiked = isLiked;
    const previousCount = likeCount;

    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? Math.max(0, prev-1): prev+1));

    try {
      if (isLiked) {
        await onUnlike(practiceLog.practiceLogId);
        // setLikeCount((prev) => Math.max(0, prev - 1));
      } else {
        await onLike(practiceLog.practiceLogId);
        // setLikeCount((prev) => prev + 1);
      }
    //   setIsLiked(!isLiked);
    } catch (error) {
        setIsLiked(previousLiked);
        setLikeCount(previousCount);
        console.error("Failed to toggle like:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this practice log?")) {
        setShowMenu(false);
        if (onDelete) {
            await onDelete(practiceLog.practiceLogId);
        }
    }
  };

  const handleEdit = () => {
    setShowMenu(false);
    if (onEdit) {
        onEdit(practiceLog.practiceLogId);
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
          <div className="feed-avatar-circle">
            {userInitial}
          </div>
          {/* Avatar placeholder - would use username from User entity
          👤 */}
        </button>

        <div className="feed-meta">
          <div className="feed-name">{displayName}</div>
          <div className="feed-subtitle">
            {formatDate(practiceLog.createdAt)}
          </div>
        </div>

        {isOwnPost && (
            <div className="feed-more-container">
                <button
                    className="feed-more"
                    aria-label="More options"
                    type="button"
                    onClick={() => setShowMenu(!showMenu)}
                >
                    •••
                </button>
                {showMenu && (
                <div className="feed-menu">
                    <button onClick={handleEdit} className="feed-menu-item">
                        Edit Post
                    </button>
                    <button onClick={handleDelete} className="feed-menu-item delete">
                    Delete Post
                    </button>
                </div>
                )}
            </div>
        )}

        {/* <button className="feed-more" aria-label="More options" type="button">
          •••
        </button> */}
      </div>

      <div className="feed-card-body">
        {/* Title and Post Text */}
        <div className="feed-post-title">{practiceLog.title}</div>
        {practiceLog.postText && (
          <div className="feed-post-text">{practiceLog.postText}</div>
        )}

        {isOwnPost && practiceLog.privateText && (
            <div className="feed-post-text">{practiceLog.privateText}</div>
        )}

        {/* {isOwnPost && practiceLog.privateText && (
            <div className="feed-private-notes">
              <div className="private-notes-label">🔒 Private Notes</div>
              <div className="feed-post-text">{practiceLog.privateText}</div>
            </div>
        )} */}


        {/* Practice Stats - Strava-like */}
        <div className="practice-stats">
          <div className="stat-item">
            {/* <div className="stat-icon">⏱️</div> */}
            <div className="stat-content">
              <div className="stat-label">Duration</div>
              <div className="stat-value">{formatDuration(practiceLog.durationMinutes)}</div>
            </div>
          </div>

          {practiceLog.instrument && (
            <div className="stat-item">
              {/* <div className="stat-icon">🎵</div> */}
              <div className="stat-content">
                <div className="stat-label">Instrument</div>
                <div className="stat-value">{practiceLog.instrument}</div>
              </div>
            </div>
          )}

          {practiceLog.tempo && (
            <div className="stat-item">
              {/* <div className="stat-icon">🎼</div> */}
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
      {/* <div className="feed-media-placeholder" /> */}
      {media.length > 0 && (
        <div className="feed-media">
          {media.map((m) => (
            <div key={m.mediaId} className="feed-media-item">
              {m.type === "audio" ? (
                <audio 
                    src={m.url} 
                    controls 
                    className="feed-audio-player" 
                    preload="metadata"
                >
                    Your browser does not support the audio element
                </audio>
              ) : (
                <video 
                    src={m.url} 
                    controls 
                    className="feed-video-player" 
                    preload="metadata"
                >
                    Your browser does not support the video element
                </video>
              )}
            </div>
          ))}
        </div>
      )}

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
          Comment {comments.length > 0 ? `(${comments.length})` : ""}
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
            {comments.length > 0 && (
                <div className="comments-list">
                    {comments.map((comment, idx) => (
                        <div key={idx} className="comment-item">
                            <strong>{comment.username}:</strong> {comment.text}
                        </div>
                    ))}
                </div>
            )}
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
}

export default memo(FeedPracticeLogCard);