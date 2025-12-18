import React, { useState, useEffect, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { dataService } from '../services/dataService';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import './Comments.css';

function Comments({ postId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadComments = useCallback(() => {
    const loadedComments = dataService.getComments(postId);
    console.log('Loaded comments:', loadedComments);
    setComments(loadedComments);
  }, [postId]);

  useEffect(() => {
    loadComments();
    
    const unsubscribe = dataService.subscribe(loadComments);
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [loadComments]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setSubmitting(true);
    
    try {
      console.log('Submitting comment for post:', postId);
      dataService.addComment(postId, {
        text: newComment.trim(),
        username: username.trim() || 'Anonymous'
      });
      
      setNewComment('');
      setUsername('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = (commentId) => {
    console.log('Liking comment:', commentId);
    dataService.toggleCommentLike(postId, commentId);
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

  const hasUserLikedComment = (commentId) => {
    return dataService.hasUserLikedComment(postId, commentId);
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
          />
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts about this story..."
            className="comment-text-input"
            rows="3"
            required
            maxLength="1000"
          />
        </div>
        <div className="comment-form-footer">
          <div className="comment-hint">
            Share your perspective. Be kind and thoughtful.
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
            const userLiked = hasUserLikedComment(comment.id);
            
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
                  >
                    <ThumbUpIcon className="like-icon" />
                    <span className="like-count">{comment.likes || 0}</span>
                  </button>
                </div>
                
                <div className="comment-content">
                  {comment.text}
                </div>
                
                {comment.userId === dataService.getUserId() && (
                  <div className="comment-badge">
                    You
                  </div>
                )}
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