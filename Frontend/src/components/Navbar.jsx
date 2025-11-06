import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { User } from "lucide-react";

const Navbar = ({ isSidebarOpen, toggleSidebar }) => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-gray-900/50 backdrop-blur-sm p-4 sticky top-0 z-30 border-b border-white/10">
      <div className="container mx-auto justify-between flex items-center">
        <div className="flex items-center gap-4">
          {auth && (
            <button onClick={toggleSidebar} className="text-gray-300 hover:text-white focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path>
              </svg>
            </button>
          )}
          <Link to="/" className="text-white text-xl font-bold">
            Collabify
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {auth ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="focus:outline-none"
              >
                <User className="w-10 h-10 text-gray-300 p-2 border-2 border-white/20 rounded-full hover:border-gray-400 transition" />
              </button>

              {/* Animated Dropdown */}
              <div
                className={`absolute right-0 mt-2 w-56 bg-gray-800 rounded-md shadow-lg py-1 border border-white/10 origin-top-right transform transition-all duration-150
    ${isDropdownOpen ? 'scale-100 opacity-100 animate-dropdownOpen' : 'scale-95 opacity-0 animate-dropdownClose pointer-events-none'}`}
              >
                <div className="px-4 py-2 text-sm text-gray-300 border-b border-white/10">
                  Signed in as
                  <span className="font-semibold block mt-2 text-white">{auth.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/20"
                >
                  Logout
                </button>
              </div>
            </div>

          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-white transition">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;