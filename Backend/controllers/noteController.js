// Backend/controllers/noteController.js
const User = require('../models/user');
const Note = require('../models/note');

// @desc    Get all notes for a user (now with search)
// @route   GET /api/notes
// @access  Private
// @desc    Get notes for a user (with archive & search)
// @route   GET /api/notes
// @access  Private
// @desc    Get notes for a user
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res) => {
    const baseQuery = {
        $or: [
            { owner: req.user._id },
            { collaborators: req.user._id }
        ]
    };

    // --- THIS IS THE NEW LOGIC ---
    // 1. Check if we are in the Bin view
    if (req.query.bin === 'true') {
        baseQuery.isBinned = true;
    } else {
        // 2. If NOT in bin, hide all binned items from all other views
        baseQuery.isBinned = { $ne: true };
    }

    // 3. Apply other filters (this logic is from our previous fix)
    if (req.query.archived) {
        baseQuery.isArchived = req.query.archived === 'true';
    } else if (req.query.favorited) {
        baseQuery.isFavorited = req.query.favorited === 'true';
    }

    const searchFilter = req.query.search
        ? {
            $or: [
                { title: { $regex: req.query.search, $options: 'i' } },
                { content: { $regex: req.query.search, $options: 'i' } },
            ],
        }
        : {};

    const finalQuery = { ...baseQuery, ...searchFilter };

    const notes = await Note.find(finalQuery).sort({ updatedAt: -1 });
    res.json(notes);
};

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res) => {
    // ... (existing createNote function)
    const note = new Note({
        owner: req.user._id,
    });
    const createdNote = await note.save();
    res.status(201).json(createdNote);
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res) => {
    const note = await Note.findById(req.params.id);

    // 1. Check if the note exists
    if (!note) {
        return res.status(404).json({ message: 'Note not found' });
    }

    // 2. Check if the logged-in user owns the note
    const isOwner = note.owner.toString() === req.user._id.toString();
    const isCollaborator = note.collaborators.some(collabId => collabId.equals(req.user._id));

    if (!isOwner && !isCollaborator) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    // 3. If checks pass, delete the note
    await note.deleteOne();
    res.json({ message: 'Note removed' });
};

const copyNote = async (req, res) => {
    const originalNote = await Note.findById(req.params.id);

    if (!originalNote) {
        return res.status(404).json({ message: 'Note not found' });
    }

    // --- THIS IS THE UPDATED CHECK ---
    const isOwner = originalNote.owner.toString() === req.user._id.toString();
    const isCollaborator = originalNote.collaborators.some(collabId => collabId.equals(req.user._id));

    if (!isOwner && !isCollaborator) {
        return res.status(401).json({ message: 'Not authorized' });
        T
    }

    const newNote = new Note({
        title: `[Copy of] ${originalNote.title}`,
        content: originalNote.content,
        color: originalNote.color,
        owner: req.user._id,
        labels: originalNote.labels // We'll copy labels too
    });

    const createdNote = await newNote.save();
    res.status(201).json(createdNote);
};

// --- NEW FUNCTION: Get a single note by its ID ---
// @desc    Get a single note
// @route   GET /api/notes/:id
// @access  Private
const getNoteById = async (req, res) => {
    const note = await Note.findById(req.params.id);

    if (!note) {
        return res.status(404).json({ message: 'Note not found' });
    }
    const isOwner = note.owner.toString() === req.user._id.toString();
    const isCollaborator = note.collaborators.some(collabId => collabId.equals(req.user._id));

    if (!isOwner && !isCollaborator) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(note);
};


// --- NEW FUNCTION: Update a note's title and content ---
// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = async (req, res) => {
    // 👉 Destructure 'isArchived' from the request body
    const { title, content, color, labels, isArchived, isFavorited, isBinned } = req.body;
    const note = await Note.findById(req.params.id);

    if (!note) {
        return res.status(404).json({ message: 'Note not found' });
    }
    const isOwner = note.owner.toString() === req.user._id.toString();
    const isCollaborator = note.collaborators.some(collabId => collabId.equals(req.user._id));

    if (!isOwner && !isCollaborator) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    note.title = title !== undefined ? title : note.title;
    note.content = content !== undefined ? content : note.content;
    note.color = color || note.color;
    note.labels = labels !== undefined ? labels : note.labels;
    note.isArchived = isArchived !== undefined ? isArchived : note.isArchived;
    note.isFavorited = isFavorited !== undefined ? isFavorited : note.isFavorited;
    note.isBinned = isBinned !== undefined ? isBinned : note.isBinned;

    const updatedNote = await note.save();
    res.json(updatedNote);
};

// @desc    Add a collaborator to a note
// @route   POST /api/notes/:id/share
// @access  Private (Owner only)
const shareNote = async (req, res) => {
    const { email } = req.body;
    const note = await Note.findById(req.params.id);

    // 1. Check if note exists
    if (!note) {
        return res.status(404).json({ message: 'Note not found' });
    }

    // 2. Check if the logged-in user is the OWNER
    if (note.owner.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Only the owner can share this note' });
    }

    // 3. Find the user to share with
    const userToShareWith = await User.findOne({ email });
    if (!userToShareWith) {
        return res.status(404).json({ message: `User with email ${email} not found` });
    }

    // 4. Check if they are already the owner or a collaborator
    if (userToShareWith._id.equals(note.owner) || note.collaborators.some(c => c.equals(userToShareWith._id))) {
        return res.status(400).json({ message: 'User is already a member of this note' });
    }

    // 5. Add user and save
    note.collaborators.push(userToShareWith._id);
    await note.save();

    res.status(200).json({ message: `Note shared with ${email}` });
};

// --- EXPORT THE NEW FUNCTIONS ---
module.exports = {
    getNotes,
    createNote,
    deleteNote,
    getNoteById,
    updateNote,
    copyNote,
    shareNote // <-- ADD THIS
};