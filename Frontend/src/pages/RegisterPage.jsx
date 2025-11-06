// Frontend/src/pages/RegisterPage.jsx
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const RegisterPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const { name, email, password } = formData;

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:3001/api/auth/register', formData);
            login(res.data);
            navigate('/dashboard'); // Redirect to dashboard
        } catch (error) {
            console.error('Registration error:', error.response ? error.response.data : error.message);
        }
    };

    return (
        <div className="min-h-screen flex justify-center bg-gray-100">
            <div className="flex w-full bg-white overflow-hidden shadow-2xl">

                {/* LEFT PANEL */}
                <div className="flex flex-col justify-between flex-[1.4] bg-gradient-to-br from-indigo-700 to-indigo-900 p-14 text-white relative">
                    {/* Decorative Lines */}
                    <svg className="absolute inset-0 opacity-10" xmlns="http://www.w3.org/2000/svg">
                        <pattern id="lines" width="80" height="80" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                            <path d="M0 0L80 0L0 80Z" stroke="white" strokeWidth="0.5" />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#lines)" />
                    </svg>

                    <div className="relative z-10">
                        <h1 className="text-5xl font-bold mb-3">Join Collabify 🚀</h1>
                        <p className="text-indigo-100 text-base leading-relaxed">
                            Start collaborating with your team instantly.
                            Create, plan, and innovate together — all in one place!
                        </p>
                    </div>

                    <p className="text-indigo-200 text-sm relative z-10">
                        © {new Date().getFullYear()} Collabify. All rights reserved.
                    </p>
                </div>

                {/* RIGHT PANEL */}
                <div className="flex-[1] flex items-center justify-center p-10">
                    <div className="w-full max-w-sm">
                        <h2 className="text-3xl font-semibold text-gray-900 mb-1">Create an Account</h2>
                        <p className="text-gray-600 text-sm mb-6">
                            Already have an account?{' '}
                            <Link to="/login" className="text-indigo-600 hover:underline font-medium">
                                Login here
                            </Link>
                        </p>

                        <form onSubmit={onSubmit} className="space-y-5">
                            <div>
                                <label className="block text-gray-700 text-sm mb-2" htmlFor="name">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={name}
                                    onChange={onChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm mb-2" htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={onChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm mb-2" htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={password}
                                    minLength="6"
                                    onChange={onChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-black text-white font-medium py-2.5 rounded-lg hover:bg-gray-900 transition"
                            >
                                Register Now
                            </button>

                            <button
                                type="button"
                                className="w-full border border-gray-300 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition"
                            >
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                                <span className='text-slate-900 font-medium text-sm pl-1'>Signup with Google</span>
                            </button>
                        </form>

                        <div className="mt-5 text-center text-sm text-gray-600">
                            By signing up, you agree to our{' '}
                            <span className="text-indigo-600 hover:underline cursor-pointer">Terms & Privacy</span>.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default RegisterPage;