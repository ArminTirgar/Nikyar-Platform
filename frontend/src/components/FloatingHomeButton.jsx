import React from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button } from '@mui/material';  // ✅ درستش اینه (نه Fab)
import './FloatingHomeButton.css';

const FloatingHomeButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<ArrowBackIcon />}
      className="floating-home-button"
      onClick={() => navigate('/')}
    >
      بازگشت
    </Button>
  );
};

export default FloatingHomeButton;
