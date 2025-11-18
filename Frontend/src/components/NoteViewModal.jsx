import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import TiptapEditor from './TiptapEditor';
import Toolbar from './Toolbar';
import { BsFillPeopleFill } from "react-icons/bs";
import { X } from 'lucide-react';

const NoteViewModal = ({ noteId, onClose }) => {
    // All your existing state, useEffects, and handler functions are correct.
    const { auth } = useContext(AuthContext);
    const [note, setNote] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState('');
    const [editorInstance, setEditorInstance] = useState(null);

    const [collaborators, setCollaborators] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [email, setEmail] = useState(''); // For sharing
    const [shareError, setShareError] = useState(''); // For share errors
    const [isMyNote, setIsMyNote] = useState(false); // To check if current user is owner
    const dropdownRef = useRef(null);

    const initialLoad = useRef(true);
    const navigate = useNavigate();

    const fetchCollaborators = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${auth.token}` } };
            const { data: collabData } = await axios.get(`http://localhost:3001/api/notes/${noteId}/collaborators`, config);
            setCollaborators(collabData);

            // Check if the current user is the owner
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
                
                // Fetch note content
                const { data: noteData } = await axios.get(`http://localhost:3001/api/notes/${noteId}`, config);
                setNote(noteData);
                setSaveStatus('Saved');

                // Fetch collaborators
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

    // 1. Fetch the note data
    useEffect(() => {
        const fetchNote = async () => {
            if (!noteId) return;
            setIsLoading(true);
            initialLoad.current = true;
            try {
                const config = { headers: { Authorization: `Bearer ${auth.token}` } };
                const { data } = await axios.get(`http://localhost:3001/api/notes/${noteId}`, config);
                setNote(data);
                setSaveStatus('Saved');
            } catch (error) {
                console.error("Failed to fetch note", error);
                onClose();
            } finally {
                setIsLoading(false);
            }
        };
        fetchNote();
    }, [noteId, auth.token, onClose]);

    // 2. Auto-save functionality
    useEffect(() => {
        if (initialLoad.current) {
            initialLoad.current = false;
            return;
        }
        if (saveStatus === 'Saved') return;

        const timerId = setTimeout(() => {
            // 👉 Add a guard clause here to prevent saving with a null ID
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

    // 3. Handle input changes
    // const handleInputChange = (e) => {
    //     setSaveStatus('');
    //     const { name, value } = e.target;
    //     setNote(prevNote => ({ ...prevNote, [name]: value }));
    // };

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
            
            // Success! Refetch collaborators and clear input
            await fetchCollaborators();
            setEmail('');

        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to share note';
            setShareError(errorMsg);
            console.error(errorMsg);
        }
    };

    // --- 👇 NEW: Function to handle removing a collaborator ---
    const handleRemoveCollaborator = async (userIdToRemove) => {
        // Optimistic UI update: Remove user from state immediately
        setCollaborators(prev => prev.filter(c => c.user._id !== userIdToRemove));

        try {
            const config = { headers: { Authorization: `Bearer ${auth.token}` } };
            await axios.delete(`http://localhost:3001/api/notes/${noteId}/collaborators/${userIdToRemove}`, config);
        
        } catch (error) {
            console.error("Failed to remove collaborator", error);
            // On error, revert by refetching
            await fetchCollaborators();
        }
    };

    if (!noteId) return null;

    return (
        <div className="fixed inset-0 bg-black/20 z-40 flex justify-center items-center" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                {isLoading ? <div className="h-[60vh] flex items-center justify-center"><LoadingSpinner /></div> : (
                    <div className="p-6 flex flex-col h-[90vh]">
                        <div className="flex justify-between items-center mb-4 flex-shrink-0">
                            <input
                                type="text"
                                name="title"
                                value={note.title}
                                onChange={handleTitleChange}
                                className="w-full bg-transparent text-2xl font-bold text-white outline-none"
                                placeholder="Note Title"
                            />
                            
                            {/* --- Collaborators Icon & Dropdown --- */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(prev => !prev)}
                                    className="p-2 ml-2 rounded-full hover:bg-gray-700 text-gray-300 hover:text-white"
                                    title="View collaborators"
                                >
                                    <BsFillPeopleFill />
                                </button>
                                
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-96 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-10">
                                        <div className="p-4">
                                            <h4 className="font-semibold text-white text-lg">Collaborators</h4>
                                        </div>
                                        <ul className="py-2 max-h-48 overflow-y-auto border-t border-gray-700">
                                            {collaborators.map(meta => (
                                                <li key={meta.user._id} className="flex items-center gap-3 px-4 py-2 group">
                                                    <img 
                                                        src={meta.user.avatar || 'https://i.pravatar.cc/150'} 
                                                        alt={meta.user.name} 
                                                        className="w-9 h-9 rounded-full" 
                                                    />
                                                    <div className="flex-1 overflow-hidden">
                                                        <span className="text-sm font-medium text-white block truncate">{meta.user.name}</span>
                                                        <span className="text-xs text-gray-400 block truncate">{meta.user.email}</span>
                                                    </div>
                                                    <span className="ml-auto text-xs text-gray-400 capitalize">
                                                        {meta.role === 'owner' ? 'Owner' : 'Collaborator'}
                                                    </span>

                                                    {/* --- Remove Button (Show if I am owner AND this is not me) --- */}
                                                    {isMyNote && meta.role !== 'owner' && (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleRemoveCollaborator(meta.user._id); }}
                                                            className="p-1 rounded-full text-gray-500 hover:text-red-400 hover:bg-gray-700 opacity-0 group-hover:opacity-100"
                                                            title={`Remove ${meta.user.name}`}
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                        
                                        {/* --- Share Form (Show only if I am owner) --- */}
                                        {isMyNote && (
                                            <form onSubmit={handleShareNote} className="p-4 border-t border-gray-700">
                                                <label className="block text-sm font-medium text-gray-300 mb-2">Share with others</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="email"
                                                        value={email}
                                                        onChange={(e) => { setEmail(e.target.value); setShareError(''); }}
                                                        placeholder="Enter email"
                                                        className="flex-1 bg-gray-700 text-white rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                                        required
                                                    />
                                                    <button 
                                                        type="submit" 
                                                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md text-sm"
                                                    >
                                                        Share
                                                    </button>
                                                </div>
                                                {shareError && <p className="text-red-400 text-xs mt-2">{shareError}</p>}
                                            </form>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <Toolbar editor={editorInstance} />
                        {/* This wrapper correctly controls the editor's height and scrolling */}
                        <div className="flex-grow overflow-y-auto rounded-md border border-gray-700">
                            <TiptapEditor
                                content={note.content}
                                onChange={handleContentChange}
                                onEditorReady={setEditorInstance} // 👉 4. Get the editor instance
                            />
                        </div>
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700 flex-shrink-0">
                            <div className="flex items-center gap-4">
                                <span className="text-gray-500 text-sm italic">{saveStatus}</span>
                                <span className="text-gray-300 ml-5 text-sm">
                                    Last Edited: {new Date(note.updatedAt).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="flex items-center">
                                <button onClick={() => navigate(`/note/${noteId}`)} className="text-gray-400 hover:text-white mr-4 font-semibold">
                                    Expand
                                </button>
                                <button onClick={onClose} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NoteViewModal;