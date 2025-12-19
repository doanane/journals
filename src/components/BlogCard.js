import { format, parseISO } from 'date-fns';
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getComments, subscribeToComments } from '../services/firebase';
import './BlogCard.css';
import ReactionButtons from './ReactionButtons';
import ShareButton from './ShareButton';

function BlogCard({ post }) {
  const [commentCount, setCommentCount] = React.useState(0);

  useEffect(() => {
    const loadCommentCount = async () => {
      try {
        const comments = await getComments(post.id);
        setCommentCount(comments.length);
      } catch (error) {
        console.error('Error loading comment count:', error);
        setCommentCount(0);
      }
    };

    loadCommentCount();

    // Subscribe to real-time comment updates
    const unsubscribe = subscribeToComments(post.id, (comments) => {
      setCommentCount(comments.length);
    });

    return unsubscribe;
  }, [post.id]);

  return (
    <article className="blog-card">
      <div className="card-content">
        <div className="card-meta">
          <time dateTime={post.date} className="card-date">
            {format(parseISO(post.date), 'MM/dd/yyyy')}
          </time>
          <span className="card-read-time">• {post.readTime}</span>
        </div>

        <Link to={`/post/${post.id}`} className="card-title-link">
          <h2 className="card-title">{post.title}</h2>
        </Link>

        <div className="story-content">
          {post.content.substring(0, 200)}...
          <Link to={`/post/${post.id}`} className="read-more">
            Read full story →
          </Link>
        </div>

        <div className="card-tags">
          {post.tags.map(tag => (
            <span key={tag} className="card-tag">#{tag}</span>
          ))}
        </div>
      </div>

      <ReactionButtons postId={post.id} />

      <div className="card-footer">
        <div className="comments-preview">
          <Link to={`/post/${post.id}#comments`} className="comments-link">
            💬 {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
          </Link>
        </div>
        <div className="card-actions">
          <ShareButton
            title={post.title}
            text={`Thoughtful read on Journals: ${post.title}`}
            url={`${typeof window !== 'undefined' ? window.location.origin : ''}/post/${post.id}`}
          />
        </div>

        <div className="card-divider">
          <div className="divider-line"></div>
          <div className="divider-dots">• • •</div>
          <div className="divider-line"></div>
        </div>
      </div>
    </article>
  );
}

export default BlogCard;