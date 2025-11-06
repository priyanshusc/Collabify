// Frontend/src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout and Route Components
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import RedirectIfLoggedIn from './components/RedirectIfLoggedIn';
import NotePage from './pages/NotePage';

// Page Components
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <Routes>
      <Route element={<RedirectIfLoggedIn />}>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>
      {/* ... Public Routes (no changes) ... */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
        
        {/* ADD THIS NEW PROTECTED ROUTE FOR THE FULL-PAGE EDITOR */}
        <Route path="/note/:noteId" element={<NotePage />} />
      </Route>
    </Routes>
  );
}

export default App;