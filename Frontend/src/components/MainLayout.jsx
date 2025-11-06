// Frontend/src/components/MainLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebar = () => setIsSidebarOpen(prevState => !prevState);

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Navbar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
      />
      <main>
        <Outlet context={{ isSidebarOpen, openSidebar, closeSidebar }} />
      </main>
    </div>
  );
};

export default MainLayout;