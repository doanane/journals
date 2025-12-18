import React from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './BackButton.css';

function BackButton() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <button onClick={handleBack} className="back-button" aria-label="Go back">
      <ArrowBackIcon className="back-icon" />
      <span className="back-text">Back to Stories</span>
    </button>
  );
}

export default BackButton;