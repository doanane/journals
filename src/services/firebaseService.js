
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, child, update, onValue, push, remove } from 'firebase/database';


const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};


const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

class FirebaseService {
  constructor() {
    this.userId = this.getUserId();
    console.log('Firebase initialized for user:', this.userId);
  }

  getUserId() {
    let userId = localStorage.getItem('blog_user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 12);
      localStorage.setItem('blog_user_id', userId);
    }
    return userId;
  }

  
  async getReactions(postId) {
    try {
      const snapshot = await get(ref(database, `reactions/${postId}`));
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
      console.error('Error getting reactions:', error);
    }
    
    return {
      like: 0,
      love: 0,
      smile: 0,
      think: 0,
      clap: 0
    };
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
      return await this.getReactions(postId);
    } catch (error) {
      console.error('Error setting reaction:', error);
      throw error;
    }
  }

  subscribeToReactions(postId, callback) {
    const reactionsRef = ref(database, `reactions/${postId}`);
    
    const unsubscribe = onValue(reactionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        callback({
          like: data.like || 0,
          love: data.love || 0,
          smile: data.smile || 0,
          think: data.think || 0,
          clap: data.clap || 0
        });
      } else {
        callback({
          like: 0,
          love: 0,
          smile: 0,
          think: 0,
          clap: 0
        });
      }
    }, (error) => {
      console.error('Error subscribing to reactions:', error);
    });
    
    return unsubscribe;
  }

  
  async getComments(postId) {
    try {
      const snapshot = await get(ref(database, `comments/${postId}`));
      if (snapshot.exists()) {
        const commentsObj = snapshot.val();
        const commentsArray = Object.keys(commentsObj).map(key => ({
          id: key,
          ...commentsObj[key]
        }));
        
        return commentsArray.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );
      }
    } catch (error) {
      console.error('Error getting comments:', error);
    }
    
    return [];
  }

  async addComment(postId, commentData) {
    try {
      const commentsRef = ref(database, `comments/${postId}`);
      const newCommentRef = push(commentsRef);
      
      const comment = {
        userId: this.userId,
        username: commentData.username || 'Anonymous',
        text: commentData.text,
        timestamp: new Date().toISOString(),
        likes: 0,
        likedBy: {}
      };
      
      await set(newCommentRef, comment);
      return await this.getComments(postId);
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  async toggleCommentLike(postId, commentId) {
    try {
      const commentRef = ref(database, `comments/${postId}/${commentId}`);
      const snapshot = await get(commentRef);
      
      if (!snapshot.exists()) return;
      
      const comment = snapshot.val();
      const likedBy = comment.likedBy || {};
      const hasLiked = likedBy[this.userId];
      
      const updates = {};
      
      if (hasLiked) {
        
        updates[`comments/${postId}/${commentId}/likes`] = Math.max(0, (comment.likes || 0) - 1);
        updates[`comments/${postId}/${commentId}/likedBy/${this.userId}`] = null;
      } else {
        
        updates[`comments/${postId}/${commentId}/likes`] = (comment.likes || 0) + 1;
        updates[`comments/${postId}/${commentId}/likedBy/${this.userId}`] = true;
      }
      
      await update(ref(database), updates);
    } catch (error) {
      console.error('Error toggling comment like:', error);
      throw error;
    }
  }

  async hasUserLikedComment(postId, commentId) {
    try {
      const snapshot = await get(ref(database, `comments/${postId}/${commentId}/likedBy/${this.userId}`));
      return snapshot.exists();
    } catch (error) {
      console.error('Error checking comment like:', error);
      return false;
    }
  }

  subscribeToComments(postId, callback) {
    const commentsRef = ref(database, `comments/${postId}`);
    
    const unsubscribe = onValue(commentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const commentsObj = snapshot.val();
        const commentsArray = Object.keys(commentsObj).map(key => ({
          id: key,
          ...commentsObj[key]
        }));
        
        commentsArray.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );
        
        callback(commentsArray);
      } else {
        callback([]);
      }
    }, (error) => {
      console.error('Error subscribing to comments:', error);
    });
    
    return unsubscribe;
  }

  
  getReactionStats(postId) {
    return this.getReactions(postId);
  }

  getCommentStats(postId) {
    return this.getComments(postId);
  }
}

export const firebaseService = new FirebaseService();