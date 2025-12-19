// src/services/firebase.js - SIMPLIFIED VERSION
import { initializeApp } from 'firebase/app';
import { get, getDatabase, onValue, push, ref, set, update } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC0ALhw54lK_mcUvbM7X4r5yIUJUIOFIqI",
  authDomain: "myblog-35200.firebaseapp.com",
  databaseURL: "https://myblog-35200-default-rtdb.firebaseio.com",
  projectId: "myblog-35200",
  storageBucket: "myblog-35200.firebasestorage.app",
  messagingSenderId: "1010497010910",
  appId: "1:1010497010910:web:a64851ab64922b1024164f",
  measurementId: "G-VBWDYTTSVJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// User ID
// Add to src/services/firebase.js at the end
export const getUserId = () => {
  let userId = localStorage.getItem('blog_user_id');
  if (!userId) {
    userId = 'user_' + Date.now();
    localStorage.setItem('blog_user_id', userId);
  }
  return userId;
};

// ========== SIMPLE REACTION FUNCTIONS ==========
export const getReactions = async (postId) => {
  try {
    const snapshot = await get(ref(db, 'reactions/' + postId));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return {
        like: data.like || 0,
        love: data.love || 0,
        smile: data.smile || 0,
        think: data.think || 0,
        clap: data.clap || 0
      };
    }
  } catch (error) {
    console.log('No reactions found for post', postId);
  }
  return { like: 0, love: 0, smile: 0, think: 0, clap: 0 };
};

export const setReaction = async (postId, reactionType) => {
  try {
    const userId = getUserId();

    // Get current reaction
    const userReactionRef = ref(db, `userReactions/${userId}/${postId}`);
    const currentReactionSnapshot = await get(userReactionRef);
    const currentReaction = currentReactionSnapshot.exists() ? currentReactionSnapshot.val() : null;

    // Get current counts
    const reactionsRef = ref(db, `reactions/${postId}`);
    const reactionsSnapshot = await get(reactionsRef);
    const currentCounts = reactionsSnapshot.exists() ? reactionsSnapshot.val() : { like: 0, love: 0, smile: 0, think: 0, clap: 0 };

    const updates = {};

    if (currentReaction === reactionType) {
      // Remove reaction
      updates[`reactions/${postId}/${reactionType}`] = Math.max(0, (currentCounts[reactionType] || 0) - 1);
      updates[`userReactions/${userId}/${postId}`] = null;
    } else if (currentReaction) {
      // Change reaction
      updates[`reactions/${postId}/${currentReaction}`] = Math.max(0, (currentCounts[currentReaction] || 0) - 1);
      updates[`reactions/${postId}/${reactionType}`] = (currentCounts[reactionType] || 0) + 1;
      updates[`userReactions/${userId}/${postId}`] = reactionType;
    } else {
      // Add new reaction
      updates[`reactions/${postId}/${reactionType}`] = (currentCounts[reactionType] || 0) + 1;
      updates[`userReactions/${userId}/${postId}`] = reactionType;
    }

    await update(ref(db), updates);
    console.log('✅ Reaction updated:', updates);

    // Return updated reactions
    const updatedSnapshot = await get(reactionsRef);
    return updatedSnapshot.exists() ? updatedSnapshot.val() : { like: 0, love: 0, smile: 0, think: 0, clap: 0 };

  } catch (error) {
    console.error('Error setting reaction:', error);
    throw error;
  }
};

export const subscribeToReactions = (postId, callback) => {
  const reactionsRef = ref(db, `reactions/${postId}`);
  return onValue(reactionsRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback({ like: 0, love: 0, smile: 0, think: 0, clap: 0 });
    }
  });
};

// Get the current user's reaction for a post
export const getUserReaction = async (postId) => {
  try {
    const userId = getUserId();
    const snapshot = await get(ref(db, `userReactions/${userId}/${postId}`));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Error fetching user reaction:', error);
    return null;
  }
};

// ========== SIMPLE COMMENT FUNCTIONS ==========
export const getComments = async (postId) => {
  try {
    const snapshot = await get(ref(db, `comments/${postId}`));
    if (snapshot.exists()) {
      const commentsObj = snapshot.val();
      // Convert to array
      const commentsArray = Object.keys(commentsObj).map(key => ({
        id: key,
        ...commentsObj[key]
      }));

      // Sort by timestamp (newest first)
      return commentsArray.sort((a, b) =>
        new Date(b.timestamp) - new Date(a.timestamp)
      );
    }
  } catch (error) {
    console.log('No comments found for post', postId);
  }
  return [];
};

export const addComment = async (postId, commentData) => {
  try {
    console.log('📝 Adding comment to Firebase...');

    const userId = getUserId();
    const commentsRef = ref(db, `comments/${postId}`);

    // Create new comment
    const newComment = {
      userId: userId,
      username: commentData.username || 'Anonymous',
      text: commentData.text.trim(),
      timestamp: new Date().toISOString(),
      likes: 0,
      likedBy: {}
    };

    // Use push() to get a unique key
    const newCommentRef = push(commentsRef);
    const commentId = newCommentRef.key;

    console.log('Saving comment with ID:', commentId, 'Data:', newComment);

    // Save to Firebase
    await set(newCommentRef, newComment);

    console.log('✅ Comment saved successfully!');

    // Return the new comment with its ID
    return {
      id: commentId,
      ...newComment
    };

  } catch (error) {
    console.error('❌ Error saving comment:', error);
    console.error('Error details:', error.message);
    throw new Error('Failed to save comment: ' + error.message);
  }
};

export const subscribeToComments = (postId, callback) => {
  const commentsRef = ref(db, `comments/${postId}`);
  return onValue(commentsRef, (snapshot) => {
    if (snapshot.exists()) {
      const commentsObj = snapshot.val();
      const commentsArray = Object.keys(commentsObj).map(key => ({
        id: key,
        ...commentsObj[key]
      }));

      // Sort by timestamp (newest first)
      commentsArray.sort((a, b) =>
        new Date(b.timestamp) - new Date(a.timestamp)
      );

      callback(commentsArray);
    } else {
      callback([]);
    }
  });
};

// Toggle like on a comment for the current user
export const toggleCommentLike = async (postId, commentId) => {
  try {
    const userId = getUserId();
    const commentRef = ref(db, `comments/${postId}/${commentId}`);
    const snapshot = await get(commentRef);
    if (!snapshot.exists()) {
      console.warn('Comment not found for like toggle:', { postId, commentId });
      return false;
    }

    const data = snapshot.val() || {};
    const currentLikes = data.likes || 0;
    const likedBy = data.likedBy || {};
    const hasLiked = !!likedBy[userId];

    const updates = {};
    updates[`comments/${postId}/${commentId}/likes`] = hasLiked
      ? Math.max(0, currentLikes - 1)
      : currentLikes + 1;
    updates[`comments/${postId}/${commentId}/likedBy/${userId}`] = hasLiked ? null : true;

    await update(ref(db), updates);
    return !hasLiked;
  } catch (error) {
    console.error('Error toggling comment like:', error);
    throw error;
  }
};

// Check if current user liked a specific comment
export const hasUserLikedComment = async (postId, commentId) => {
  try {
    const userId = getUserId();
    const likeRef = ref(db, `comments/${postId}/${commentId}/likedBy/${userId}`);
    const snap = await get(likeRef);
    return snap.exists();
  } catch (error) {
    console.error('Error checking if user liked comment:', error);
    return false;
  }
};

// Test function
export const testFirebaseConnection = async () => {
  console.log('Testing Firebase connection...');

  try {
    // Test write
    const testRef = ref(db, 'testConnection');
    await set(testRef, {
      test: 'success',
      timestamp: new Date().toISOString()
    });
    console.log('✅ Firebase write test passed');

    // Test read
    const snapshot = await get(testRef);
    console.log('✅ Firebase read test passed:', snapshot.val());

    return true;
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    return false;
  }
};