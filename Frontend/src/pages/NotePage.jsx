// Frontend/src/pages/NotePage.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import TiptapEditor from '../components/TiptapEditor';
import Toolbar from '../components/Toolbar';
import { ArrowLeft, CheckCircle2, Clock, AlertCircle, Cloud } from 'lucide-react';

const NotePage = () => {
    const { noteId } = useParams();
    const { auth } = useContext(AuthContext);
    const [note, setNote] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState('');
    const [editorInstance, setEditorInstance] = useState(null);

    const isInitialLoad = useRef(true);

    // Effect to fetch the note's data
    useEffect(() => {
        const fetchNote = async () => {
            isInitialLoad.current = true;
            setIsLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${auth.token}` } };
                const { data } = await axios.get(`http://localhost:3001/api/notes/${noteId}`, config);
                setNote(data);
                setSaveStatus('Saved');
            } catch (error) {
                console.error("Failed to fetch note", error);
            } finally {
                setIsLoading(false);
            }
        };
        if (auth) fetchNote();
    }, [noteId, auth]);

    // Effect for auto-saving the note
    useEffect(() => {
        if (isInitialLoad.current) {
            isInitialLoad.current = false;
            return;
        }
        if (saveStatus === 'Saved') return;

        const timerId = setTimeout(() => {
            if (note) {
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
                        console.error("Failed to auto-save note", error);
                    }
                };
                saveNote();
            }
        }, 1500);

        return () => clearTimeout(timerId);
    }, [note, noteId, auth.token, saveStatus]);

    const handleContentChange = (newContent) => {
        setSaveStatus('');
        setNote(prevNote => ({ ...prevNote, content: newContent }));
    };

    const handleTitleChange = (e) => {
        setSaveStatus('');
        setNote(prevNote => ({ ...prevNote, title: e.target.value }));
    };

    if (isLoading) {
        return (
            <div className="bg-gray-900 min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!note) {
        return (
            <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center text-white">
                <h2 className="text-2xl font-bold mb-4">Note not found</h2>
                <Link to="/dashboard" className="text-blue-500 hover:underline">Return to Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 min-h-screen text-white flex flex-col relative overflow-hidden">
            {/* --- Abstract Background Blobs --- */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-600 rounded-full filter blur-[150px] opacity-10 -translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-600 rounded-full filter blur-[150px] opacity-10 translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

            {/* --- Header Navigation --- */}
            <nav className="w-full px-6 py-3 border-b border-gray-800 bg-gray-900/80 backdrop-blur-md z-30 flex justify-between items-center sticky top-0">
                <Link 
                    to="/dashboard" 
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">Back to Dashboard</span>
                </Link>

                <div className="flex items-center gap-6 text-sm">
                    <div className={`flex items-center gap-2 font-medium uppercase tracking-wider transition-colors ${
                        saveStatus === 'Saved' ? 'text-emerald-500' : 
                        saveStatus === 'Error!' ? 'text-red-500' : 'text-blue-500'
                    }`}>
                        {saveStatus === 'Saved' ? <CheckCircle2 size={16} /> : 
                         saveStatus === 'Error!' ? <AlertCircle size={16} /> : 
                         <Cloud size={16} />}
                        {saveStatus || 'Unsaved'}
                    </div>
                    <div className="h-4 w-px bg-gray-700 hidden sm:block"></div>
                    <div className="hidden sm:flex items-center gap-2 text-gray-500">
                        <Clock size={16} />
                        <span>
                            Last edited {new Date(note.updatedAt).toLocaleDateString()} at {new Date(note.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                </div>
            </nav>

            {/* --- Main Editor Area --- */}
            <main className="flex-1 overflow-y-auto relative z-20 custom-scrollbar">
                <div className="max-w-5xl mx-auto border-x border-gray-800 min-h-full bg-gray-900/40 flex flex-col shadow-2xl shadow-black/20">
                    
                    {/* Title Section */}
                    <div className="px-12 pt-12 pb-6">
                        <input
                            type="text"
                            name="title"
                            value={note.title}
                            onChange={handleTitleChange}
                            className="w-full bg-transparent text-5xl font-bold text-white placeholder-gray-600 outline-none border-none p-0 focus:ring-0"
                            placeholder="Untitled Note"
                        />
                    </div>

                    {/* Sticky Toolbar within the document container */}
                    <div className="sticky top-0 z-40 px-12 py-4 bg-gray-900/95 backdrop-blur-xl border-y border-gray-800 transition-all">
                        <Toolbar editor={editorInstance} />
                    </div>

                    {/* Editor */}
                    <div className="px-12 py-8 flex-1">
                        <TiptapEditor
                            content={note.content}
                            onChange={handleContentChange}
                            onEditorReady={setEditorInstance}
                        />
                    </div>
                    
                    {/* Bottom Spacer */}
                    <div className="h-20"></div>
                </div>
            </main>
        </div>
    );
};

export default NotePage;