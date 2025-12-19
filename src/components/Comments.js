// src/components/Comments.js - COMPLETE NEW FILE
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { format, parseISO } from 'date-fns';
import { useEffect, useState } from 'react';
import { addComment, getComments, getUserId, hasUserLikedComment, subscribeToComments, toggleCommentLike } from '../services/firebase';
import './Comments.css';

function Comments({ postId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentLikes, setCommentLikes] = useState({});

  useEffect(() => {
    // Load initial comments and like status
    const loadComments = async () => {
      const commentsData = await getComments(postId);
      setComments(commentsData);

      // Check like status for each comment
      const likeStatus = {};
      for (const comment of commentsData) {
        const hasLiked = await hasUserLikedComment(postId, comment.id);
        likeStatus[comment.id] = hasLiked;
      }
      setCommentLikes(likeStatus);
    };

    loadComments();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToComments(postId, async (newComments) => {
      setComments(newComments);

      // Update like status for new comments
      const likeStatus = {};
      for (const comment of newComments) {
        const hasLiked = await hasUserLikedComment(postId, comment.id);
        likeStatus[comment.id] = hasLiked;
      }
      setCommentLikes(likeStatus);
    });

    return unsubscribe;
  }, [postId]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);

    try {
      await addComment(postId, {
        text: newComment.trim(),
        username: username.trim() || 'Anonymous'
      });

      // Clear form
      setNewComment('');
      setUsername('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const newLikeState = await toggleCommentLike(postId, commentId);

      // Update local state immediately
      setComments(prevComments =>
        prevComments.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likes: newLikeState ? comment.likes + 1 : Math.max(0, comment.likes - 1)
            };
          }
          return comment;
        })
      );

      setCommentLikes(prev => ({
        ...prev,
        [commentId]: newLikeState
      }));
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const formatTime = (timestamp) => {
    try {
      const date = parseISO(timestamp);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      return 'Recently';
    }
  };

  return (
    <div className="comments-section" id="comments">
      <h3 className="comments-title">
        Comments ({comments.length})
      </h3>

      <form onSubmit={handleSubmitComment} className="comment-form">
        <div className="comment-input-group">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your name (optional)"
            className="comment-name-input"
            maxLength="50"
            disabled={submitting}
          />
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts about this story..."
            className="comment-text-input"
            rows="3"
            required
            maxLength="1000"
            disabled={submitting}
          />
        </div>
        <div className="comment-form-footer">
          <div className="comment-hint">
            {submitting ? 'Posting your comment...' : 'Share your perspective. Be kind and thoughtful.'}
          </div>
          <button
            type="submit"
            className="comment-submit-btn"
            disabled={submitting || !newComment.trim()}
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      <div className="comments-list">
        {comments.length > 0 ? (
          comments.map(comment => {
            const userLiked = commentLikes[comment.id] || false;
            const currentUserId = getUserId();
            const isCurrentUser = comment.userId === currentUserId;

            return (
              <div key={comment.id} className="comment-card">
                <div className="comment-header">
                  <div className="comment-user-info">
                    <div className="comment-avatar">
                      {comment.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="comment-user-details">
                      <div className="comment-username">
                        {comment.username}
                        {isCurrentUser && <span className="you-badge"> (You)</span>}
                      </div>
                      <time className="comment-time">
                        {formatTime(comment.timestamp)}
                      </time>
                    </div>
                  </div>

                  <button
                    onClick={() => handleLikeComment(comment.id)}
                    className={`comment-like-btn ${userLiked ? 'liked' : ''}`}
                    title={userLiked ? 'Unlike this comment' : 'Like this comment'}
                    disabled={submitting}
                  >
                    <ThumbUpIcon className="like-icon" />
                    <span className="like-count">{comment.likes || 0}</span>
                  </button>
                </div>

                <div className="comment-content">
                  {comment.text}
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-comments">
            <p className="no-comments-text">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Comments;