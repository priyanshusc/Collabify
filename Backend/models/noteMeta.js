// Backend/models/noteMeta.js
const mongoose = require('mongoose');

const noteMetaSchema = new mongoose.Schema({
    note: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Note', 
        required: true 
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    role: { 
        type: String, 
        enum: ['owner', 'collaborator'], 
        required: true 
    },
    isArchived: { 
        type: Boolean, 
        default: false 
    },
    isFavorited: { 
        type: Boolean, 
        default: false 
    },
    isBinned: { 
        type: Boolean, 
        default: false 
    },
}, {
    timestamps: true
});

// Add a compound index to prevent a user from having duplicate entries for the same note
noteMetaSchema.index({ note: 1, user: 1 }, { unique: true });

const NoteMeta = mongoose.model('NoteMeta', noteMetaSchema);

module.exports = NoteMeta;