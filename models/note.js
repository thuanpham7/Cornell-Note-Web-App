const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        require: '{PATH} is required'
    },
    date: {
        type: String
    },
    subject: {
        type: String
    },
    highlights: [{
        type: String
    }],
    notes: [{
        type: String
    }],
    summary: [{
        type: String
    }]
},
{timestamps: true});

exports.noteModel = mongoose.model('Note', noteSchema);
exports.noteSchema = noteSchema;


