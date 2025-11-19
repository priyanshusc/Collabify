// Frontend/src/components/Navbar.jsx
import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { User, LogOut, Settings } from "lucide-react"; // Changed UserCircle to Settings

const Navbar = ({ isSidebarOpen, toggleSidebar, onOpenSettings }) => { // 👈 Accept prop
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
    <nav className="bg-gray-900/80 backdrop-blur-md p-4 sticky top-0 z-30 border-b border-gray-700">
      <div className="container mx-auto justify-between flex items-center">
        <div className="flex items-center gap-4">
          {auth && (
            <button onClick={toggleSidebar} className="text-gray-400 hover:text-white focus:outline-none transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path>
              </svg>
            </button>
          )}
          <Link to="/" className="text-white text-xl font-bold tracking-tight flex items-center gap-2">
             Collabify
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {auth ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="focus:outline-none group"
              >
                <div className="p-1 border-2 border-gray-600 rounded-full group-hover:border-gray-400 transition">
                  <User className="w-6 h-6 text-gray-300" />
                </div>
              </button>

              {/* Animated Dropdown */}
              <div
                className={`absolute right-0 mt-3 w-56 bg-gray-800 rounded-xl shadow-2xl py-2 border border-gray-700 origin-top-right transform transition-all duration-200
                ${isDropdownOpen ? 'scale-100 opacity-100 visible' : 'scale-95 opacity-0 invisible pointer-events-none'}`}
              >
                <div className="px-4 py-3 text-sm text-gray-400 border-b border-gray-700 mb-1">
                  Signed in as
                  <span className="font-semibold block mt-1 text-white truncate">{auth.name}</span>
                </div>

                {/* --- Settings Option (Formerly Profile) --- */}
                <button
                    onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenSettings(); // 👈 Trigger Modal
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition flex items-center gap-2"
                >
                    <Settings size={16} />
                    Settings
                </button>

                {/* --- Divider --- */}
                {/* <div className="h-px bg-gray-700 my-1 mx-2"></div> */}

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>

          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-white transition font-medium">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg transition duration-300 shadow-lg shadow-blue-600/20"
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