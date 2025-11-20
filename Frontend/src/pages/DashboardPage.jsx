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
import ShareNoteModal from '../components/ShareNoteModal';

// ✅ FIX: Define NoteCard OUTSIDE the main component so it doesn't remount on every render
const NoteCard = ({ 
  note, 
  isBin, 
  menuState, 
  onSelect, 
  onRestore, 
  onDelete, 
  onPalette, 
  onShare, 
  onFavorite, 
  onArchive, 
  onMenu 
}) => (
  <div
    key={note._id}
    style={{ backgroundColor: note.color }}
    className="group backdrop-blur-sm border border-white/5 p-3 md:p-4 rounded-2xl hover:shadow-xl transition-all duration-300 relative cursor-pointer flex flex-col h-64"
    onClick={() => !isBin && onSelect(note._id)}
  >
    {/* Content Wrapper */}
    <div className="flex-1 overflow-hidden">
      <h3 className="font-bold text-lg md:text-xl text-white mb-2 md:mb-3 truncate">{note.title}</h3>
      <div
        // 👉 Added [&_li::marker]:text-white to force bullet points to be white
        className="text-gray-200 text-xs md:text-sm mb-4 h-[calc(100%-3rem)] overflow-hidden prose prose-invert prose-p:my-0 prose-headings:my-1 prose-ul:list-disc prose-ol:list-decimal prose-ul:pl-4 prose-ol:pl-4 [&_li::marker]:text-white leading-relaxed"
        dangerouslySetInnerHTML={{ __html: note.content || '<span class="italic opacity-50">No content yet...</span>' }}
      />
    </div>

    {/* Labels */}
    <div className="flex flex-wrap gap-2 mt-2 mb-8">
      {note.labels.map(label => (
        <span key={label} className="bg-black/20 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-white/80 px-2 py-1 rounded-md">
          {label}
        </span>
      ))}
    </div>

    {/* Bin Actions */}
    {isBin ? (
      <div className="absolute bottom-4 right-4 flex items-center gap-3">
        <button
          onClick={(e) => { e.stopPropagation(); onRestore(note); }}
          className="p-2 text-gray-300 bg-black/20 hover:bg-black/40 rounded-full transition-all duration-200"
          title="Restore"
        >
          <FaTrashRestoreAlt />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(note._id); }}
          className="p-2 text-red-400 bg-black/20 hover:bg-red-500/20 rounded-full transition-all duration-200"
          title="Delete Permanently"
        >
          <MdDeleteForever className="text-xl" />
        </button>
      </div>
    ) : (
      /* Standard Actions (Hover Toolbar) */
      <>
        {/* Delete button (Quick Action) - Hidden on mobile until long press/hover logic is handled, or rely on menu */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(note._id); }}
          className="absolute top-4 right-4 text-white/60 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity z-10 p-1 rounded-md hover:bg-black/10 hidden md:block"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Toolbar */}
        <div
            className={`absolute bottom-4 right-4 flex items-center justify-between transition-all duration-300 ${
              (menuState.isOpen && menuState.noteId === note._id) ? 'opacity-100' : 'opacity-100 md:opacity-0 md:group-hover:opacity-100'
            }`}
          >
            <div className="flex gap-1">
             <button onClick={(e) => onPalette(e, note._id)} className="p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition" title="Color">
              <LuPalette />
            </button>
            <button onClick={(e) => onShare(e, note._id)} className="p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition" title="Share">
              <TbUsersPlus />
            </button>
            <button
              onClick={(e) => onFavorite(e, note)}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition"
              title="Favorite"
            >
              {note.isFavorited ? <IoIosStar className="text-yellow-400" /> : <IoIosStarOutline />}
            </button>
            <button
              onClick={(e) => onArchive(e, note)}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition"
              title="Archive"
            >
              <RiInboxArchiveLine />
            </button>
            <button
              onClick={(e) => onMenu(e, note._id)}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition"
              title="More"
            >
              <BsThreeDotsVertical />
            </button>
          </div>
        </div>
      </>
    )}
  </div>
);

const DashboardPage = () => {
  // Retrieve closeSidebar to handle mobile backdrop clicks
  const { isSidebarOpen, closeSidebar } = useOutletContext();
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

  const [shareModalState, setShareModalState] = useState({
    isOpen: false,
    noteId: null,
  });

  const handleCloseToast = () => {
    if (toast.hideTimer) {
      clearTimeout(toast.hideTimer);
    }
    setToast({ isVisible: false, message: '', undoData: null, hideTimer: null, undoType: null });
  };

  const handleUndo = async () => {
    const { undoData: noteToRestore, hideTimer, undoType } = toast;
    if (!noteToRestore || !hideTimer) return;

    clearTimeout(hideTimer);
    setToast({ isVisible: false, message: '', undoData: null, hideTimer: null, undoType: null });

    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } };

      if (undoType === 'archive') {
        await axios.put(`http://localhost:3001/api/notes/${noteToRestore._id}`, {
          isArchived: noteToRestore.isArchived 
        }, config);
      } else if (undoType === 'bin') {
        await axios.put(`http://localhost:3001/api/notes/${noteToRestore._id}`, {
          isBinned: false
        }, config);
      }
      fetchNotes();
    } catch (error) {
      console.error(`Failed to undo ${undoType}`, error);
      fetchNotes();
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
    } else if (view === 'favorites') { 
      apiUrl += '&favorited=true';
    } else if (view === 'bin') {
      apiUrl += '&bin=true';
    }

    axios.get(apiUrl, config)
      .then(res => setNotes(res.data))
      .catch(error => console.error('Error fetching notes:', error))
      .finally(() => setIsLoading(false));
  };

  const handleToggleFavorite = async (event, note) => {
    event.stopPropagation();
    const newFavoriteStatus = !note.isFavorited;

    setNotes(notes.map(n =>
      n._id === note._id ? { ...n, isFavorited: newFavoriteStatus } : n
    ));

    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } };
      await axios.put(`http://localhost:3001/api/notes/${note._id}`, { isFavorited: newFavoriteStatus }, config);
    } catch (error) {
      console.error('Failed to update favorite status', error);
      fetchNotes();
    }
  };

  const handleMoveToBin = async (note) => {
    if (!note) return;

    setNotes(notes.filter(n => n._id !== note._id));
    handleCloseMenu();

    if (toast.hideTimer) {
      clearTimeout(toast.hideTimer);
    }

    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } };
      await axios.put(`http://localhost:3001/api/notes/${note._id}`, { isBinned: true }, config);

      const timerId = setTimeout(() => {
        setToast({ isVisible: false, message: '', undoData: null, hideTimer: null, undoType: null });
      }, 5000);

      setToast({
        isVisible: true,
        message: 'Note moved to bin',
        undoData: note,
        hideTimer: timerId,
        undoType: 'bin'
      });

    } catch (error) {
      console.error('Failed to move to bin', error);
      fetchNotes(); 

      const errorMsg = error.response?.data?.message || 'Failed to move to bin';
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
      return;
    }
  };

  const handleRestoreNote = async (note) => {
    if (!note) return;

    setNotes(notes.filter(n => n._id !== note._id));

    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } };
      await axios.put(`http://localhost:3001/api/notes/${note._id}`, { isBinned: false }, config);
    } catch (error) {
      console.error('Failed to restore note', error);
      fetchNotes();
    }
  };

  useEffect(() => {
    if (auth) {
      const fetchAllNotesForLabels = async () => {
        const config = { headers: { Authorization: `Bearer ${auth.token}` } };
        const { data } = await axios.get(`http://localhost:3001/api/notes`, config);
        const uniqueLabels = [...new Set(data.flatMap(note => note.labels))];
        setAllLabels(uniqueLabels);
      };
      fetchAllNotesForLabels();
      fetchNotes(); 
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, view]);

  const handleOpenShareModal = (event, noteId) => {
    event.stopPropagation();
    setShareModalState({ isOpen: true, noteId: noteId });
  };

  const handleOpenLabelModal = (note) => {
    setMenuState({ isOpen: false });
    setLabelModalState({ isOpen: true, note: note });
  };

  const handleCloseLabelModal = () => {
    setLabelModalState({ isOpen: false, note: null });
  };

  const handleSaveLabels = async (newLabels) => {
    const noteId = labelModalState.note._id;
    if (!noteId) return;

    setNotes(notes.map(n => (n._id === noteId ? { ...n, labels: newLabels } : n)));

    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } };
      await axios.put(`http://localhost:3001/api/notes/${noteId}`, { labels: newLabels }, config);
    } catch (error) {
      console.error('Failed to save labels', error);
      fetchNotes();
    }
  };

  useEffect(() => {
    if (auth) {
      fetchNotes();
    }
  }, [auth, view]);

  useEffect(() => {
    if (searchTerm === '' && notes.length === 0) {
      return; 
    }

    const timerId = setTimeout(() => {
      fetchNotes(searchTerm);
    }, 500);

    return () => clearTimeout(timerId);
  }, [searchTerm, auth]);

  useEffect(() => {
    if (searchTerm && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [notes]);

  const handleCreateNote = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } };
      const { data } = await axios.post('http://localhost:3001/api/notes', {}, config);
      setSelectedNoteId(data._id); 
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleToggleArchive = async (event, note) => {
    event.stopPropagation();
    const newArchivedStatus = !note.isArchived;

    setNotes(notes.filter(n => n._id !== note._id));
    if (toast.hideTimer) clearTimeout(toast.hideTimer);

    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } };
      await axios.put(`http://localhost:3001/api/notes/${note._id}`, { isArchived: newArchivedStatus }, config);
    } catch (error) {
      console.error('Failed to update archive status', error);
      fetchNotes();
      return;
    }

    const timerId = setTimeout(() => {
      setToast({ isVisible: false, message: '', undoData: null, hideTimer: null, undoType: null });
    }, 5000);

    setToast({
      isVisible: true,
      message: newArchivedStatus ? 'Note archived' : 'Note un-archived',
      undoData: note, 
      hideTimer: timerId,
      undoType: 'archive' 
    });
  };

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
    event.stopPropagation(); 
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

    setNotes(notes.map(n => (n._id === noteId ? { ...n, color } : n)));
    handleClosePalette();

    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } };
      await axios.put(`http://localhost:3001/api/notes/${noteId}`, { color }, config);
    } catch (error) {
      console.error('Failed to update color', error);
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

    handleCloseMenu(); 
    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } };
      const { data } = await axios.post(`http://localhost:3001/api/notes/${noteId}/copy`, {}, config);
      setNotes(prevNotes => [data, ...prevNotes]);
    } catch (error) {
      console.error('Failed to copy note', error);
    }
  };

  let pageTitle = 'My Notes';
  if (view === 'favorites') {
    pageTitle = 'Favorites';
  } else if (view === 'archive') {
    pageTitle = 'Archive';
  } else if (view === 'bin') {
    pageTitle = 'Bin';
  } else if (view !== 'notes') {
    pageTitle = `# ${view}`;
  }

  if (isLoading) return <LoadingSpinner />;

  return (
    <>
      <div
        className={`flex h-[calc(100vh-64px)] overflow-hidden relative bg-gray-900 transition-all duration-300 ${isModalOpen || selectedNoteId ? 'blur-sm' : ''}`}
      >
        {/* Abstract Background Blobs (Matches Login Page) */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600 rounded-full filter blur-[120px] opacity-10 -translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600 rounded-full filter blur-[120px] opacity-10 translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

        {/* Mobile Sidebar Backdrop */}
        {isSidebarOpen && (
           <div 
             className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm transition-opacity"
             onClick={closeSidebar}
           />
        )}

        {/* Sidebar - Responsive */}
        <aside
          className={`
            z-30 bg-gray-900 border-r border-gray-700 flex-shrink-0 transition-all duration-300 ease-in-out
            ${isSidebarOpen ? 'w-64' : 'w-0 md:w-20'} 
            ${isSidebarOpen ? 'absolute h-full shadow-2xl md:static md:shadow-none' : 'static'}
            ${isSidebarOpen ? 'p-5' : 'p-0 md:py-5'}
            overflow-hidden
          `}
        >
          <nav className={`space-y-2 ${!isSidebarOpen && 'md:px-2'}`}>
            <button
              onClick={() => { setView('notes'); if(window.innerWidth < 768) closeSidebar(); }}
              className={`w-full flex items-center py-3 h-12 text-white font-medium transition-all duration-200 ${isSidebarOpen
                ? `rounded-xl ${view === 'notes' ? 'bg-blue-600 shadow-lg shadow-blue-600/20' : 'hover:bg-gray-800 text-gray-400 hover:text-white'}`
                : `rounded-full justify-center ${view === 'notes' ? 'bg-blue-600 shadow-lg shadow-blue-600/20' : 'hover:bg-gray-800 text-gray-400 hover:text-white'}`
                } ${isSidebarOpen ? 'px-4 gap-3' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h.01a1 1 0 100-2H10zm3 0a1 1 0 000 2h.01a1 1 0 100-2H13z" clipRule="evenodd" />
              </svg>
              <span className={isSidebarOpen ? 'inline' : 'hidden'}>All Notes</span>
            </button>

            <button
              onClick={() => { setView('favorites'); if(window.innerWidth < 768) closeSidebar(); }}
              className={`w-full flex items-center py-3 h-12 text-white font-medium transition-all duration-200 ${isSidebarOpen
                ? `rounded-xl ${view === 'favorites' ? 'bg-blue-600 shadow-lg shadow-blue-600/20' : 'hover:bg-gray-800 text-gray-400 hover:text-white'}`
                : `rounded-full justify-center ${view === 'favorites' ? 'bg-blue-600 shadow-lg shadow-blue-600/20' : 'hover:bg-gray-800 text-gray-400 hover:text-white'}`
                } ${isSidebarOpen ? 'px-4 gap-3' : ''}`}
            >
              <IoIosStarOutline className="h-5 w-5 flex-shrink-0" />
              <span className={isSidebarOpen ? 'inline' : 'hidden'}>Favorites</span>
            </button>

            <button
              onClick={() => { setView('archive'); if(window.innerWidth < 768) closeSidebar(); }}
              className={`w-full flex items-center py-3 h-12 text-white font-medium transition-all duration-200 ${isSidebarOpen
                ? `rounded-xl ${view === 'archive' ? 'bg-blue-600 shadow-lg shadow-blue-600/20' : 'hover:bg-gray-800 text-gray-400 hover:text-white'}`
                : `rounded-full justify-center ${view === 'archive' ? 'bg-blue-600 shadow-lg shadow-blue-600/20' : 'hover:bg-gray-800 text-gray-400 hover:text-white'}`
                } ${isSidebarOpen ? 'px-4 gap-3' : ''}`}
            >
              <RiInboxArchiveLine className="h-5 w-5 flex-shrink-0" />
              <span className={isSidebarOpen ? 'inline' : 'hidden'}>Archive</span>
            </button>

            <button
              onClick={() => { setView('bin'); if(window.innerWidth < 768) closeSidebar(); }}
              className={`w-full flex items-center py-3 h-12 text-white font-medium transition-all duration-200 ${isSidebarOpen
                ? `rounded-xl ${view === 'bin' ? 'bg-blue-600 shadow-lg shadow-blue-600/20' : 'hover:bg-gray-800 text-gray-400 hover:text-white'}`
                : `rounded-full justify-center ${view === 'bin' ? 'bg-blue-600 shadow-lg shadow-blue-600/20' : 'hover:bg-gray-800 text-gray-400 hover:text-white'}`
                } ${isSidebarOpen ? 'px-4 gap-3' : ''}`}
            >
              <RiDeleteBin6Line className="h-5 w-5 flex-shrink-0" />
              <span className={isSidebarOpen ? 'inline' : 'hidden'}>Bin</span>
            </button>
          </nav>

          <div className={`mt-8 ${isSidebarOpen ? 'block' : 'hidden'}`}>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-4">Labels</h3>
            <nav className="space-y-1">
              {allLabels.map(label => (
                <button
                  key={label}
                  onClick={() => { setView(label); if(window.innerWidth < 768) closeSidebar(); }}
                  className={`w-full text-left flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${view === label ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
                >
                  <span className="text-blue-500">#</span> {label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content - Responsive Padding */}
        <main className="flex-1 w-full overflow-y-auto p-4 md:p-8 z-10 relative">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-10 gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
                  {pageTitle}
                </h1>
                 <p className="text-gray-400 text-sm">
                    {view === 'bin' ? 'Notes in the bin are deleted after 30 days.' : 'Manage and organize your thoughts.'}
                 </p>
              </div>
              
              {view === 'notes' && (
                <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                  {/* Updated Search Bar - Full Width on Mobile */}
                  <div className="relative flex-1 md:flex-none w-full md:w-80">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search notes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition shadow-sm text-sm md:text-base"
                    />
                    <svg
                      className="w-5 h-5 text-gray-500 absolute top-1/2 left-3 -translate-y-1/2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  {/* Updated Create Button - Icon only on mobile */}
                  <button
                    onClick={handleCreateNote}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 md:px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20 transition duration-300 transform hover:scale-105 active:scale-95 shrink-0"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="hidden sm:inline">Create Note</span>
                  </button>
                </div>
              )}
            </div>

            {/* Notes Grid - Fully Responsive */}
            {view === 'bin' ? (
              notes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {notes.map((note) => (
                     <NoteCard
                        key={note._id}
                        note={note}
                        isBin={true}
                        menuState={menuState}
                        onSelect={setSelectedNoteId}
                        onRestore={handleRestoreNote}
                        onDelete={openDeleteModal}
                        onPalette={handleOpenPalette}
                        onShare={handleOpenShareModal}
                        onFavorite={handleToggleFavorite}
                        onArchive={handleToggleArchive}
                        onMenu={handleOpenMenu}
                      />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center mt-20 text-center opacity-60">
                   <RiDeleteBin6Line className="text-6xl text-gray-600 mb-4" />
                  <h2 className="text-xl font-semibold text-white">Bin is Empty</h2>
                  <p className="text-gray-400 mt-2">Items moved to the bin will appear here.</p>
                </div>
              )
            ) : view === 'favorites' ? (
              (() => {
                const favoritedUnarchived = notes.filter(note => note.isFavorited && !note.isArchived);
                const favoritedArchived = notes.filter(note => note.isFavorited && note.isArchived);

                return favoritedUnarchived.length > 0 || favoritedArchived.length > 0 ? (
                  <div>
                    {favoritedUnarchived.length > 0 && (
                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-12">
                          {favoritedUnarchived.map((note) => (
                            <NoteCard
                              key={note._id}
                              note={note}
                              isBin={false}
                              menuState={menuState}
                              onSelect={setSelectedNoteId}
                              onRestore={handleRestoreNote}
                              onDelete={openDeleteModal}
                              onPalette={handleOpenPalette}
                              onShare={handleOpenShareModal}
                              onFavorite={handleToggleFavorite}
                              onArchive={handleToggleArchive}
                              onMenu={handleOpenMenu}
                            />
                          ))}
                       </div>
                    )}

                    {favoritedArchived.length > 0 && (
                      <>
                        <div className="flex items-center gap-4 mb-6 mt-8">
                            <div className="h-px flex-1 bg-gray-700"></div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Archived Favorites</span>
                            <div className="h-px flex-1 bg-gray-700"></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                          {favoritedArchived.map((note) => (
                             <NoteCard
                                key={note._id}
                                note={note}
                                isBin={false}
                                menuState={menuState}
                                onSelect={setSelectedNoteId}
                                onRestore={handleRestoreNote}
                                onDelete={openDeleteModal}
                                onPalette={handleOpenPalette}
                                onShare={handleOpenShareModal}
                                onFavorite={handleToggleFavorite}
                                onArchive={handleToggleArchive}
                                onMenu={handleOpenMenu}
                              />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center mt-20 text-center opacity-60">
                     <IoIosStarOutline className="text-6xl text-gray-600 mb-4" />
                    <h2 className="text-xl font-semibold text-white">No Favorites Yet</h2>
                    <p className="text-gray-400 mt-2">Star important notes to access them quickly.</p>
                  </div>
                );
              })()
            ) : (
              // Default View
              filteredNotes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {filteredNotes.map((note) => (
                    <NoteCard
                        key={note._id}
                        note={note}
                        isBin={false}
                        menuState={menuState}
                        onSelect={setSelectedNoteId}
                        onRestore={handleRestoreNote}
                        onDelete={openDeleteModal}
                        onPalette={handleOpenPalette}
                        onShare={handleOpenShareModal}
                        onFavorite={handleToggleFavorite}
                        onArchive={handleToggleArchive}
                        onMenu={handleOpenMenu}
                      />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center mt-28 text-center px-4">
                  <div onClick={handleCreateNote} className="bg-gray-800 cursor-pointer p-6 rounded-full mb-6 transition duration-300 hover:bg-gray-700">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                     </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Create your first note</h2>
                  <p className="text-gray-400 max-w-md mb-8 text-sm md:text-base">
                    Capture ideas, lists, and projects. Organize them with colors and labels.
                  </p>
                </div>
              )
            )}
          </div>
        </main>
      </div>

      {/* Modals and overlays remain the same */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteNote}
        message="Are you sure you want to permanently delete this note?"
      />
      
      {/* Use updated component with noteId prop */}
      <ShareNoteModal
        isOpen={shareModalState.isOpen}
        noteId={shareModalState.noteId}
        onClose={() => setShareModalState({ isOpen: false, noteId: null })}
      />

      <AnimatePresence>
        {selectedNoteId && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              key="modal"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-4xl h-[85vh] relative"
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
        {menuState.isOpen && (
          <NoteOptionsMenu
            onClose={handleCloseMenu}
            onCopy={handleCopyNote}
            onAddLabel={() => handleOpenLabelModal(notes.find(n => n._id === menuState.noteId))}
            onMoveToBin={() => handleMoveToBin(notes.find(n => n._id === menuState.noteId))}
            position={menuState.position}
          />
        )}
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
        onUndo={handleUndo}
        onClose={handleCloseToast}
      />
    </>
  );
};

export default DashboardPage;