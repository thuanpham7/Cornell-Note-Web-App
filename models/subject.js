const mongoose = require('mongoose');
const noteSchema = require('./note').noteSchema;

const subjectSchema = new mongoose.Schema({
    date: {
        type: String
    },
    desc: String,
    title: {
        type: String,
        require: "Title is require"
    },
    note: [
        {
            type: noteSchema
        }
    ],
    owner: String
},
{timestamps: true});

exports.subjectModel = mongoose.model('Subject', subjectSchema);
exports.subjectSchema = subjectSchema;