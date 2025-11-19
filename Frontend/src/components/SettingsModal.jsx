// Frontend/src/components/SettingsModal.jsx
import React, { useState, useContext } from 'react';
import { X, User, Bell, Globe, Shield, Monitor, Camera, CheckCircle2 } from 'lucide-react';
import AuthContext from '../context/AuthContext';

const SettingsModal = ({ isOpen, onClose }) => {
    const { auth } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('account');
    const [name, setName] = useState(auth?.name || '');

    if (!isOpen) return null;

    const sidebarItems = [
        { id: 'account', label: 'My account', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'preferences', label: 'My settings', icon: Monitor },
        { id: 'connections', label: 'My connections', icon: Globe },
        { id: 'security', label: 'Security & data', icon: Shield },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            {/* Modal Container */}
            <div
                className="bg-gray-900 w-full max-w-5xl h-[85vh] rounded-xl shadow-2xl border border-gray-800 flex overflow-hidden relative animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-10 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition z-50"
                >
                    <X size={20} />
                </button>

                {/* --- SIDEBAR --- */}
                <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0 py-6">
                    {/* User Mini Profile */}
                    <div className="px-4 mb-6">
                        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition cursor-default">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-blue-900/20">
                                {auth?.avatar ? (
                                    <img src={auth.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    auth?.name?.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <div className="text-sm font-semibold text-white truncate">{auth?.name}</div>
                                <div className="text-xs text-gray-500 truncate">{auth?.email}</div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <div className="flex-1 overflow-y-auto px-2 space-y-1">
                        <div className="px-3 pb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Account
                        </div>
                        {sidebarItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${activeTab === item.id
                                        ? 'bg-gray-800 text-white font-medium shadow-sm'
                                        : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                                    }`}
                            >
                                <item.icon size={18} className={activeTab === item.id ? 'text-blue-500' : 'opacity-70'} />
                                {item.label}
                            </button>
                        ))}

                        {/* Workspace Section Spacer */}
                        <div className="h-6"></div>

                        <div className="px-3 pb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Workspace
                        </div>
                        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 rounded-lg transition-colors">
                            <div className="w-4 h-4 bg-indigo-600 rounded flex items-center justify-center text-[8px] text-white font-bold">C</div>
                            Collabify Team
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 rounded-lg transition-colors">
                            Settings
                        </button>
                    </div>
                </div>

                {/* --- MAIN CONTENT AREA --- */}
                <div className="flex-1 overflow-y-auto bg-gray-900 custom-scrollbar">
                    <div className="max-w-3xl mx-auto px-12 py-12">

                        {activeTab === 'account' && (
                            <div>
                                
                                {/* Section Header */}
                                <div>
                                    <h2 className="text-2xl font-bold mb-3 text-white">My Profile</h2>
                                    {/* <p className="text-gray-400 text-sm">Manage your profile information and how others see you.</p> */}
                                </div>

                                <div className="h-px bg-gray-800 w-full mb-2"></div>

                                {/* 1. Profile Photo & Name */}
                                <div className="flex flex-col pt-2 sm:flex-row items-start gap-8">
                                    {/* Avatar Group */}
                                    <div className="group relative shrink-0">
                                        <div className="w-24 h-24 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center text-4xl font-bold text-gray-500 overflow-hidden shadow-xl">
                                            {auth?.avatar ? <img src={auth.avatar} alt="" className="w-full h-full object-cover" /> : auth?.name?.charAt(0)}
                                        </div>
                                        <button className="absolute bottom-0 right-0 bg-gray-700 hover:bg-blue-600 border border-gray-600 p-2 rounded-full text-white shadow-lg transition-colors duration-200">
                                            <Camera size={14} />
                                        </button>
                                    </div>

                                    {/* Inputs */}
                                    <div className="flex-1 w-full space-y-5">
                                        <div className='mt-3'>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                                Preferred Name
                                            </label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full bg-black/20 border border-gray-700 text-white text-sm rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600"
                                            />
                                            <p className="text-xs text-gray-500 mt-2">This name will be displayed to your team.</p>
                                        </div>

                                        <div className="flex gap-4">
                                            <button className="text-xs font-semibold text-blue-500 hover:text-blue-400 hover:underline">
                                                Upload new photo
                                            </button>
                                            <button className="text-xs font-semibold text-red-400 hover:text-red-300 hover:underline">
                                                Remove photo
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Account Security Section */}
                                <div className="mt-10">
                                    <h3 className="text-md font-bold text-white uppercase tracking-wider mb-2">Account Security</h3>

                                    {/* Row: Email */}
                                    <div className="flex items-center justify-between py-5 border-t border-gray-800">
                                        <div>
                                            <div className="text-sm text-white font-medium mb-0.5">Email</div>
                                            <div className="text-sm text-gray-500">{auth?.email}</div>
                                        </div>
                                        <button className="px-4 py-2 text-xs font-medium border border-gray-700 rounded-lg hover:bg-gray-800 text-gray-300 transition hover:border-gray-600">
                                            Change email
                                        </button>
                                    </div>

                                    {/* Row: Password */}
                                    <div className="flex items-center justify-between py-5 border-t border-gray-800">
                                        <div>
                                            <div className="text-sm text-white font-medium mb-0.5">Password</div>
                                            <div className="text-sm text-gray-500">Password set</div>
                                        </div>
                                        <button className="px-4 py-2 text-xs font-medium border border-gray-700 rounded-lg hover:bg-gray-800 text-gray-300 transition hover:border-gray-600">
                                            Change password
                                        </button>
                                    </div>

                                    {/* Row: 2FA */}
                                    <div className="flex items-center justify-between py-4 border-t border-gray-800">
                                        <div>
                                            <div className="text-sm text-white font-medium mb-0.5">2-step verification</div>
                                            <div className="text-sm text-gray-500 max-w-sm">
                                                Add an additional layer of security to your account during login.
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 text-xs font-medium border border-gray-700 rounded-lg hover:bg-gray-800 text-gray-300 transition hover:border-gray-600">
                                            Enable 2FA
                                        </button>
                                    </div>
                                </div>

                                {/* 3. Danger Zone */}
                                <div className="">
                                    <div className="border border-red-800/90 rounded-xl p-6">
                                        <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-4">Danger Zone</h3>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-sm text-white font-medium mb-1">Delete my account</div>
                                                <div className="text-sm text-gray-500 max-w-xs">
                                                    Permanently delete your account and remove access to all workspaces.
                                                </div>
                                            </div>
                                            <button className="px-4 py-2 text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition">
                                                Delete account
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        )}

                        {/* Placeholder for other tabs */}
                        {activeTab !== 'account' && (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-60">
                                <Monitor size={64} strokeWidth={1} className="mb-6" />
                                <h3 className="text-lg font-medium text-gray-300">Section Under Construction</h3>
                                <p className="text-sm mt-2">We are working hard to bring you more features.</p>
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
};

export default SettingsModal;