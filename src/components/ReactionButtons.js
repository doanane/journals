// src/components/ReactionButtons.js
import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { dataService } from '../services/dataService';
import './ReactionButtons.css';

function ReactionButtons({ postId }) {
  const { addReaction: addUserReaction, removeReaction: removeUserReaction, hasReacted } = useUser();
  const [reactions, setReactions] = useState(() => dataService.getReactions(postId));
  const [loading, setLoading] = useState(false);

  const reactionTypes = [
    { id: 'like', emoji: '👍', label: 'Like' },
    { id: 'love', emoji: '❤️', label: 'Love' },
    { id: 'smile', emoji: '😊', label: 'Smile' },
    { id: 'think', emoji: '🤔', label: 'Think' },
    { id: 'clap', emoji: '👏', label: 'Clap' }
  ];

  const handleReaction = async (reactionId) => {
    if (loading) return;
    
    setLoading(true);
    
    const hasUserReacted = hasReacted(postId, reactionId);
    
    try {
      if (hasUserReacted) {
        // Remove reaction
        removeUserReaction(postId, reactionId);
        const updatedReactions = dataService.removeReaction(postId, reactionId);
        setReactions(updatedReactions);
      } else {
        // Add reaction
        addUserReaction(postId, reactionId);
        const updatedReactions = dataService.addReaction(postId, reactionId);
        setReactions(updatedReactions);
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reactions-container">
      <div className="reactions-title">What did you think about this story?</div>
      <div className="reactions-buttons">
        {reactionTypes.map(reaction => {
          const hasUserReacted = hasReacted(postId, reaction.id);
          const count = reactions[reaction.id] || 0;
          
          return (
            <button
              key={reaction.id}
              className={`reaction-btn ${hasUserReacted ? 'active' : ''} ${loading ? 'disabled' : ''}`}
              onClick={() => handleReaction(reaction.id)}
              title={reaction.label}
              aria-label={`${reaction.label} (${count})`}
              disabled={loading}
            >
              <span className="reaction-emoji">{reaction.emoji}</span>
              <span className="reaction-count">{count}</span>
            </button>
          );
        })}
      </div>
      <div className="reactions-hint">
        Click to add your reaction. You can only react once per emotion.
      </div>
    </div>
  );
}

export default ReactionButtons;