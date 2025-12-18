
const DATA_KEY = 'blog_reactions_data';

class DataService {
  constructor() {
    this.data = this.loadData();
    console.log('DataService initialized with:', this.data);
  }

  loadData() {
    try {
      const saved = localStorage.getItem(DATA_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    
    
    return {
      reactions: {},    
      userReactions: {} 
    };
  }

  saveData() {
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify(this.data));
      console.log('Data saved:', this.data);
      
      
      window.dispatchEvent(new StorageEvent('storage', {
        key: DATA_KEY,
        newValue: JSON.stringify(this.data)
      }));
      
      
      window.dispatchEvent(new CustomEvent('blog-data-updated'));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  getUserId() {
    let userId = localStorage.getItem('blog_user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 12);
      localStorage.setItem('blog_user_id', userId);
    }
    return userId;
  }

  
  getReactions(postId) {
    if (!this.data.reactions[postId]) {
      
      this.data.reactions[postId] = {
        like: 0,
        love: 0,
        smile: 0,
        think: 0,
        clap: 0
      };
    }
    return { ...this.data.reactions[postId] };
  }

  
  getUserReaction(postId) {
    const userId = this.getUserId();
    return this.data.userReactions[userId]?.[postId] || null;
  }

  
  setReaction(postId, reactionType) {
    const userId = this.getUserId();
    
    console.log(`Setting reaction: user=${userId}, post=${postId}, reaction=${reactionType}`);
    
    
    if (!this.data.userReactions[userId]) {
      this.data.userReactions[userId] = {};
    }
    
    
    if (!this.data.reactions[postId]) {
      this.data.reactions[postId] = {
        like: 0,
        love: 0,
        smile: 0,
        think: 0,
        clap: 0
      };
    }
    
    const currentUserReaction = this.data.userReactions[userId][postId];
    
    
    if (currentUserReaction === reactionType) {
      
      this.data.reactions[postId][reactionType] = Math.max(0, this.data.reactions[postId][reactionType] - 1);
      delete this.data.userReactions[userId][postId];
      console.log('Removed reaction, new count:', this.data.reactions[postId][reactionType]);
    } 
    
    else if (currentUserReaction) {
      
      this.data.reactions[postId][currentUserReaction] = Math.max(0, this.data.reactions[postId][currentUserReaction] - 1);
      
      this.data.reactions[postId][reactionType] = (this.data.reactions[postId][reactionType] || 0) + 1;
      this.data.userReactions[userId][postId] = reactionType;
      console.log('Switched reaction:', currentUserReaction, '->', reactionType);
    }
    
    else {
      
      this.data.reactions[postId][reactionType] = (this.data.reactions[postId][reactionType] || 0) + 1;
      this.data.userReactions[userId][postId] = reactionType;
      console.log('Added new reaction, new count:', this.data.reactions[postId][reactionType]);
    }
    
    
    this.saveData();
    
    return this.getReactions(postId);
  }

  
  getComments(postId) {
    if (!this.data.comments) {
      this.data.comments = {};
    }
    return this.data.comments[postId] || [];
  }

  
  addComment(postId, commentData) {
    if (!this.data.comments) {
      this.data.comments = {};
    }
    if (!this.data.comments[postId]) {
      this.data.comments[postId] = [];
    }
    
    const comment = {
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      userId: this.getUserId(),
      username: commentData.username || 'Anonymous',
      text: commentData.text,
      timestamp: new Date().toISOString(),
      likes: 0,
      likedBy: []
    };
    
    this.data.comments[postId].unshift(comment);
    this.saveData();
    
    return this.data.comments[postId];
  }

  
  toggleCommentLike(postId, commentId) {
    if (!this.data.comments || !this.data.comments[postId]) return;
    
    const comment = this.data.comments[postId].find(c => c.id === commentId);
    if (!comment) return;
    
    const userId = this.getUserId();
    
    
    if (!comment.likedBy) {
      comment.likedBy = [];
    }
    
    const userIndex = comment.likedBy.indexOf(userId);
    
    if (userIndex > -1) {
      
      comment.likedBy.splice(userIndex, 1);
      comment.likes = Math.max(0, comment.likes - 1);
    } else {
      
      comment.likedBy.push(userId);
      comment.likes = (comment.likes || 0) + 1;
    }
    
    this.saveData();
  }

  
  hasUserLikedComment(postId, commentId) {
    if (!this.data.comments || !this.data.comments[postId]) return false;
    
    const comment = this.data.comments[postId].find(c => c.id === commentId);
    if (!comment || !comment.likedBy) return false;
    
    const userId = this.getUserId();
    return comment.likedBy.includes(userId);
  }

  
  subscribe(callback) {
    const handler = () => {
      console.log('Data changed, updating...');
      this.data = this.loadData();
      callback(this.data);
    };
    
    
    window.addEventListener('storage', (event) => {
      if (event.key === DATA_KEY) {
        handler();
      }
    });
    
    
    window.addEventListener('blog-data-updated', handler);
    
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('blog-data-updated', handler);
    };
  }
}

export const dataService = new DataService();