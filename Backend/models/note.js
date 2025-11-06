// Backend/models/note.js
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        default: 'Untitled Note'
    },
    content: {
        type: String,
        default: ''
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    collaborators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    color: {
        type: String,
        default: '#2d3748'
    },
    // 👉 Add this new field for labels
    labels: {
        type: [String], // An array of strings
        default: []     // Defaults to an empty array
    },
    isArchived: {
        type: Boolean,
        default: false // Notes are not archived by default
    },
    isFavorited: {
        type: Boolean,
        default: false // Notes are not favorited by default
    },
    isBinned: {
        type: Boolean,
        default: false // Notes are not in the bin by default
    },
}, {
    timestamps: true
});

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;