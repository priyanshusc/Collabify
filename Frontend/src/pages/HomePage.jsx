// Frontend/src/pages/HomePage.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import LandingPage from './LandingPage';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage = () => {
  const { auth, isInitializing } = useContext(AuthContext);

  if (isInitializing) {
    return <LoadingSpinner />;
  }

  return auth ? <Navigate to="/dashboard" replace /> : <LandingPage />;
};

export default HomePage;