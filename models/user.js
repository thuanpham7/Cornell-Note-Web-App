const mongoose = require('mongoose');
const subjectSchema = require('./subject').subjectSchema;

const userSchema = new mongoose.Schema({
    googleID: String,
    username: String,
    password: String,
    subject: [{
        type:subjectSchema
    }]
});

module.exports = userSchema;