import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import ThemeToggle from './components/ThemeToggle';
import Home from './pages/Home';
import BlogPost from './components/BlogPost';
import './App.css';

function ThemeApp() {
  const { isDarkMode } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <Router>
      <div className="App">
        <ThemeToggle />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post/:id" element={<BlogPost />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <ThemeApp />
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;