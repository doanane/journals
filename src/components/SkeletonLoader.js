import React from 'react';
import './SkeletonLoader.css';

function SkeletonLoader() {
  return (
    <div className="skeleton-container">
      {[1, 2, 3].map((item) => (
        <div key={item} className="skeleton-card">
          <div className="skeleton-header">
            <div className="skeleton-meta">
              <div className="skeleton-date"></div>
              <div className="skeleton-read-time"></div>
            </div>
            <div className="skeleton-title"></div>
          </div>
          
          <div className="skeleton-content">
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
          </div>
          
          <div className="skeleton-tags">
            <div className="skeleton-tag"></div>
            <div className="skeleton-tag"></div>
          </div>
          
          <div className="skeleton-divider">
            <div className="skeleton-dots"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SkeletonLoader;