// Frontend/src/components/ShareNoteModal.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { X, AlertCircle, CheckCircle2, Users } from 'lucide-react';

const ShareNoteModal = ({ isOpen, onClose, noteId }) => {
    const { auth } = useContext(AuthContext);
    const [collaborators, setCollaborators] = useState([]);
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [isMyNote, setIsMyNote] = useState(false);

    // Fetch collaborators whenever the modal opens for a specific note
    useEffect(() => {
        if (isOpen && noteId && auth) {
            fetchCollaborators();
            setStatus({ type: '', message: '' });
            setEmail('');
        }
    }, [isOpen, noteId, auth]);

    const fetchCollaborators = async () => {
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${auth.token}` } };
            const { data } = await axios.get(`http://localhost:3001/api/notes/${noteId}/collaborators`, config);
            setCollaborators(data);
            
            // Check if current user is owner
            const me = data.find(c => c.user._id === auth._id);
            setIsMyNote(me && me.role === 'owner');
        } catch (error) {
            console.error("Error fetching collaborators", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddCollaborator = async (e) => {
        e.preventDefault();
        if (!email) return;
        
        try {
            const config = { headers: { Authorization: `Bearer ${auth.token}` } };
            await axios.post(`http://localhost:3001/api/notes/${noteId}/share`, { email }, config);
            await fetchCollaborators(); // Refresh list
            setEmail('');
            setStatus({ type: 'success', message: 'Collaborator added successfully' });
            
            // Clear success message after 3s
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to add user' });
        }
    };

    const handleRemoveCollaborator = async (userId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${auth.token}` } };
            await axios.delete(`http://localhost:3001/api/notes/${noteId}/collaborators/${userId}`, config);
            // Optimistic update
            setCollaborators(prev => prev.filter(c => c.user._id !== userId));
        } catch (error) {
            console.error("Failed to remove", error);
            setStatus({ type: 'error', message: 'Failed to remove collaborator' });
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600/20 rounded-lg text-blue-500">
                             <Users size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Collaborators</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Manage access to this note</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-white transition bg-gray-800 hover:bg-gray-700 p-2 rounded-full"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Collaborators List */}
                <div className="max-h-80 overflow-y-auto custom-scrollbar min-h-[150px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                            Loading...
                        </div>
                    ) : (
                        <ul className="py-2">
                            {collaborators.map(meta => (
                                <li key={meta.user._id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-800/50 group transition-colors">
                                    <img 
                                        src={meta.user.avatar || 'https://i.pravatar.cc/150'} 
                                        alt={meta.user.name} 
                                        className="w-9 h-9 rounded-full ring-2 ring-gray-800 object-cover" 
                                    />
                                    <div className="flex-1 overflow-hidden">
                                        <span className="text-sm font-medium text-white block truncate">
                                            {meta.user.name} 
                                            {meta.user._id === auth._id && <span className="text-gray-500 font-normal"> (You)</span>}
                                        </span>
                                        <span className="text-xs text-gray-500 block truncate">{meta.user.email}</span>
                                    </div>
                                    
                                    {/* Role Badge */}
                                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                        meta.role === 'owner' 
                                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                                            : 'bg-gray-700/50 text-gray-400 border border-gray-700'
                                    }`}>
                                        {meta.role}
                                    </span>

                                    {/* Remove Button */}
                                    {isMyNote && meta.role !== 'owner' && (
                                        <button 
                                            onClick={() => handleRemoveCollaborator(meta.user._id)}
                                            className="ml-2 text-gray-500 hover:text-red-400 p-1.5 rounded-md hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                                            title="Remove access"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Footer: Add New */}
                {isMyNote && (
                    <div className="p-5 border-t border-gray-800 bg-gray-900/50">
                        <form onSubmit={handleAddCollaborator}>
                            <label className="block text-xs font-medium text-gray-400 mb-2 ml-1">Add people by email</label>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="user@example.com"
                                    className="flex-1 bg-gray-800 text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-600/50 border border-gray-700 placeholder-gray-600 transition-all"
                                    required
                                />
                                <button 
                                    type="submit" 
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 rounded-xl transition shadow-lg shadow-blue-900/20"
                                >
                                    Invite
                                </button>
                            </div>
                            
                            {/* Status Message */}
                            {status.message && (
                                <div className={`text-xs mt-3 flex items-center gap-2 px-3 py-2 rounded-lg ${
                                    status.type === 'error' 
                                        ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                }`}>
                                    {status.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                                    {status.message}
                                </div>
                            )}
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShareNoteModal;