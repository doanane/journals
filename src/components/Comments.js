// src/components/Comments.js
import React, { useState, useEffect, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { useUser } from '../context/UserContext';
import { dataService } from '../services/dataService';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import './Comments.css';

function Comments({ postId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { userId, addComment, getUserComments } = useUser();

  const loadComments = useCallback(() => {
    // Get comments from data service
    const serviceComments = dataService.getComments(postId);
    
    // Get user's saved comments
    const userComments = getUserComments(postId) || [];
    
    // Combine and deduplicate comments
    const allComments = [...serviceComments, ...userComments].filter((comment, index, self) =>
      index === self.findIndex(c => c.id === comment.id)
    );
    
    // Sort by timestamp (newest first)
    allComments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    setComments(allComments);
  }, [postId, getUserComments]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setSubmitting(true);
    
    try {
      const commentData = {
        text: newComment.trim(),
        username: username.trim() || 'Anonymous',
        userId
      };
      
      // Add to data service (persistent storage)
      dataService.addComment(postId, commentData);
      
      // Add to user context (session storage)
      addComment(postId, {
        ...commentData,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        likes: 0
      });
      
      // Clear form
      setNewComment('');
      setUsername('');
      
      // Reload comments
      loadComments();
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = (commentId) => {
    dataService.likeComment(postId, commentId);
    loadComments();
  };

  const formatTime = (timestamp) => {
    const date = parseISO(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now - date) / 36e5;
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return format(date, 'MMM dd, yyyy');
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
          comments.map(comment => (
            <div key={comment.id} className="comment-card">
              <div className="comment-header">
                <div className="comment-user">
                  <div className="comment-avatar">
                    {comment.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
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
                  className="comment-like-btn"
                  title="Like this comment"
                >
                  <ThumbUpIcon className="like-icon" />
                  <span className="like-count">{comment.likes || 0}</span>
                </button>
              </div>
              
              <div className="comment-content">
                {comment.text}
              </div>
              
              {comment.userId === userId && (
                <div className="comment-badge">
                  You
                </div>
              )}
            </div>
          ))
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