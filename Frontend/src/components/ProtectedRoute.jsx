// Frontend/src/components/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner'; // 👈 IMPORT THE SPINNER

const ProtectedRoute = () => {
  const { auth, isInitializing } = useContext(AuthContext); // 👈 GET isInitializing

  if (isInitializing) {
    return <LoadingSpinner />;
  }

  return auth ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;