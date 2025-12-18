// src/services/dataService.js
const DATA_KEY = 'blog_data';

class DataService {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    const saved = localStorage.getItem(DATA_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      posts: {},
      comments: {},
      reactions: {}
    };
  }

  saveData() {
    localStorage.setItem(DATA_KEY, JSON.stringify(this.data));
  }

  // Reactions
  getReactions(postId) {
    return this.data.reactions[postId] || {
      like: 0,
      love: 0,
      smile: 0,
      think: 0,
      clap: 0
    };
  }

  addReaction(postId, reactionType) {
    if (!this.data.reactions[postId]) {
      this.data.reactions[postId] = {
        like: 0,
        love: 0,
        smile: 0,
        think: 0,
        clap: 0
      };
    }
    
    this.data.reactions[postId][reactionType] = 
      (this.data.reactions[postId][reactionType] || 0) + 1;
    
    this.saveData();
    return this.data.reactions[postId];
  }

  removeReaction(postId, reactionType) {
    if (this.data.reactions[postId] && this.data.reactions[postId][reactionType] > 0) {
      this.data.reactions[postId][reactionType]--;
      this.saveData();
    }
    return this.data.reactions[postId] || this.getReactions(postId);
  }

  // Comments
  getComments(postId) {
    return this.data.comments[postId] || [];
  }

  addComment(postId, comment) {
    if (!this.data.comments[postId]) {
      this.data.comments[postId] = [];
    }
    
    const newComment = {
      id: Date.now(),
      userId: comment.userId || 'anonymous',
      username: comment.username || 'Anonymous',
      text: comment.text,
      timestamp: new Date().toISOString(),
      likes: 0
    };
    
    this.data.comments[postId].unshift(newComment);
    this.saveData();
    
    return this.data.comments[postId];
  }

  likeComment(postId, commentId) {
    const comments = this.data.comments[postId];
    if (comments) {
      const comment = comments.find(c => c.id === commentId);
      if (comment) {
        comment.likes = (comment.likes || 0) + 1;
        this.saveData();
      }
    }
  }
}

export const dataService = new DataService();