import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import BlogCard from '../components/BlogCard';
import SkeletonLoader from '../components/SkeletonLoader';
import blogPosts from '../data/blogPosts';
import './Home.css';

function Home() {
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const sortedPosts = [...blogPosts].sort((a, b) => new Date(b.date) - new Date(a.date));

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilteredPosts(sortedPosts);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredPosts(sortedPosts);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filtered = sortedPosts.filter(post =>
      post.title.toLowerCase().includes(searchTerm) ||
      post.content.toLowerCase().includes(searchTerm) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );

    setFilteredPosts(filtered);
  };

  return (
    <div className="home">
      <header className="home-header">
        <h1 className="site-title">Stories of Faith & Life</h1>
        <p className="site-subtitle">Real stories. Real lessons. Real growth.</p>
      </header>

      <SearchBar onSearch={handleSearch} />

      {searchQuery && (
        <div className="search-results-info">
          Showing {filteredPosts.length} {filteredPosts.length === 1 ? 'story' : 'stories'} 
          {searchQuery && ` for "${searchQuery}"`}
        </div>
      )}

      <main className="blog-list-container">
        {isLoading ? (
          <SkeletonLoader />
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <BlogCard key={post.id} post={post} />
          ))
        ) : (
          <div className="no-results">
            <p className="no-results-text">No stories found matching "{searchQuery}"</p>
            <button 
              onClick={() => handleSearch('')}
              className="clear-search-button"
            >
              View All Stories
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;