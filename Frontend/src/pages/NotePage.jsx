import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import TiptapEditor from '../components/TiptapEditor';
import Toolbar from '../components/Toolbar';
import { ArrowLeft, CheckCircle2, Clock, AlertCircle, Cloud, MoreHorizontal } from 'lucide-react';

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
        <div className="bg-gray-900 min-h-screen text-gray-100 flex flex-col relative selection:bg-blue-500/30 selection:text-blue-200">

            {/* --- FIX START --- */}
            {/* Wrapper for the absolute positioned glows to contain their overflow */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-yellow-400 rounded-full filter blur-3xl opacity-20"></div>
                <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-96 h-96 bg-red-500 rounded-full filter blur-3xl opacity-20"></div>
            </div>
            {/* --- FIX END --- */}

            {/* --- Header (Minimalist) --- */}
            <header className="sticky top-0 z-50 w-full bg-gray-900/80 backdrop-blur-md border-b border-gray-800 px-6 h-14 flex justify-between items-center">
                <Link
                    to="/dashboard"
                    className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <div className="p-1.5 rounded-md group-hover:bg-white/10 transition-colors">
                        <ArrowLeft size={18} />
                    </div>
                    <span className="font-medium text-sm">Dashboard</span>
                </Link>

                <div className="flex items-center gap-4 text-xs font-medium">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700 transition-colors ${saveStatus === 'Saved' ? 'text-emerald-400' :
                        saveStatus === 'Error!' ? 'text-red-400' : 'text-blue-400'
                        }`}>
                        {saveStatus === 'Saved' ? <CheckCircle2 size={12} /> :
                            saveStatus === 'Error!' ? <AlertCircle size={12} /> :
                                <Cloud size={12} />}
                        {saveStatus || 'Unsaved'}
                    </div>
                    <button className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition">
                        <MoreHorizontal size={18} />
                    </button>
                </div>
            </header>

            {/* --- Main Content --- */}
            <main className="flex-1 relative w-full max-w-4xl mx-auto px-6 md:px-12 py-12">

                {/* Sticky Toolbar (Floating Pill) */}
                <div className="sticky top-20 z-40 mb-12 flex justify-center pointer-events-none">
                    <div className="pointer-events-auto bg-gray-800/90 backdrop-blur-xl border border-gray-700 rounded-full shadow-2xl shadow-black/50 px-6 py-2 flex items-center justify-center gap-2 transition-all hover:border-gray-600">
                        <Toolbar editor={editorInstance} />
                    </div>
                </div>

                {/* Document Area */}
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Title Input */}
                    <input
                        type="text"
                        name="title"
                        value={note.title}
                        onChange={handleTitleChange}
                        // I added 'caret-white' to the end of this className string below
                        className="w-full bg-transparent text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-white placeholder-gray-700 outline-none border-none p-0 focus:ring-0 leading-tight caret-white"
                        placeholder="Untitled"
                    />

                    {/* Metadata */}
                    <div className="flex items-center gap-3 text-gray-500 text-sm mb-8">
                        <span className="flex items-center gap-1.5">
                            <Clock size={14} />
                            {new Date(note.updatedAt).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>{note.content ? note.content.split(' ').length : 0} words</span>
                    </div>

                    <div className='border-t border-gray-700'></div>

                    {/* Editor */}
                    <div className="min-h-[50vh] pb-32">
                        <TiptapEditor
                            content={note.content}
                            onChange={handleContentChange}
                            onEditorReady={setEditorInstance}
                        />
                    </div>
                </div>

            </main>

            {/* Original Background Gradients (moved inside the new wrapper) */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px] opacity-40"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px] opacity-40"></div>
            </div>
        </div>
    );
};

export default NotePage;