
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, update, onValue, push } from 'firebase/database';


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


const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

class FirebaseService {
  constructor() {
    this.userId = this.getUserId();
    console.log('🔥 Firebase initialized! User:', this.userId);
  }

  getUserId() {
    let userId = localStorage.getItem('firebase_user_id');
    if (!userId) {
      userId = 'user_' + Date.now();
      localStorage.setItem('firebase_user_id', userId);
    }
    return userId;
  }

  
  async getReactions(postId) {
    try {
      const snapshot = await get(ref(database, 'reactions/' + postId));
      if (snapshot.exists()) {
        return snapshot.val();
      }
    } catch (error) {
      console.error('Error getting reactions:', error);
    }
    return { like: 0, love: 0, smile: 0, think: 0, clap: 0 };
  }

  async getUserReaction(postId) {
    try {
      const snapshot = await get(ref(database, `userReactions/${this.userId}/${postId}`));
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Error getting user reaction:', error);
      return null;
    }
  }

  async setReaction(postId, reactionType) {
    try {
      const currentReaction = await this.getUserReaction(postId);
      const currentReactions = await this.getReactions(postId);
      
      const updates = {};
      
      if (currentReaction === reactionType) {
        
        updates[`reactions/${postId}/${reactionType}`] = Math.max(0, (currentReactions[reactionType] || 0) - 1);
        updates[`userReactions/${this.userId}/${postId}`] = null;
      } else if (currentReaction) {
        
        updates[`reactions/${postId}/${currentReaction}`] = Math.max(0, (currentReactions[currentReaction] || 0) - 1);
        updates[`reactions/${postId}/${reactionType}`] = (currentReactions[reactionType] || 0) + 1;
        updates[`userReactions/${this.userId}/${postId}`] = reactionType;
      } else {
        
        updates[`reactions/${postId}/${reactionType}`] = (currentReactions[reactionType] || 0) + 1;
        updates[`userReactions/${this.userId}/${postId}`] = reactionType;
      }
      
      await update(ref(database), updates);
      console.log('✅ Reaction updated:', updates);
      return this.getReactions(postId);
    } catch (error) {
      console.error('Error setting reaction:', error);
      throw error;
    }
  }

  subscribeToReactions(postId, callback) {
    const reactionsRef = ref(database, 'reactions/' + postId);
    
    return onValue(reactionsRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        callback({ like: 0, love: 0, smile: 0, think: 0, clap: 0 });
      }
    });
  }

  
  async getComments(postId) {
    try {
      const snapshot = await get(ref(database, 'comments/' + postId));
      if (snapshot.exists()) {
        const comments = snapshot.val();
        return Object.keys(comments).map(key => ({
          id: key,
          ...comments[key]
        }));
      }
    } catch (error) {
      console.error('Error getting comments:', error);
    }
    return [];
  }

  async addComment(postId, commentData) {
    try {
      const commentsRef = ref(database, 'comments/' + postId);
      const newCommentRef = push(commentsRef);
      
      const comment = {
        userId: this.userId,
        username: commentData.username || 'Anonymous',
        text: commentData.text,
        timestamp: new Date().toISOString(),
        likes: 0
      };
      
      await set(newCommentRef, comment);
      console.log('✅ Comment added');
      return this.getComments(postId);
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  subscribeToComments(postId, callback) {
    const commentsRef = ref(database, 'comments/' + postId);
    
    return onValue(commentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const comments = snapshot.val();
        const commentsArray = Object.keys(comments).map(key => ({
          id: key,
          ...comments[key]
        }));
        callback(commentsArray);
      } else {
        callback([]);
      }
    });
  }
}

export const firebaseService = new FirebaseService();