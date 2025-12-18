import React from 'react';
import { useTheme } from '../context/ThemeContext';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import './ThemeToggle.css';

function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      {isDarkMode ? (
        <>
          <LightModeIcon className="theme-icon" />
          <span className="theme-text">Light Mode</span>
        </>
      ) : (
        <>
          <DarkModeIcon className="theme-icon" />
          <span className="theme-text">Dark Mode</span>
        </>
      )}
    </button>
  );
}

export default ThemeToggle;