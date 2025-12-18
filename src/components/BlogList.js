import React from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import './BlogList.css';

function BlogList({ posts }) {
  return (
    <div className="blog-list">
      <div className="back-link">
        <Link to="/" className="back-link-text">← Back to all journals</Link>
      </div>
      
      {posts.map(post => (
        <article key={post.id} className="blog-card">
          <Link to={`/post/${post.id}`} className="post-link">
            <div className="post-meta">
              <time dateTime={post.date} className="post-date">
                {format(parseISO(post.date), 'MM/dd/yyyy')}
              </time>
              <span className="post-read-time">• {post.readTime}</span>
            </div>
            <h2 className="post-title">{post.title}</h2>
            <p className="post-excerpt">
              {post.content.substring(0, 150)}...
            </p>
          </Link>
          
          <div className="post-tags">
            {post.tags.map(tag => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>
          
          <div className="post-divider">
            <div className="divider-line"></div>
            <div className="divider-dots">• • •</div>
            <div className="divider-line"></div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default BlogList;