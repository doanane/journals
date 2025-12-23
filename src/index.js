import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';
import './fix-fonts.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Apply theme class on initial load
const applyTheme = () => {
  const saved = localStorage.getItem('darkMode');
  const isDark = saved ? JSON.parse(saved) : false;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
};

applyTheme();

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);