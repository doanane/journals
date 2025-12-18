import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import blogPosts from '../data/blogPosts';
import BackButton from './BackButton';
import ReactionButtons from './ReactionButtons';
import Comments from './Comments';
import './BlogPost.css';

function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const foundPost = blogPosts.find(p => p.id === parseInt(id));
      if (foundPost) {
        setPost(foundPost);
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [id]);

  if (loading || !post) {
    return (
      <div className="loading-post">
        <div className="loading-content">
          <div className="loading-title"></div>
          <div className="loading-meta"></div>
          <div className="loading-text"></div>
          <div className="loading-text"></div>
          <div className="loading-text short"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-post-page">
      <div className="post-navigation">
        <BackButton />
      </div>
      
      <article className="post-container">
        <div className="post-header">
          <div className="post-meta">
            <time dateTime={post.date} className="post-date">
              {format(parseISO(post.date), 'MM/dd/yyyy')}
            </time>
            <span className="post-read-time">• {post.readTime}</span>
          </div>
          <h1 className="post-title">{post.title}</h1>
        </div>
        
        <div className="post-content">
          {post.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="content-paragraph">
              {paragraph}
            </p>
          ))}
        </div>
        
        <div className="post-tags">
          {post.tags.map(tag => (
            <span key={tag} className="post-tag">#{tag}</span>
          ))}
        </div>
        
        <ReactionButtons postId={post.id} />
        
        <Comments postId={post.id} />
      </article>
    </div>
  );
}

export default BlogPost;