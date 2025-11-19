// Frontend/src/components/MainLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import SettingsModal from './SettingsModal'; // 👈 Import the new modal

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // 👈 Add state for settings modal

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebar = () => setIsSidebarOpen(prevState => !prevState);

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Navbar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar}
        onOpenSettings={() => setIsSettingsOpen(true)} // 👈 Pass opener to Navbar
      />
      <main>
        <Outlet context={{ isSidebarOpen, openSidebar, closeSidebar }} />
      </main>

      {/* 👈 Render the Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};

export default MainLayout;