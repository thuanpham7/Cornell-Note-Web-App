const mongoose = require('mongoose');
const subjectSchema = require('./subject').subjectSchema;

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    subject: [{
        type:subjectSchema
    }]
});

module.exports = userSchema;