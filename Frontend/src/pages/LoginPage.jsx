// Frontend/src/pages/LoginPage.jsx
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(''); // 1. New state for error messages
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // 2. Clear error as soon as user starts typing again
    if (error) setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors on submit
    try {
      const res = await axios.post('http://localhost:3001/api/auth/login', formData);
      login(res.data);
      navigate('/dashboard');
    } catch (err) {
      // 3. Capture error from backend (e.g., "Invalid email or password")
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      console.error('Login error:', errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="flex w-full max-w-4xl bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
        
        {/* LEFT PANEL - Decorative */}
        <div className="hidden md:flex flex-col justify-between flex-[1.2] bg-gray-900 p-12 text-white relative overflow-hidden">
          
          {/* Abstract Background Shapes */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600 rounded-full filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-600 rounded-full filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>
          
          {/* Content */}
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-4 leading-tight">Welcome to Collabify!</h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              Your team is waiting. Jump back in to collaborate, manage projects, and capture your best ideas.
            </p>
          </div>

          <div className="relative z-10 mt-auto">
             <div className="h-1 w-12 bg-blue-600 rounded mb-4"></div>
             <p className="text-gray-500 text-sm">
               © {new Date().getFullYear()} Collabify.
             </p>
          </div>
        </div>

        {/* RIGHT PANEL - Form */}
        <div className="flex-[1] flex items-center justify-center p-8 md:p-12 bg-gray-800">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Login</h2>
              <p className="text-gray-400 text-sm">
                Don’t have an account?{' '}
                <Link to="/register" className="text-blue-500 hover:text-blue-400 font-medium transition">
                  Create an account
                </Link>
              </p>
            </div>

            {/* 4. ERROR ALERT COMPONENT */}
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/50 flex items-center gap-3 animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-red-500 text-sm font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  required
                  placeholder="name@company.com"
                  className={`w-full bg-gray-900 text-white px-4 py-3 border rounded-lg focus:ring-2 outline-none transition placeholder-gray-600 
                    ${error ? 'border-red-500/50 focus:ring-red-500/50' : 'border-gray-700 focus:ring-blue-600 focus:border-transparent'}`}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-gray-300 text-sm font-medium" htmlFor="password">Password</label>
                  <Link to="/forgot-password" className="text-sm text-blue-500 hover:text-blue-400 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  required
                  placeholder="••••••••"
                  className={`w-full bg-gray-900 text-white px-4 py-3 border rounded-lg focus:ring-2 outline-none transition placeholder-gray-600
                    ${error ? 'border-red-500/50 focus:ring-red-500/50' : 'border-gray-700 focus:ring-blue-600 focus:border-transparent'}`}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition duration-300 cursor-pointer"
              >
                Login
              </button>

              <div className="relative mt-3 mb-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-800 text-gray-500">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                className="w-full bg-gray-900 border border-gray-700 text-gray-300 font-medium py-3 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-800 hover:text-white transition duration-300"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                <span>Login with Google</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;