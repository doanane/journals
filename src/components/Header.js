import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>My Blog</h1>
        </Link>
        <nav className="nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/journals" className="nav-link">Journals</Link>
          <button className="subscribe-btn">Subscribe</button>
        </nav>
      </div>
    </header>
  );
}

export default Header;