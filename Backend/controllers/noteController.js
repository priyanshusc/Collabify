// Backend/controllers/noteController.js
const User = require('../models/user');
const Note = require('../models/note');
const NoteMeta = require('../models/noteMeta')

const removeCollaborator = async (req, res) => {
    const { id: noteId, userId: userToRemoveId } = req.params;
    const currentUserId = req.user._id;

    try {
        // 1. Find the owner's metadata for the note
        const ownerMeta = await NoteMeta.findOne({ note: noteId, user: currentUserId });

        // 2. Security Check: Only the owner can remove people
        if (!ownerMeta || ownerMeta.role !== 'owner') {
            return res.status(401).json({ message: 'Only the owner can remove collaborators' });
        }

        // 3. Security Check: The owner cannot remove themselves
        if (ownerMeta.user.toString() === userToRemoveId) {
            return res.status(400).json({ message: 'Owner cannot be removed from the note' });
        }

        // 4. Find and delete the collaborator's metadata
        const result = await NoteMeta.deleteOne({ note: noteId, user: userToRemoveId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Collaborator not found on this note' });
        }

        res.json({ message: 'Collaborator removed successfully' });
    } catch (error) {
        console.error("Error removing collaborator:", error);
        res.status(500).json({ message: "Error removing collaborator" });
    }
};

const getNoteCollaborators = async (req, res) => {
    const noteId = req.params.id;
    const userId = req.user._id;

    try {
        // 1. Security Check: Does the current user have access to this note?
        const hasAccess = await NoteMeta.findOne({ note: noteId, user: userId });
        if (!hasAccess) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // 2. Get all metadata entries for this note, populating user details
        const metas = await NoteMeta.find({ note: noteId })
            .populate('user', 'name email avatar') // Select only name, email, and avatar from user
            .select('user role'); // Select user and role from NoteMeta

        res.json(metas);
    } catch (error)
    {
        console.error("Error fetching collaborators:", error);
        res.status(500).json({ message: "Error fetching collaborators" });
    }
};

const getNotes = async (req, res) => {
    // 1. Build the filter for NoteMeta
    const metaQuery = { user: req.user._id };

    if (req.query.bin === 'true') {
        metaQuery.isBinned = true;
    } else {
        metaQuery.isBinned = { $ne: true };
    }

    if (req.query.archived) {
        metaQuery.isArchived = req.query.archived === 'true';
    } else if (req.query.favorited) {
        metaQuery.isFavorited = req.query.favorited === 'true';
    } else if (req.query.bin !== 'true') {
        metaQuery.isArchived = { $ne: true };
    }

    // 2. Build the filter for Note (for search)
    const noteQuery = {};
    if (req.query.search) {
        // 👇 UPDATED: Search fields are now top-level
        noteQuery.$or = [
            { 'title': { $regex: req.query.search, $options: 'i' } },
            { 'content': { $regex: req.query.search, $options: 'i' } },
        ];
    }

    // 3. Use an aggregation pipeline to join NoteMeta and Note
    try {
        const notes = await NoteMeta.aggregate([
            { $match: metaQuery }, // Filter by user and user's state
            {
                $lookup: { // Join with the 'notes' collection
                    from: 'notes', 
                    localField: 'note',
                    foreignField: '_id',
                    as: 'noteDetails'
                }
            },
            { $unwind: '$noteDetails' }, // Deconstruct the array from lookup
            
            // 👇 THIS IS THE KEY FIX
            {
                $project: {
                    _id: '$noteDetails._id', // Use the NOTE's ID
                    title: '$noteDetails.title',
                    content: '$noteDetails.content',
                    color: '$noteDetails.color',
                    labels: '$noteDetails.labels',
                    createdAt: '$noteDetails.createdAt',
                    updatedAt: '$noteDetails.updatedAt',
                    
                    // Add the per-user fields from the metadata (NoteMeta)
                    isArchived: '$isArchived',
                    isFavorited: '$isFavorited',
                    isBinned: '$isBinned',
                    role: '$role'
                }
            },
            { $match: noteQuery }, // Apply search *after* projecting
            { $sort: { 'updatedAt': -1 } }
        ]);
        
        res.json(notes);
    } catch (error) {
        console.error("Error fetching notes:", error);
        res.status(500).json({ message: "Error fetching notes" });
    }
};

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res) => {
    try {
        const note = new Note({});
        const createdNote = await note.save();

        const meta = new NoteMeta({
            note: createdNote._id,
            user: req.user._id,
            role: 'owner'
        });
        await meta.save();
        
        res.status(201).json(createdNote);
    } catch (error) {
        console.error("Error creating note:", error);
        res.status(500).json({ message: "Error creating note" });
    }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res) => {
    const noteId = req.params.id;
    const userId = req.user._id;

    try {
        const noteMeta = await NoteMeta.findOne({ note: noteId, user: userId });

        if (!noteMeta) {
            return res.status(404).json({ message: 'Note not found' });
        }
        if (noteMeta.role !== 'owner') {
            return res.status(401).json({ message: 'Only the owner can permanently delete this note' });
        }

        await Note.findByIdAndDelete(noteId);
        await NoteMeta.deleteMany({ note: noteId });

        res.json({ message: 'Note permanently removed' });
    } catch (error) {
        console.error("Error deleting note:", error);
        res.status(500).json({ message: "Error deleting note" });
    }
};

const copyNote = async (req, res) => {
    const originalNote = await Note.findById(req.params.id);

    if (!originalNote) {
        return res.status(404).json({ message: 'Note not found' });
    }
    
    const hasAccess = await NoteMeta.findOne({ note: req.params.id, user: req.user._id });
    if (!hasAccess) {
        return res.status(401).json({ message: 'Not authorized to copy this note' });
    }

    const newNote = new Note({
        title: `[Copy of] ${originalNote.title}`,
        content: originalNote.content,
        color: originalNote.color,
        labels: originalNote.labels
    });
    const createdNote = await newNote.save();

    const newMeta = new NoteMeta({
        note: createdNote._id,
        user: req.user._id,
        role: 'owner',
        isArchived: false, // Set defaults for the new owner
        isFavorited: false,
        isBinned: false
    });
    await newMeta.save();

    // 👇 THIS IS THE KEY FIX
    const finalNote = {
        ...createdNote.toObject(),
        isArchived: newMeta.isArchived,
        isFavorited: newMeta.isFavorited,
        isBinned: newMeta.isBinned,
        role: newMeta.role
    };
    
    res.status(201).json(finalNote);
};

// --- NEW FUNCTION: Get a single note by its ID ---
// @desc    Get a single note
// @route   GET /api/notes/:id
// @access  Private
const getNoteById = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        const noteMeta = await NoteMeta.findOne({ note: req.params.id, user: req.user._id });
        if (!noteMeta) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // 👇 THIS IS THE KEY FIX
        const response = {
            ...note.toObject(),
            // Only add the specific fields from meta, keeping the note's _id
            isArchived: noteMeta.isArchived,
            isFavorited: noteMeta.isFavorited,
            isBinned: noteMeta.isBinned,
            role: noteMeta.role
        };

        res.json(response);
    } catch (error) {
        console.error("Error fetching note by ID:", error);
        res.status(500).json({ message: "Error fetching note" });
    }
};


// --- NEW FUNCTION: Update a note's title and content ---
// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = async (req, res) => {
    const { title, content, color, labels, isArchived, isFavorited, isBinned } = req.body;
    const noteId = req.params.id; // This is the NOTE ID, which is correct
    const userId = req.user._id;

    try {
        const noteMeta = await NoteMeta.findOne({ note: noteId, user: userId });
        if (!noteMeta) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        let metaUpdated = false;
        if (isArchived !== undefined) {
            noteMeta.isArchived = isArchived;
            metaUpdated = true;
        }
        if (isFavorited !== undefined) {
            noteMeta.isFavorited = isFavorited;
            metaUpdated.isFavorited = isFavorited;
            metaUpdated = true;
        }
        if (isBinned !== undefined) {
            if (isBinned === true && noteMeta.role !== 'owner') {
                return res.status(401).json({ message: 'Only the owner can move this note to the bin' });
            }
            noteMeta.isBinned = isBinned;
            metaUpdated = true;
        }
        
        if (metaUpdated) {
            await noteMeta.save();
        }

        let noteUpdated = false;
        const note = await Note.findById(noteId);
        if (title !== undefined) {
            note.title = title;
            noteUpdated = true;
        }
        if (content !== undefined) {
            note.content = content;
            noteUpdated = true;
        }
        if (color !== undefined) {
            note.color = color;
            noteUpdated = true;
        }
        if (labels !== undefined) {
            note.labels = labels;
            noteUpdated = true;
        }
        
        if (noteUpdated) {
            await note.save();
        }

        // 👇 THIS IS THE KEY FIX
        const updatedNote = {
            ...note.toObject(),
            // Only add the specific fields from meta, keeping the note's _id
            isArchived: noteMeta.isArchived,
            isFavorited: noteMeta.isFavorited,
            isBinned: noteMeta.isBinned,
            role: noteMeta.role
        };
        
        res.json(updatedNote);
    } catch (error) {
        console.error("Error updating note:", error);
        res.status(500).json({ message: "Error updating note" });
    }
};

// @desc    Add a collaborator to a note
// @route   POST /api/notes/:id/share
// @access  Private (Owner only)
const shareNote = async (req, res) => {
    const { email } = req.body;
    const noteId = req.params.id;
    const ownerId = req.user._id;

    try {
        const ownerMeta = await NoteMeta.findOne({ note: noteId, user: ownerId });
        if (!ownerMeta || ownerMeta.role !== 'owner') {
            return res.status(401).json({ message: 'Only the owner can share this note' });
        }

        const userToShareWith = await User.findOne({ email });
        if (!userToShareWith) {
            return res.status(404).json({ message: `User with email ${email} not found` });
        }
        
        const existingMeta = await NoteMeta.findOne({ note: noteId, user: userToShareWith._id });
        if (existingMeta) {
             return res.status(400).json({ message: 'User is already a member of this note' });
        }

        const newCollaboratorMeta = new NoteMeta({
            note: noteId,
            user: userToShareWith._id,
            role: 'collaborator'
        });
        await newCollaboratorMeta.save();

        res.status(200).json({ message: `Note shared with ${email}` });
    } catch (error) {
        console.error("Error sharing note:", error);
        res.status(500).json({ message: "Error sharing note" });
    }
};

module.exports = {
    getNotes,
    createNote,
    deleteNote,
    getNoteById,
    updateNote,
    copyNote,
    shareNote,
    getNoteCollaborators,
    removeCollaborator
};