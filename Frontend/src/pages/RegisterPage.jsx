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
            navigate('/dashboard'); 
        } catch (error) {
            console.error('Registration error:', error.response ? error.response.data : error.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
            <div className="flex w-full max-w-4xl bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">

                {/* LEFT PANEL - Decorative */}
                <div className="hidden md:flex flex-col justify-between flex-[1.2] bg-gray-900 p-12 text-white relative overflow-hidden">
                     {/* Abstract Background Shapes */}
                    <div className="absolute top-0 right-5 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-10 translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600 rounded-full filter blur-3xl opacity-20 -translate-x-1/2 translate-y-1/2"></div>

                    <div className="relative z-10">
                        <h1 className="text-4xl font-bold mb-4 leading-tight">Join Collabify</h1>
                        <p className="text-gray-400 text-md leading-relaxed">
                            Start capturing ideas instantly. Create, plan, and innovate together — all in one dark, sleek workspace.
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
                            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                            <p className="text-gray-400 text-sm">
                                Already have an account?{' '}
                                <Link to="/login" className="text-blue-500 hover:text-blue-400 font-medium transition">
                                    Login here
                                </Link>
                            </p>
                        </div>

                        <form onSubmit={onSubmit} className="space-y-5">
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="name">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={name}
                                    onChange={onChange}
                                    required
                                    placeholder="John Doe"
                                    className="w-full bg-gray-900 text-white px-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition placeholder-gray-600"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={onChange}
                                    required
                                    placeholder="name@company.com"
                                    className="w-full bg-gray-900 text-white px-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition placeholder-gray-600"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={password}
                                    minLength="6"
                                    onChange={onChange}
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-gray-900 text-white px-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition placeholder-gray-600"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition duration-300 cursor-pointer"
                            >
                                Register Now
                            </button>

                            <div className="relative mt-3 mb-5">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-gray-800 text-gray-500">Or sign up with</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="w-full bg-gray-900 border border-gray-700 text-gray-300 font-medium py-3 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-800 hover:text-white transition duration-300"
                            >
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                                <span>Signup with Google</span>
                            </button>
                        </form>

                        <div className="mt-6 text-center text-xs text-gray-500">
                            By signing up, you agree to our{' '}
                            <span className="text-blue-500 hover:underline cursor-pointer">Terms & Privacy Policy</span>.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;