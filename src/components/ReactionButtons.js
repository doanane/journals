import React, { useState, useEffect, useCallback } from 'react';
import { dataService } from '../services/dataService';
import './ReactionButtons.css';

function ReactionButtons({ postId }) {
  const [reactions, setReactions] = useState(() => dataService.getReactions(postId));
  const [loading, setLoading] = useState(false);
  const [userReaction, setUserReaction] = useState(() => dataService.getUserReaction(postId));

  
  const updateReactionState = useCallback(() => {
    console.log('Updating reaction state for post:', postId);
    const currentReactions = dataService.getReactions(postId);
    console.log('Current reactions:', currentReactions);
    setReactions(currentReactions);
    
    const userReactionType = dataService.getUserReaction(postId);
    console.log('User reaction:', userReactionType);
    setUserReaction(userReactionType);
  }, [postId]);

  useEffect(() => {
    
    updateReactionState();
    
    
    const unsubscribe = dataService.subscribe(updateReactionState);
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [updateReactionState]);

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
    console.log('Handling reaction:', reactionType, 'for post:', postId);
    
    try {
      
      const beforeReaction = { ...reactions };
      const beforeUserReaction = userReaction;
      
      console.log('Before - Reactions:', beforeReaction, 'User reaction:', beforeUserReaction);
      
      
      const updatedReactions = dataService.setReaction(postId, reactionType);
      console.log('After - Updated reactions:', updatedReactions);
      
      
      setReactions(updatedReactions);
      setUserReaction(dataService.getUserReaction(postId));
      
      
      setTimeout(() => {
        updateReactionState(); 
      }, 100);
      
    } catch (error) {
      console.error('Error updating reaction:', error);
    } finally {
      setTimeout(() => setLoading(false), 300); 
    }
  };

  
  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);

  return (
    <div className="reactions-container">
      <div className="reactions-header">
        <div className="reactions-title">How did this story make you feel?</div>
        {totalReactions > 0 && (
          <div className="total-reactions">
            {totalReactions} total reaction{totalReactions !== 1 ? 's' : ''}
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
              title={`${reaction.label} - ${count} ${count === 1 ? 'person' : 'people'}`}
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
        {userReaction 
          ? `You reacted with "${userReaction}". Click to change or remove.` 
          : 'Click an emoji to react. One reaction per story.'}
      </div>
    </div>
  );
}

export default ReactionButtons;