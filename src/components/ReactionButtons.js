// src/components/ReactionButtons.js
import React, { useState, useEffect } from 'react';
import { getReactions, setReaction, subscribeToReactions, getUserReaction } from '../services/firebase';
import './ReactionButtons.css';

function ReactionButtons({ postId }) {
  const [reactions, setReactions] = useState({ like: 0, love: 0, smile: 0, think: 0, clap: 0 });
  const [userReaction, setUserReaction] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load initial data
    const loadData = async () => {
      const [reactionsData, userReactionData] = await Promise.all([
        getReactions(postId),
        getUserReaction(postId)
      ]);
      setReactions(reactionsData);
      setUserReaction(userReactionData);
    };

    loadData();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToReactions(postId, (newReactions) => {
      setReactions(newReactions);
    });

    return unsubscribe;
  }, [postId]);

  const reactionTypes = [
    { id: 'like', emoji: '👍', label: 'Like' },
    { id: 'love', emoji: '❤️', label: 'Love' },
    { id: 'smile', emoji: '😊', label: 'Smile' },
    { id: 'think', emoji: '🤔', label: 'Think' },
    { id: 'clap', emoji: '👏', label: 'Clap' }
  ];

  const handleReaction = async (reactionType) => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      const updatedReactions = await setReaction(postId, reactionType);
      const newUserReaction = await getUserReaction(postId);
      
      setReactions(updatedReactions);
      setUserReaction(newUserReaction);
    } catch (error) {
      console.error('Error updating reaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);

  return (
    <div className="reactions-container">
      <div className="reactions-header">
        <div className="reactions-title">How did this story make you feel?</div>
        {totalReactions > 0 && (
          <div className="total-reactions">
            {totalReactions} {totalReactions === 1 ? 'reaction' : 'reactions'}
          </div>
        )}
      </div>
      
      <div className="reactions-buttons">
        {reactionTypes.map(reaction => {
          const count = reactions[reaction.id] || 0;
          const isActive = userReaction === reaction.id;
          
          return (
            <button
              key={reaction.id}
              className={`reaction-btn ${isActive ? 'active' : ''} ${loading ? 'disabled' : ''}`}
              onClick={() => handleReaction(reaction.id)}
              disabled={loading}
              title={`${reaction.label} (${count})`}
            >
              <span className="reaction-emoji">{reaction.emoji}</span>
              <span className="reaction-count">{count}</span>
            </button>
          );
        })}
      </div>
      
      <div className="reactions-hint">
        {userReaction 
          ? `You reacted with "${userReaction}"` 
          : 'Click to add your reaction'}
      </div>
    </div>
  );
}

export default ReactionButtons;