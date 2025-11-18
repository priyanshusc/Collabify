// Frontend/src/components/NoteViewModal.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import TiptapEditor from './TiptapEditor';
import Toolbar from './Toolbar';
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import { BsFillPeopleFill } from "react-icons/bs";
import { X, CheckCircle2, AlertCircle } from 'lucide-react'; // Added icons for status

const NoteViewModal = ({ noteId, onClose }) => {
    const { auth } = useContext(AuthContext);
    const [note, setNote] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState('');
    const [editorInstance, setEditorInstance] = useState(null);

    const [collaborators, setCollaborators] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [shareError, setShareError] = useState('');
    const [isMyNote, setIsMyNote] = useState(false);
    const dropdownRef = useRef(null);

    const initialLoad = useRef(true);
    const navigate = useNavigate();

    // --- Fetch Logic (Identical to before) ---
    const fetchCollaborators = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${auth.token}` } };
            const { data: collabData } = await axios.get(`http://localhost:3001/api/notes/${noteId}/collaborators`, config);
            setCollaborators(collabData);
            const me = collabData.find(c => c.user._id === auth._id);
            if (me && me.role === 'owner') {
                setIsMyNote(true);
            }
        } catch (error) {
            console.error("Failed to fetch collaborators", error);
        }
    };

    useEffect(() => {
        const fetchNoteData = async () => {
            if (!noteId) return;
            setIsLoading(true);
            initialLoad.current = true;
            try {
                const config = { headers: { Authorization: `Bearer ${auth.token}` } };
                const { data: noteData } = await axios.get(`http://localhost:3001/api/notes/${noteId}`, config);
                setNote(noteData);
                setSaveStatus('Saved');
                await fetchCollaborators();
            } catch (error) {
                console.error("Failed to fetch note data", error);
                onClose();
            } finally {
                setIsLoading(false);
            }
        };
        fetchNoteData();
    }, [noteId, auth.token, onClose, auth._id]);

    // --- Auto-Save Logic (Identical to before) ---
    useEffect(() => {
        if (initialLoad.current) {
            initialLoad.current = false;
            return;
        }
        if (saveStatus === 'Saved') return;

        const timerId = setTimeout(() => {
            if (note && noteId) {
                const saveNote = async () => {
                    setSaveStatus('Saving...');
                    try {
                        const config = { headers: { Authorization: `Bearer ${auth.token}` } };
                        await axios.put(`http://localhost:3001/api/notes/${noteId}`, {
                            title: note.title,
                            content: note.content
                        }, config);
                        setSaveStatus('Saved');
                    } catch (error) {
                        setSaveStatus('Error!');
                        console.error("Failed to save note", error);
                    }
                };
                saveNote();
            }
        }, 1000);
        return () => clearTimeout(timerId);
    }, [note, noteId, auth.token, saveStatus]);

    // --- Click Outside Dropdown ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleTitleChange = (e) => {
        setSaveStatus('');
        setNote(prevNote => ({ ...prevNote, title: e.target.value }));
    };

    const handleContentChange = (newContent) => {
        setSaveStatus('');
        setNote(prevNote => ({ ...prevNote, content: newContent }));
    };

    const handleShareNote = async (e) => {
        e.preventDefault();
        setShareError('');
        if (!email) return;
        try {
            const config = { headers: { Authorization: `Bearer ${auth.token}` } };
            await axios.post(`http://localhost:3001/api/notes/${noteId}/share`, { email }, config);
            await fetchCollaborators();
            setEmail('');
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to share note';
            setShareError(errorMsg);
        }
    };

    const handleRemoveCollaborator = async (userIdToRemove) => {
        setCollaborators(prev => prev.filter(c => c.user._id !== userIdToRemove));
        try {
            const config = { headers: { Authorization: `Bearer ${auth.token}` } };
            await axios.delete(`http://localhost:3001/api/notes/${noteId}/collaborators/${userIdToRemove}`, config);
        } catch (error) {
            console.error("Failed to remove collaborator", error);
            await fetchCollaborators();
        }
    };

    if (!noteId) return null;

    return (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div 
                className="bg-gray-900 w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl border border-gray-800 flex flex-col overflow-hidden relative" 
                onClick={e => e.stopPropagation()}
            >
                {isLoading ? <div className="h-full flex items-center justify-center"><LoadingSpinner /></div> : (
                    <>
                        {/* --- Header: Title & Actions --- */}
                        <div className="px-8 py-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50 backdrop-blur-md z-10 shrink-0">
                            <input
                                type="text"
                                value={note.title}
                                onChange={handleTitleChange}
                                className="bg-transparent text-3xl font-bold text-white placeholder-gray-600 w-full outline-none mr-4"
                                placeholder="Untitled Note"
                            />
                            
                            {/* Collaborators & Close */}
                            <div className="flex items-center gap-3 shrink-0">
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsDropdownOpen(prev => !prev)}
                                        className={`p-2.5 rounded-full transition-all duration-200 ${isDropdownOpen ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'}`}
                                        title="Collaborators"
                                    >
                                        <BsFillPeopleFill size={18} />
                                    </button>
                                    
                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-3 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden ring-1 ring-black/5">
                                            <div className="p-4 border-b border-gray-800 bg-gray-900/50">
                                                <h4 className="font-semibold text-white">Collaborators</h4>
                                                <p className="text-xs text-gray-500 mt-0.5">Manage access to this note</p>
                                            </div>
                                            <ul className="max-h-60 overflow-y-auto py-1">
                                                {collaborators.map(meta => (
                                                    <li key={meta.user._id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800/50 group transition-colors">
                                                        <img 
                                                            src={meta.user.avatar || 'https://i.pravatar.cc/150'} 
                                                            alt={meta.user.name} 
                                                            className="w-8 h-8 rounded-full ring-2 ring-gray-800" 
                                                        />
                                                        <div className="flex-1 overflow-hidden">
                                                            <span className="text-sm font-medium text-white block truncate">{meta.user.name}</span>
                                                            <span className="text-xs text-gray-500 block truncate">{meta.user.email}</span>
                                                        </div>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${meta.role === 'owner' ? 'bg-blue-900/30 text-blue-400' : 'bg-gray-800 text-gray-400'}`}>
                                                            {meta.role}
                                                        </span>
                                                        {isMyNote && meta.role !== 'owner' && (
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); handleRemoveCollaborator(meta.user._id); }}
                                                                className="text-gray-500 hover:text-red-400 p-1 rounded-md hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                            {isMyNote && (
                                                <form onSubmit={handleShareNote} className="p-4 border-t border-gray-800 bg-gray-900/50">
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="email"
                                                            value={email}
                                                            onChange={(e) => { setEmail(e.target.value); setShareError(''); }}
                                                            placeholder="Add email..."
                                                            className="flex-1 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-600/50 border border-gray-700 placeholder-gray-500"
                                                            required
                                                        />
                                                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 rounded-lg transition">
                                                            Add
                                                        </button>
                                                    </div>
                                                    {shareError && <p className="text-red-400 text-xs mt-2 flex items-center gap-1"><AlertCircle size={12}/> {shareError}</p>}
                                                </form>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <button onClick={onClose} className="p-2.5 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-red-500/20 hover:text-red-400 transition-all">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* --- Toolbar (Sticky) --- */}
                        <div className="px-8 py-2 border-b border-gray-800 bg-gray-900">
                             <Toolbar editor={editorInstance} />
                        </div>

                        {/* --- Editor Content --- */}
                        <div className="flex-1 overflow-y-auto bg-gray-900 p-8 custom-scrollbar">
                             <div className="max-w-4xl mx-auto">
                                <TiptapEditor
                                    content={note.content}
                                    onChange={handleContentChange}
                                    onEditorReady={setEditorInstance}
                                />
                             </div>
                        </div>

                        {/* --- Footer: Status & Info --- */}
                        <div className="px-8 py-4 border-t border-gray-800 bg-gray-900 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-4">
                                <div className={`flex items-center gap-2 text-xs font-medium uppercase tracking-wider ${saveStatus === 'Saved' ? 'text-emerald-500' : saveStatus === 'Error!' ? 'text-red-500' : 'text-blue-500'}`}>
                                    {saveStatus === 'Saved' && <CheckCircle2 size={14} />}
                                    {saveStatus}
                                </div>
                                <div className="h-4 w-px bg-gray-800"></div>
                                <span className="text-gray-500 text-xs">
                                    Updated: {new Date(note.updatedAt).toLocaleDateString()} {new Date(note.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>

                            <button onClick={() => navigate(`/note/${noteId}`)} className="text-sm font-semibold text-blue-500 hover:text-blue-400 transition flex items-center gap-1">
                                Full Page <FaArrowUpRightFromSquare />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default NoteViewModal;