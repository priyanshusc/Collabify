// Frontend/src/components/RedirectIfLoggedIn.jsx
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const RedirectIfLoggedIn = () => {
  const { auth, isInitializing } = useContext(AuthContext);

  if (isInitializing) {
    return <LoadingSpinner />;
  }

  return auth ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default RedirectIfLoggedIn;