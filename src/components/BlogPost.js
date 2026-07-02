// src/components/BlogPost.js
import { format, parseISO } from 'date-fns';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import blogPosts from '../data/blogPosts';
import BackButton from './BackButton';
import './BlogPost.css';
import Comments from './Comments';
import ReactionButtons from './ReactionButtons';
import ShareButton from './ShareButton';

const DIALOGUE_LINE = /^([A-Z][A-Za-zÀ-ÿ'’.]*(?:\s[A-Z][A-Za-zÀ-ÿ'’.]*){0,2}):\s(.*)$/s;
const VERSE_LINE = /^((?:[1-3]\s)?[A-Z][a-zA-Z]+)\s(\d+:\d+):\s"(.+)"$/s;

function getParagraphClassName(paragraph) {
  if (paragraph.includes('\n')) {
    return 'content-paragraph content-bars';
  }
  if (VERSE_LINE.test(paragraph)) {
    return 'content-paragraph content-verse';
  }
  return 'content-paragraph';
}

function renderParagraph(paragraph) {
  if (paragraph.includes('\n')) {
    return paragraph;
  }
  const verseMatch = paragraph.match(VERSE_LINE);
  if (verseMatch) {
    return (
      <>
        <strong>{verseMatch[1]} {verseMatch[2]}</strong> — "{verseMatch[3]}"
      </>
    );
  }
  const dialogueMatch = paragraph.match(DIALOGUE_LINE);
  if (!dialogueMatch) {
    return paragraph;
  }
  return (
    <>
      <strong>{dialogueMatch[1]}:</strong> {dialogueMatch[2]}
    </>
  );
}

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
          <div className="post-actions">
            <ShareButton
              title={post.title}
              text={`I just read this on Journals: ${post.title}`}
              url={`${typeof window !== 'undefined' ? window.location.origin : ''}/post/${post.id}`}
              className="post-share-btn"
            />
          </div>
        </div>

        <div className="post-content">
          {post.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className={getParagraphClassName(paragraph)}>
              {renderParagraph(paragraph)}
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