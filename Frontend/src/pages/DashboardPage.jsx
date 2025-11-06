// Frontend/src/pages/DashboardPage.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';
import NoteViewModal from '../components/NoteViewModal';
import { LuPalette } from "react-icons/lu";
import { TbUsersPlus } from "react-icons/tb";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoIosStar, IoIosStarOutline } from "react-icons/io";
import { RiInboxArchiveLine, RiDeleteBin6Line } from "react-icons/ri";
import ColorPalette from '../components/ColorPalette';
import NoteOptionsMenu from '../components/NoteOptionsMenu';
import AddLabelModal from '../components/AddLabelModal';
import { FaTrashRestoreAlt } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import Toast from '../components/Toast';

const DashboardPage = () => {
  const { isSidebarOpen } = useOutletContext();
  const { auth } = useContext(AuthContext);

  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allLabels, setAllLabels] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);

  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef(null);
  const [paletteState, setPaletteState] = useState({
    isOpen: false,
    noteId: null,
    position: { top: 0, left: 0 }
  });
  const [menuState, setMenuState] = useState({
    isOpen: false,
    noteId: null,
    position: { top: 0, left: 0 }
  });
  const [labelModalState, setLabelModalState] = useState({
    isOpen: false,
    note: null,
  });

  // eslint-disable-next-line no-unused-vars
  const [activeLabel, setActiveLabel] = useState(null);
  const [view, setView] = useState('notes');

  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    noteToUndo: null,
    hideTimer: null,
  });

  const handleCloseToast = () => {
    if (toast.hideTimer) {
      clearTimeout(toast.hideTimer);
    }
    // Make sure to clear all properties
    setToast({ isVisible: false, message: '', undoData: null, hideTimer: null, undoType: null });
  };

  // This is the "Undo" function
  const handleUndo = async () => {
    // 1. Get all data from the toast state
    const { undoData: noteToRestore, hideTimer, undoType } = toast;

    if (!noteToRestore || !hideTimer) return;

    // 2. Stop the "hide" timer
    clearTimeout(hideTimer);

    // 3. Optimistic UI: Put the note back in the list
    setNotes(prevNotes => [noteToRestore, ...prevNotes]);

    // 4. Hide the toast immediately
    setToast({ isVisible: false, message: '', undoData: null, hideTimer: null, undoType: null });

    // 5. Fire the correct REVERSAL API call based on the undoType
    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } };

      if (undoType === 'archive') {
        // Logic from old handleUndoArchive
        await axios.put(`http://localhost:3001/api/notes/${noteToRestore._id}`, {
          isArchived: noteToRestore.isArchived // Reverts to its original state
        }, config);
      } else if (undoType === 'bin') {
        // Logic to un-bin the note
        await axios.put(`http://localhost:3001/api/notes/${noteToRestore._id}`, {
          isBinned: false // Restore it
        }, config);
      }
    } catch (error) {
      console.error(`Failed to undo ${undoType}`, error);
      fetchNotes(); // Refetch if the reversal fails
    }
  };
  const filteredNotes = view === 'notes' || view === 'archive'
    ? notes
    : notes.filter(note => note.labels.includes(view));

  const fetchNotes = (query = '') => {
    setIsLoading(true);
    const config = { headers: { Authorization: `Bearer ${auth.token}` } };

    let apiUrl = `http://localhost:3001/api/notes?search=${query}`;

    if (view === 'notes') {
      apiUrl += '&archived=false';
    } else if (view === 'archive') {
      apiUrl += '&archived=true';
    } else if (view === 'favorites') { // 👈 ADD THIS BLOCK
      apiUrl += '&favorited=true';
    } else if (view === 'bin') { // --- ADD THIS BLOCK ---
      apiUrl += '&bin=true';
    }

    axios.get(apiUrl, config)
      .then(res => setNotes(res.data))
      .catch(error => console.error('Error fetching notes:', error))
      .finally(() => setIsLoading(false));
  };

  const handleToggleFavorite = async (event, note) => {
    event.stopPropagation(); // Prevent opening the note modal
    const newFavoriteStatus = !note.isFavorited;

    // Optimistic UI update for instant feedback
    setNotes(notes.map(n =>
      n._id === note._id ? { ...n, isFavorited: newFavoriteStatus } : n
    ));

    // Fire the API call
    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } };
      await axios.put(`http://localhost:3001/api/notes/${note._id}`, { isFavorited: newFavoriteStatus }, config);
    } catch (error) {
      console.error('Failed to update favorite status', error);
      // On error, revert the change by refetching
      fetchNotes();
    }
  };

  const handleMoveToBin = async (note) => {
    if (!note) return;

    // 1. Optimistic UI: Remove note from view
    setNotes(notes.filter(n => n._id !== note._id));
    handleCloseMenu();

    // 2. Clear any previous "hide" timer
    if (toast.hideTimer) {
      clearTimeout(toast.hideTimer);
    }

    // 3. Fire API call
    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } };
      await axios.put(`http://localhost:3001/api/notes/${note._id}`, { isBinned: true }, config);
    } catch (error) {
      console.error('Failed to move to bin', error);
      fetchNotes(); // Revert on error
      return;
    }

    // 4. Set a timer to HIDE the toast
    const timerId = setTimeout(() => {
      setToast({ isVisible: false, message: '', undoData: null, hideTimer: null, undoType: null });
    }, 5000);

    // 5. Show the toast
    setToast({
      isVisible: true,
      message: 'Note moved to bin',
      undoData: note, // Store the original note to allow undo
      hideTimer: timerId,
      undoType: 'bin' // <-- Set the type!
    });
  };

  const handleRestoreNote = async (note) => {
    if (!note) return;

    // 1. Optimistic UI: Remove from bin view
    setNotes(notes.filter(n => n._id !== note._id));

    // 2. Fire API call
    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } };
      await axios.put(`http://localhost:3001/api/notes/${note._id}`, { isBinned: false }, config);
    } catch (error) {
      console.error('Failed to restore note', error);
      fetchNotes(); // Revert on error
    }
  };

  useEffect(() => {
    if (auth) {
      const fetchAllNotesForLabels = async () => {
        const config = { headers: { Authorization: `Bearer ${auth.token}` } };
        // New backend logic fetches ALL notes when 'archived' is omitted
        const { data } = await axios.get(`http://localhost:3001/api/notes`, config);
        const uniqueLabels = [...new Set(data.flatMap(note => note.labels))];
        setAllLabels(uniqueLabels);
      };
      fetchAllNotesForLabels();
      fetchNotes(); // Fetch notes for the current view
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, view]);

  const handleShareNote = async (event, noteId) => {
    event.stopPropagation(); // Stop the note modal from opening

    const email = prompt("Enter the email of the user you want to share this note with:");
    if (!email) {
      return; // User cancelled
    }

    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } };
      const { data } = await axios.post(`http://localhost:3001/api/notes/${noteId}/share`, { email }, config);

      // Simple success toast (using your existing toast state)
      const timerId = setTimeout(() => {
        setToast({ isVisible: false, message: '', undoData: null, hideTimer: null, undoType: null });
      }, 3000);
      setToast({
        isVisible: true,
        message: data.message,
        undoData: null,
        hideTimer: timerId,
        undoType: null
      });

    } catch (error) {
      console.error('Failed to share note', error);
      // Error toast
      const errorMsg = error.response?.data?.message || 'Failed to share note';
      const timerId = setTimeout(() => {
        setToast({ isVisible: false, message: '', undoData: null, hideTimer: null, undoType: null });
      }, 3000);
      setToast({
        isVisible: true,
        message: errorMsg,
        undoData: null,
        hideTimer: timerId,
        undoType: null
      });
    }
  };

  const handleOpenLabelModal = (note) => {
    setMenuState({ isOpen: false }); // Close the options menu
    setLabelModalState({ isOpen: true, note: note });
  };

  const handleCloseLabelModal = () => {
    setLabelModalState({ isOpen: false, note: null });
  };

  const handleSaveLabels = async (newLabels) => {
    const noteId = labelModalState.note._id;
    if (!noteId) return;

    // Optimistic UI update
    setNotes(notes.map(n => (n._id === noteId ? { ...n, labels: newLabels } : n)));

    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } };
      await axios.put(`http://localhost:3001/api/notes/${noteId}`, { labels: newLabels }, config);
    } catch (error) {
      console.error('Failed to save labels', error);
      fetchNotes(); // Revert on error
    }
  };

  useEffect(() => {
    if (auth) {
      fetchNotes();
    }
  }, [auth, view]);

  useEffect(() => {
    if (searchTerm === '' && notes.length === 0) {
      return; // Don't search on the very first render
    }

    const timerId = setTimeout(() => {
      fetchNotes(searchTerm);
    }, 500);

    return () => clearTimeout(timerId);
  }, [searchTerm, auth]);

  useEffect(() => {
    // Only try to focus if the user has typed a search term
    if (searchTerm && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [notes]);

  const handleCreateNote = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${auth.token}` } };
            const { data } = await axios.post('http://localhost:3001/api/notes', {}, config);
            // Don't add to notes state immediately, let fetchNotes handle it after modal closes
            setSelectedNoteId(data._id); // Open the new note in the modal
        } catch (error) {
            console.error('Error creating note:', error);
            // Optionally show an error toast
        }
    };

  const handleToggleArchive = async (event, note) => {
    event.stopPropagation();
    const newArchivedStatus = !note.isArchived;

    setNotes(notes.filter(n => n._id !== note._id));
    if (toast.hideTimer) clearTimeout(toast.hideTimer);

    try {
      // ... (your existing API call is correct)
      const config = { headers: { Authorization: `Bearer ${auth.token}` } };
      await axios.put(`http://localhost:3001/api/notes/${note._id}`, { isArchived: newArchivedStatus }, config);
    } catch (error) {
      // ... (your existing error handling is correct)
      console.error('Failed to update archive status', error);
      fetchNotes();
      return;
    }

    // 4. Set a timer to HIDE the toast
    const timerId = setTimeout(() => {
      // --- UPDATE THIS LINE ---
      setToast({ isVisible: false, message: '', undoData: null, hideTimer: null, undoType: null });
    }, 5000);

    // 5. Show the toast
    // --- UPDATE THIS OBJECT ---
    setToast({
      isVisible: true,
      message: newArchivedStatus ? 'Note archived' : 'Note un-archived',
      undoData: note, // Changed from 'noteToUndo'
      hideTimer: timerId,
      undoType: 'archive' // <-- Set the type!
    });
  };

  // --- Delete Logic ---
  const openDeleteModal = (noteId) => {
    setNoteToDelete(noteId);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setNoteToDelete(null);
    setIsModalOpen(false);
  };

  const confirmDeleteNote = async () => {
    if (!noteToDelete) return;
    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } };
      await axios.delete(`http://localhost:3001/api/notes/${noteToDelete}`, config);
      setNotes(notes.filter((note) => note._id !== noteToDelete));
    } catch (error) {
      console.error('Error deleting note:', error);
    } finally {
      closeDeleteModal();
    }
  };

  const handleOpenPalette = (event, noteId) => {
    event.stopPropagation(); // Prevent opening the note modal
    const rect = event.currentTarget.getBoundingClientRect();
    setPaletteState({
      isOpen: true,
      noteId: noteId,
      position: { top: rect.bottom + 8, left: rect.left - 100 },
    });
  };

  const handleClosePalette = () => {
    setPaletteState({ isOpen: false, noteId: null, position: { top: 0, left: 0 } });
  };

  const handleSelectColor = async (color) => {
    const noteId = paletteState.noteId;
    if (!noteId) return;

    // Optimistic UI update for instant feedback
    setNotes(notes.map(n => (n._id === noteId ? { ...n, color } : n)));
    handleClosePalette();

    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } };
      await axios.put(`http://localhost:3001/api/notes/${noteId}`, { color }, config);
    } catch (error) {
      console.error('Failed to update color', error);
      // Optional: Revert the change on error
      fetchNotes();
    }
  };

  const handleOpenMenu = (event, noteId) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuState({
      isOpen: true,
      noteId: noteId,
      position: { top: rect.bottom + 8, left: rect.left - 100 }
    });
  };

  const handleCloseMenu = () => {
    setMenuState({ isOpen: false, noteId: null, position: { top: 0, left: 0 } });
  };

  const handleCopyNote = async () => {
    const noteId = menuState.noteId;
    if (!noteId) return;

    handleCloseMenu(); // Close the menu immediately
    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } };
      const { data } = await axios.post(`http://localhost:3001/api/notes/${noteId}/copy`, {}, config);
      // Add the new copy to the top of the list for instant feedback
      setNotes(prevNotes => [data, ...prevNotes]);
    } catch (error) {
      console.error('Failed to copy note', error);
    }
  };

  let pageTitle = 'My Notes'; // Default title
  if (view === 'favorites') {
    pageTitle = 'Favorites';
  } else if (view === 'archive') {
    pageTitle = 'Archive';
  } else if (view === 'bin') {
    pageTitle = 'Bin';
  } else if (view !== 'notes') {
    // If it's not notes, favorites, archive, or bin, it must be a label
    pageTitle = `# ${view}`;
  }

  if (isLoading) return <LoadingSpinner />;

  return (
    <>
      <div
        className={`flex h-[calc(100vh-64px)] overflow-x-hidden transition-all duration-300 ${isModalOpen || selectedNoteId ? 'blur-sm' : ''
          } bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b]`}
      >
        {/* Sidebar */}
        <aside
          className={`bg-[#0b1120] border-r border-gray-800 flex-shrink-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64 p-5' : 'w-20 py-5' // Change width and padding
            }`}
        >
          {/* <h2 className={`text-lg font-semibold text-gray-300 mb-6 ${isSidebarOpen ? 'block' : 'hidden'}`}>
            Workspace
          </h2> */}

          <nav className="space-y-2">
            {/* 👉 This is the main change */}
            <button
              onClick={() => setView('notes')}
              className={`w-full flex items-center py-2 h-11 text-white font-medium transition duration-100 ${isSidebarOpen
                ? // Styles when sidebar is OPEN
                `rounded-lg ${view === 'notes' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'hover:bg-gray-700'}`
                : // Styles when sidebar is CLOSED (icons only)
                `rounded-full ${view === 'notes' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 p-2' : 'hover:bg-gray-700 p-2'}`
                } ${isSidebarOpen ? 'px-3 gap-3' : 'justify-center'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h.01a1 1 0 100-2H10zm3 0a1 1 0 000 2h.01a1 1 0 100-2H13z"
                  clipRule="evenodd"
                />
              </svg>
              <span className={isSidebarOpen ? 'inline' : 'hidden'}>All Notes</span>
            </button>

            <button
              onClick={() => setView('favorites')}
              className={`w-full flex items-center py-2 h-11 text-white font-medium transition duration-100 ${isSidebarOpen
                ? `rounded-lg ${view === 'favorites' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'hover:bg-gray-700'}`
                : `rounded-full ${view === 'favorites' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 p-2' : 'hover:bg-gray-700 p-2'}`
                } ${isSidebarOpen ? 'px-3 gap-3' : 'justify-center'}`}
            >
              <IoIosStarOutline className="h-5 w-5 flex-shrink-0" />
              <span className={isSidebarOpen ? 'inline' : 'hidden'}>Favorites</span>
            </button>

            <button
              onClick={() => setView('archive')}
              className={`w-full flex items-center py-2 h-11 text-white font-medium transition duration-100 ${isSidebarOpen
                ? `rounded-lg ${view === 'archive' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'hover:bg-gray-700'}`
                : `rounded-full ${view === 'archive' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 p-2' : 'hover:bg-gray-700 p-2'}`
                } ${isSidebarOpen ? 'px-3 gap-3' : 'justify-center'}`}
            >
              <RiInboxArchiveLine className="h-5 w-5 flex-shrink-0" />
              <span className={isSidebarOpen ? 'inline' : 'hidden'}>Archive</span>
            </button>

            <button
              onClick={() => setView('bin')}
              className={`w-full flex items-center py-2 h-11 text-white font-medium transition duration-100 ${isSidebarOpen
                ? `rounded-lg ${view === 'bin' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'hover:bg-gray-700'}`
                : `rounded-full ${view === 'bin' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 p-2' : 'hover:bg-gray-700 p-2'}`
                } ${isSidebarOpen ? 'px-3 gap-3' : 'justify-center'}`}
            >
              <RiDeleteBin6Line className="h-5 w-5 flex-shrink-0" />
              <span className={isSidebarOpen ? 'inline' : 'hidden'}>Bin</span>
            </button>
          </nav>

          <div className={`mt-8 ${isSidebarOpen ? 'block' : 'hidden'}`}>
            <h3 className="text-sm font-semibold text-gray-400 mb-2 px-3">Labels</h3>
            <nav className="space-y-1">
              {allLabels.map(label => (
                <button
                  key={label}
                  onClick={() => setView(label)}
                  // 👉 This is the line to change
                  className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-white font-medium transition duration-100 ${view === label ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'hover:bg-gray-700'}`}
                >
                  <span># {label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full overflow-y-auto p-10 px-15 transition-all duration-300 ease-in-out">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              {pageTitle} {/* Use the dynamic title */}
            </h1>
            {view === 'notes' && (
              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-[#0f172a] border border-gray-700 text-gray-200 placeholder-gray-400 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                  <svg
                    className="w-5 h-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Create Button */}
                <button
                  onClick={handleCreateNote}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 px-5 rounded-lg flex items-center gap-2 shadow-md transition duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Create Note</span>
                </button>
              </div>
            )}
          </div>

          {/* Notes Grid */}
          {view === 'bin' ? (
            // --- BIN VIEW ---
            notes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map((note) => (
                  <div
                    key={note._id}
                    style={{ backgroundColor: note.color }}
                    className="group border border-white/20 p-5 rounded-xl transition-all duration-300 relative"
                  >
                    <h3 className="font-bold text-lg text-white mb-2 truncate">{note.title}</h3>
                    <div
                      className="text-white text-sm mb-4 h-10 overflow-hidden prose prose-invert prose-p:my-0"
                      dangerouslySetInnerHTML={{ __html: note.content || '...' }}
                    />
                    {/* Bin-specific actions */}
                    <div className="mt-4 flex items-center gap-4">
                      <button
                        onClick={() => handleRestoreNote(note)}
                        className="p-2 text-gray-300 rounded-full hover:bg-gray-600 transition-all duration-200"
                      >
                        <FaTrashRestoreAlt />
                      </button>


                      <button
                        onClick={() => openDeleteModal(note._id)}
                        className="p-2 text-gray-300 rounded-full hover:bg-gray-600 transition-all duration-200"
                      >
                        <MdDeleteForever className="text-xl" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center mt-20">
                <h2 className="text-2xl font-semibold text-white">Your bin is empty</h2>
                <p className="text-gray-400 mt-2">Notes you move to the bin will appear here.</p>
              </div>
            )
          ) : view === 'favorites' ? (            // FAVORITES VIEW LOGIC
            (() => {
              const favoritedUnarchived = notes.filter(note => note.isFavorited && !note.isArchived);
              const favoritedArchived = notes.filter(note => note.isFavorited && note.isArchived);

              return favoritedUnarchived.length > 0 || favoritedArchived.length > 0 ? (
                <div>
                  {/* --- Unarchived Favorited Notes --- */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoritedUnarchived.map((note) => (
                      <div
                        key={note._id}
                        style={{ backgroundColor: note.color }}
                        className="group backdrop-blur-sm border border-white/20 p-5 rounded-xl hover:border-white/50 transition-all duration-300 relative cursor-pointer"
                        onClick={() => setSelectedNoteId(note._id)}
                      >
                        {/* Delete button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); openDeleteModal(note._id); }}
                          className="absolute top-3 right-4 text-white/90 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                          </svg>
                        </button>

                        {/* Note content */}
                        <h3 className="font-bold text-lg text-white mb-2 truncate">{note.title}</h3>
                        <div
                          className="text-white text-sm mb-4 h-10 overflow-hidden prose prose-invert prose-p:my-0 prose-headings:my-1"
                          dangerouslySetInnerHTML={{ __html: note.content || 'No content yet...' }}
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                          {note.labels.map(label => (
                            <span key={label} className="bg-white/10 text-xs text-gray-300 px-2 py-0.5 rounded-full">
                              {label}
                            </span>
                          ))}
                        </div>

                        {/* Hover toolbar */}
                        <div
                          className={`absolute bottom-3 right-3 flex items-center gap-2 transition-opacity duration-300 ${(menuState.isOpen && menuState.noteId === note._id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}
                        >
                          <button onClick={(e) => handleOpenPalette(e, note._id)} className="p-1.5 rounded-full hover:bg-white/10">
                            <LuPalette />
                          </button>
                          <button onClick={(e) => handleShareNote(e, note._id)} className="p-1.5 rounded-full hover:bg-white/10">
                            <TbUsersPlus />
                          </button>
                          <button
                            onClick={(e) => handleToggleFavorite(e, note)}
                            className="p-1.5 rounded-full hover:bg-white/10"
                          >
                            {note.isFavorited ? <IoIosStar className="text-yellow-400" /> : <IoIosStarOutline />}
                          </button>
                          <button
                            onClick={(e) => handleToggleArchive(e, note)}
                            className="p-1.5 rounded-full hover:bg-white/10"
                          >
                            <RiInboxArchiveLine />
                          </button>
                          <button
                            onClick={(e) => handleOpenMenu(e, note._id)}
                            className="p-1.5 rounded-full hover:bg-white/10"
                          >
                            <BsThreeDotsVertical />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* --- Archived Favorites Section --- */}
                  {favoritedArchived.length > 0 && (
                    <>
                      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-12 mb-4">
                        Archive
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favoritedArchived.map((note) => (
                          <div
                            key={note._id}
                            style={{ backgroundColor: note.color }}
                            className="group backdrop-blur-sm border border-white/20 p-5 rounded-xl hover:border-white/50 transition-all duration-300 relative cursor-pointer"
                            onClick={() => setSelectedNoteId(note._id)}
                          >
                            {/* Delete button */}
                            <button
                              onClick={(e) => { e.stopPropagation(); openDeleteModal(note._id); }}
                              className="absolute top-3 right-4 text-white/90 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                              </svg>
                            </button>

                            {/* Note content */}
                            <h3 className="font-bold text-lg text-white mb-2 truncate">{note.title}</h3>
                            <div
                              className="text-white text-sm mb-4 h-10 overflow-hidden prose prose-invert prose-p:my-0 prose-headings:my-1"
                              dangerouslySetInnerHTML={{ __html: note.content || 'No content yet...' }}
                            />
                            <div className="flex flex-wrap gap-2 mt-2">
                              {note.labels.map(label => (
                                <span key={label} className="bg-white/10 text-xs text-gray-300 px-2 py-0.5 rounded-full">
                                  {label}
                                </span>
                              ))}
                            </div>

                            {/* Hover toolbar */}
                            <div
                              className={`absolute bottom-3 right-3 flex items-center gap-2 transition-opacity duration-300 ${(menuState.isOpen && menuState.noteId === note._id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                }`}
                            >
                              <button onClick={(e) => handleOpenPalette(e, note._id)} className="p-1.5 rounded-full hover:bg-white/10">
                                <LuPalette />
                              </button>
                              <button onClick={(e) => handleShareNote(e, note._id)} className="p-1.5 rounded-full hover:bg-white/10">
                                <TbUsersPlus />
                              </button>
                              <button
                                onClick={(e) => handleToggleFavorite(e, note)}
                                className="p-1.5 rounded-full hover:bg-white/10"
                              >
                                {note.isFavorited ? <IoIosStar className="text-yellow-400" /> : <IoIosStarOutline />}
                              </button>
                              <button
                                onClick={(e) => handleToggleArchive(e, note)}
                                className="p-1.5 rounded-full hover:bg-white/10"
                              >
                                <RiInboxArchiveLine />
                              </button>
                              <button
                                onClick={(e) => handleOpenMenu(e, note._id)}
                                className="p-1.5 rounded-full hover:bg-white/10"
                              >
                                <BsThreeDotsVertical />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center mt-20">
                  <h2 className="text-2xl font-semibold text-white">No favorited notes</h2>
                  <p className="text-gray-400 mt-2">Click the star on a note to add it here.</p>
                </div>
              );
            })()
          ) : (
            // DEFAULT VIEW LOGIC
            filteredNotes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNotes.map((note) => (
                  <div
                    key={note._id}
                    style={{ backgroundColor: note.color }}
                    className="group backdrop-blur-sm border border-white/20 p-5 rounded-xl hover:border-white/50 transition-all duration-300 relative cursor-pointer"
                    onClick={() => setSelectedNoteId(note._id)}
                  >
                    {/* Delete button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); openDeleteModal(note._id); }}
                      className="absolute top-3 right-4 text-white/90 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {/* Note content */}
                    <h3 className="font-bold text-lg text-white mb-2 truncate">{note.title}</h3>
                    <div
                      className="text-white text-sm mb-4 h-10 overflow-hidden prose prose-invert prose-p:my-0 prose-headings:my-1"
                      dangerouslySetInnerHTML={{ __html: note.content || 'No content yet...' }}
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {note.labels.map(label => (
                        <span key={label} className="bg-white/10 text-xs text-gray-300 px-2 py-0.5 rounded-full">
                          {label}
                        </span>
                      ))}
                    </div>

                    {/* Hover toolbar */}
                    <div
                      className={`absolute bottom-3 right-3 flex items-center gap-2 transition-opacity duration-300 ${(menuState.isOpen && menuState.noteId === note._id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                    >
                      <button onClick={(e) => handleOpenPalette(e, note._id)} className="p-1.5 rounded-full hover:bg-white/10">
                        <LuPalette />
                      </button>
                      <button onClick={(e) => handleShareNote(e, note._id)} className="p-1.5 rounded-full hover:bg-white/10">
                        <TbUsersPlus />
                      </button>
                      <button
                        onClick={(e) => handleToggleFavorite(e, note)}
                        className="p-1.5 rounded-full hover:bg-white/10"
                      >
                        {note.isFavorited ? <IoIosStar className="text-yellow-400" /> : <IoIosStarOutline />}
                      </button>
                      <button
                        onClick={(e) => handleToggleArchive(e, note)}
                        className="p-1.5 rounded-full hover:bg-white/10"
                      >
                        <RiInboxArchiveLine />
                      </button>
                      <button
                        onClick={(e) => handleOpenMenu(e, note._id)}
                        className="p-1.5 rounded-full hover:bg-white/10"
                      >
                        <BsThreeDotsVertical />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center mt-20">
                {view === 'archive' ? (
                  <>
                    <h2 className="text-2xl font-semibold text-white">No Notes in Archive</h2>
                    <p className="text-gray-400 mt-2">Archived notes will appear here.</p>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-semibold text-white">No Notes Yet!</h2>
                    <p className="text-gray-400 mt-2 mb-6">Start capturing your ideas beautifully 💡</p>
                    <button
                      onClick={handleCreateNote}
                      className="text-gray-500 font-bold py-2 px-5 text-2xl hover:text-gray-400 cursor-pointer"
                    >
                      <span>Create Note</span>
                    </button>
                  </>
                )}
              </div>
            )
          )}
        </main>
      </div>

      {/* Modals */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteNote}
        message="Are you sure you want to permanently delete this note?"
      />

      <AnimatePresence>
        {selectedNoteId && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          >
            <motion.div
              key="modal"
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              transition={{
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1],
              }}
              className="w-full max-w-3xl mx-auto"
            >
              <NoteViewModal
                noteId={selectedNoteId}
                onClose={() => {
                  setSelectedNoteId(null);
                  fetchNotes();
                }}
              />
            </motion.div>
          </motion.div>
        )}
        <AnimatePresence>
          {menuState.isOpen && (
            <NoteOptionsMenu
              onClose={handleCloseMenu}
              onCopy={handleCopyNote}
              // Pass the current note to the "Add label" handler
              onAddLabel={() => handleOpenLabelModal(notes.find(n => n._id === menuState.noteId))}
              onMoveToBin={() => handleMoveToBin(notes.find(n => n._id === menuState.noteId))}
              position={menuState.position}
            />
          )}
        </AnimatePresence>
        {labelModalState.isOpen && (
          <AddLabelModal
            existingLabels={labelModalState.note.labels}
            onClose={handleCloseLabelModal}
            onSave={handleSaveLabels}
          />
        )}
      </AnimatePresence>
      {paletteState.isOpen && (
        <ColorPalette
          onSelect={handleSelectColor}
          onClose={handleClosePalette}
          position={paletteState.position}
        />
      )}
      <Toast
        isOpen={toast.isVisible}
        message={toast.message}
        onUndo={handleUndo} // <-- CHANGE THIS from handleUndoArchive to handleUndo
        onClose={handleCloseToast}
      />
    </>
  );

};

export default DashboardPage;
