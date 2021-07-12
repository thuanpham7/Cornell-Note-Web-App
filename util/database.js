const mongoose = require('mongoose');
const db = 
const mongoConnect = mongoose.connect("mongodb://localhost:27017/subjectsDB", {useNewUrlParser: true, useUnifiedTopology: true});

exports.mongoConnect = mongoConnect;

