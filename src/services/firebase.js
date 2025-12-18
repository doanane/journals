// src/services/firebase.js - UPDATE THIS FILE
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set, update, onValue } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Get or create user ID
const getUserId = () => {
  let userId = localStorage.getItem('blog_user_id');
  if (!userId) {
    userId = 'user_' + Date.now();
    localStorage.setItem('blog_user_id', userId);
  }
  return userId;
};

// Reactions functions (keep existing)
export const getReactions = async (postId) => {
  try {
    const snapshot = await get(ref(database, `reactions/${postId}`));
    if (snapshot.exists()) {
      return snapshot.val();
    }
  } catch (error) {
    console.error('Error getting reactions:', error);
  }
  return { like: 0, love: 0, smile: 0, think: 0, clap: 0 };
};

export const getUserReaction = async (postId) => {
  try {
    const userId = getUserId();
    const snapshot = await get(ref(database, `userReactions/${userId}/${postId}`));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Error getting user reaction:', error);
    return null;
  }
};

export const setReaction = async (postId, reactionType) => {
  try {
    const userId = getUserId();
    const currentReaction = await getUserReaction(postId);
    const currentReactions = await getReactions(postId);
    
    const updates = {};
    
    if (currentReaction === reactionType) {
      // Remove reaction
      updates[`reactions/${postId}/${reactionType}`] = Math.max(0, (currentReactions[reactionType] || 0) - 1);
      updates[`userReactions/${userId}/${postId}`] = null;
    } else if (currentReaction) {
      // Change reaction
      updates[`reactions/${postId}/${currentReaction}`] = Math.max(0, (currentReactions[currentReaction] || 0) - 1);
      updates[`reactions/${postId}/${reactionType}`] = (currentReactions[reactionType] || 0) + 1;
      updates[`userReactions/${userId}/${postId}`] = reactionType;
    } else {
      // Add new reaction
      updates[`reactions/${postId}/${reactionType}`] = (currentReactions[reactionType] || 0) + 1;
      updates[`userReactions/${userId}/${postId}`] = reactionType;
    }
    
    await update(ref(database), updates);
    return await getReactions(postId);
  } catch (error) {
    console.error('Error setting reaction:', error);
    throw error;
  }
};

export const subscribeToReactions = (postId, callback) => {
  const reactionsRef = ref(database, `reactions/${postId}`);
  return onValue(reactionsRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback({ like: 0, love: 0, smile: 0, think: 0, clap: 0 });
    }
  });
};

// Comments functions - UPDATED
export const getComments = async (postId) => {
  try {
    const snapshot = await get(ref(database, `comments/${postId}`));
    if (snapshot.exists()) {
      const comments = snapshot.val();
      // Convert object to array and sort by timestamp (newest first)
      const commentsArray = Object.keys(comments).map(key => ({
        id: key,
        ...comments[key],
        // Ensure likedBy exists
        likedBy: comments[key].likedBy || {}
      }));
      
      return commentsArray.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );
    }
  } catch (error) {
    console.error('Error getting comments:', error);
  }
  return [];
};

export const addComment = async (postId, commentData) => {
  try {
    const userId = getUserId();
    const commentsRef = ref(database, `comments/${postId}`);
    const newCommentRef = ref(commentsRef, Date.now().toString());
    
    const comment = {
      userId: userId,
      username: commentData.username || 'Anonymous',
      text: commentData.text,
      timestamp: new Date().toISOString(),
      likes: 0,
      likedBy: {} // Initialize empty likedBy object
    };
    
    await set(newCommentRef, comment);
    console.log('✅ Comment added to Firebase');
    return await getComments(postId);
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const toggleCommentLike = async (postId, commentId) => {
  try {
    const userId = getUserId();
    const commentRef = ref(database, `comments/${postId}/${commentId}`);
    const snapshot = await get(commentRef);
    
    if (!snapshot.exists()) {
      console.log('Comment not found');
      return;
    }
    
    const comment = snapshot.val();
    const likedBy = comment.likedBy || {};
    const hasLiked = likedBy[userId];
    
    const updates = {};
    
    if (hasLiked) {
      // Unlike
      updates[`comments/${postId}/${commentId}/likes`] = Math.max(0, (comment.likes || 0) - 1);
      updates[`comments/${postId}/${commentId}/likedBy/${userId}`] = null;
    } else {
      // Like
      updates[`comments/${postId}/${commentId}/likes`] = (comment.likes || 0) + 1;
      updates[`comments/${postId}/${commentId}/likedBy/${userId}`] = true;
    }
    
    await update(ref(database), updates);
    console.log('✅ Comment like toggled');
    return !hasLiked; // Return new like state
  } catch (error) {
    console.error('Error toggling comment like:', error);
    throw error;
  }
};

export const hasUserLikedComment = async (postId, commentId) => {
  try {
    const userId = getUserId();
    const snapshot = await get(ref(database, `comments/${postId}/${commentId}/likedBy/${userId}`));
    return snapshot.exists();
  } catch (error) {
    console.error('Error checking comment like:', error);
    return false;
  }
};

export const subscribeToComments = (postId, callback) => {
  const commentsRef = ref(database, `comments/${postId}`);
  return onValue(commentsRef, (snapshot) => {
    if (snapshot.exists()) {
      const comments = snapshot.val();
      // Convert object to array and sort by timestamp
      const commentsArray = Object.keys(comments).map(key => ({
        id: key,
        ...comments[key],
        likedBy: comments[key].likedBy || {}
      }));
      
      commentsArray.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );
      
      callback(commentsArray);
    } else {
      callback([]);
    }
  });
};

// Test function
export const testFirebase = async () => {
  console.log('Testing Firebase connection...');
  try {
    const testReaction = await setReaction('test', 'like');
    console.log('Firebase test successful:', testReaction);
    return true;
  } catch (error) {
    console.error('Firebase test failed:', error);
    return false;
  }
};