import { createContext, useContext, useEffect, useState } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [userId] = useState(() => {
    const saved = localStorage.getItem('userId');
    if (saved) return saved;

    // Generate a unique user ID
    const newUserId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userId', newUserId);
    return newUserId;
  });

  const [userReactions, setUserReactions] = useState(() => {
    const saved = localStorage.getItem('userReactions');
    return saved ? JSON.parse(saved) : {};
  });

  const [userComments, setUserComments] = useState(() => {
    const saved = localStorage.getItem('userComments');
    return saved ? JSON.parse(saved) : {};
  });

  // Save user reactions to localStorage
  useEffect(() => {
    localStorage.setItem('userReactions', JSON.stringify(userReactions));
  }, [userReactions]);

  // Save user comments to localStorage
  useEffect(() => {
    localStorage.setItem('userComments', JSON.stringify(userComments));
  }, [userComments]);

  const addReaction = (postId, reactionType) => {
    const key = `${postId}_${reactionType}`;
    setUserReactions(prev => ({
      ...prev,
      [key]: true
    }));
  };

  const removeReaction = (postId, reactionType) => {
    const key = `${postId}_${reactionType}`;
    setUserReactions(prev => {
      const newReactions = { ...prev };
      delete newReactions[key];
      return newReactions;
    });
  };

  const hasReacted = (postId, reactionType) => {
    const key = `${postId}_${reactionType}`;
    return !!userReactions[key];
  };

  const addComment = (postId, comment) => {
    setUserComments(prev => {
      const postComments = prev[postId] || [];
      return {
        ...prev,
        [postId]: [...postComments, comment]
      };
    });
  };

  const getUserComments = (postId) => {
    return userComments[postId] || [];
  };

  return (
    <UserContext.Provider value={{
      userId,
      addReaction,
      removeReaction,
      hasReacted,
      addComment,
      getUserComments
    }}>
      {children}
    </UserContext.Provider>
  );
};