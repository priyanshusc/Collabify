import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import TiptapEditor from './TiptapEditor';
import Toolbar from './Toolbar';

const NoteViewModal = ({ noteId, onClose }) => {
    // All your existing state, useEffects, and handler functions are correct.
    const { auth } = useContext(AuthContext);
    const [note, setNote] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState('');
    const [editorInstance, setEditorInstance] = useState(null);

    const initialLoad = useRef(true);
    const navigate = useNavigate();

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

    if (!noteId) return null;

    return (
        <div className="fixed inset-0 bg-black/20 z-40 flex justify-center items-center" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                {isLoading ? <div className="h-[60vh] flex items-center justify-center"><LoadingSpinner /></div> : (
                    <div className="p-6 flex flex-col h-[90vh]">
                        <input
                            type="text"
                            name="title"
                            value={note.title}
                            onChange={handleTitleChange}
                            className="w-full bg-transparent text-2xl font-bold text-white outline-none mb-4 flex-shrink-0"
                            placeholder="Note Title"
                        />
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