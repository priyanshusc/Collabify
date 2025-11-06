// Frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true); // 👈 ADD THIS STATE

  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      setAuth(JSON.parse(storedUser));
    }
    setIsInitializing(false); // 👈 SET TO FALSE AFTER CHECKING
  }, []);

  const login = (userData) => {
    localStorage.setItem('userInfo', JSON.stringify(userData));
    setAuth(userData);
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setAuth(null);
  };

  return (
    // 👇 ADD isInitializing TO THE VALUE
    <AuthContext.Provider value={{ auth, isInitializing, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;