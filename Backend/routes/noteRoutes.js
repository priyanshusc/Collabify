// Backend/routes/noteRoutes.js
const express = require('express');
const router = express.Router();

// --- IMPORT THE NEW FUNCTIONS ---
const { 
    getNotes, 
    createNote, 
    deleteNote,
    getNoteById,
    updateNote,
    copyNote,
    shareNote,
} = require('../controllers/noteController');

const { protect } = require('../middleware/authMiddleware');

// This handles GET and POST requests to /api/notes
router.route('/').get(protect, getNotes).post(protect, createNote);
router.route('/:id/copy').post(protect, copyNote);
router.route('/:id/share').post(protect, shareNote);

// --- UPDATE THIS ROUTE TO HANDLE GET, PUT, and DELETE for a specific ID ---
router
    .route('/:id')
    .get(protect, getNoteById)
    .put(protect, updateNote)
    .delete(protect, deleteNote);

module.exports = router;