// Frontend/src/pages/NotePage.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import TiptapEditor from '../components/TiptapEditor';
import Toolbar from '../components/Toolbar';

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
                setSaveStatus('Saved'); // Initial status is saved
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
        if (saveStatus === 'Saved') return; // Don't save if already saved

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
        setSaveStatus(''); // Clear status to indicate unsaved changes
        setNote(prevNote => ({ ...prevNote, content: newContent }));
    };

    const handleTitleChange = (e) => {
        setSaveStatus('');
        setNote(prevNote => ({ ...prevNote, title: e.target.value }));
    };

    // When user types, clear the 'Saved' status
    // const handleInputChange = (e) => {
    //     setSaveStatus(''); // Clear status to indicate unsaved changes
    //     const { name, value } = e.target;
    //     setNote(prevNote => ({ ...prevNote, [name]: value }));
    // };

    if (isLoading) {
        return <div className="bg-gray-900 min-h-screen"><LoadingSpinner /></div>;
    }

    if (!note) {
        return <div className="bg-gray-900 text-white text-center py-20">Note not found.</div>;
    }

    return (
        <div className="bg-gray-900 min-h-screen text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <Link to="/dashboard" className="text-indigo-400 hover:text-indigo-300">&larr; Back to Dashboard</Link>
                    <span className="text-gray-500 text-sm italic">{saveStatus}</span>
                </div>
                <Toolbar editor={editorInstance} />
                <input
                    type="text"
                    name="title"
                    value={note.title}
                    onChange={handleTitleChange}
                    className="w-full bg-transparent text-4xl font-bold outline-none mb-4 border-b-2 border-gray-700 focus:border-indigo-500 transition"
                    placeholder="Note Title"
                />
                {/* Replace the textarea with the TiptapEditor component */}
                <TiptapEditor
                    content={note.content}
                    onChange={handleContentChange}
                    onEditorReady={setEditorInstance} // 👉 Get the editor instance from the child
                />
            </div>
        </div>
    );
};

export default NotePage;