const Note = require('../models/note').noteModel;
const Subject = require('../models/subject').subjectModel;
const userSchema = require('../models/user');
const mongoose = require('mongoose');

let today = new Date().toISOString().slice(0, 10);
exports.getNote = async (req, res) => {
    if (req.isAuthenticated()){
        const subName = req.params.subName;
        try {
            const curNote = new Note({title: "", date: today, subject: subName, highlights: [], note: [], summary: []});
            await curNote.save();
            res.status(200).render('note', {note: curNote, date: today, noteIDs: curNote._id});
        }catch (err){
            res.status(400).send("Error found " + err);
        }
    }
    else {
        res.redirect('/');
    }
    
};


exports.postNote = async (req, res) => {
    const User = mongoose.model("User", userSchema);
    //Getting essential variables 
    const subName = req.params.subName;
    const noteID = req.body.noteID; 
    const title = req.body.title;

    try {
        const val = await Subject.findOne({title: subName});
        const curNote = await Note.findOne({_id: noteID});
        const curUser = await User.findOne({_id: req.user.id});
        curNote.title = title;
        if (curNote.title === "")
            curNote.title = "Untitled";
        await curNote.save();
        var count = 0;
        for (let i = 0; i < val.note.length; i++){
            if (curNote.title === val.note[i].title){
                count++;
                break;
            }
        }
        if (count === 0)
            val.note.push(curNote);
                  
        await val.save();

        for (let i = 0; i < curUser.subject.length; i++){
            if (String.valueOf(curUser.subject[i]._id) === String.valueOf(val._id)){
                curUser.subject[i] = val;
                await curUser.save();
            }
        }
        
        const url = "/subject/" + subName;
        res.redirect(url);
    }
    catch (err) {
        res.status(400).send("Error found " + err);
    }
    
}

exports.addHighlights = async (req, res) => {
    //Getting essential variables 
    const highlight = req.body.highlight;
    const noteID = req.body.noteID;
    const curNote = await Note.findOne({_id: noteID});
    curNote.highlights.push(highlight);
    curNote.save();
    res.status(200).render('note', {note: curNote, date: today, noteIDs: curNote._id});
}

exports.removeHighlights = async (req, res) => {
    const highlight = req.body.checkbox;
    const noteID = req.body.noteID;
    const curNote = await Note.findOne({_id: noteID});
    for (let i = 0; i < curNote.highlights.length; i++){
        if (curNote.highlights[i] === highlight){
            curNote.highlights.splice(i, 1);
            break;
        }
    }
    curNote.save();
    res.status(200).render('note', {note: curNote, date: today, noteIDs: curNote._id});
}

exports.addNotes = async (req, res) => {
    const note = req.body.notes;
    const noteID = req.body.noteID;
    const curNote = await Note.findOne({_id: noteID});
    curNote.notes.push(note);
    curNote.save();
    res.status(200).render('note', {note: curNote, date: today, noteIDs: curNote._id});
}

exports.removeNotes = async (req, res) => {
    const note = req.body.checkbox;
    const noteID = req.body.noteID;
    const curNote = await Note.findOne({_id: noteID});
    for (let i = 0; i < curNote.notes.length; i++){
        if (curNote.notes[i] === note){
            curNote.notes.splice(i, 1);
            break;
        }
    }
    curNote.save();
    res.status(200).render('note', {note: curNote, date: today, noteIDs: curNote._id});
}

exports.addSummary = async (req, res) => {
    const summary = req.body.summary;
    const noteID = req.body.noteID;
    const curNote = await Note.findOne({_id: noteID});
    curNote.summary.push(summary);
    curNote.save();
    res.status(200).render('note', {note: curNote, date: today, noteIDs: curNote._id});
}

exports.removeSummary = async (req, res) => {
    const sum = req.body.checkbox;
    const noteID = req.body.noteID;
    const curNote = await Note.findOne({_id: noteID});
    for (let i = 0; i < curNote.summary.length; i++){
        if (curNote.summary[i] === sum){
            curNote.summary.splice(i, 1);
            break;
        }
    }
    curNote.save();
    res.status(200).render('note', {note: curNote, date: today, noteIDs: curNote._id});
}

exports.editNote = async (req, res) => {
    if (req.isAuthenticated()){
        const noteID = req.params.noteName;
        const curNote = await Note.findOne({_id: noteID});
        res.status(200).render('note', {note: curNote, date: today, noteIDs: curNote._id});
    }
    else {
        res.redirect('/');
    }
}

exports.postEditNote = async (req, res) => {
    res.redirect('/add');
}

exports.postRemoveNote = async (req, res) => {
    const User = mongoose.model("User", userSchema);
    const curUser = await User.findOne({_id: req.user.id});
    const noteName = req.params.noteName;
    const subName = req.params.subName;
    await Note.deleteOne({_id: noteName});
    const curSub = await Subject.findOne({title: subName});

    for (let i = 0; i < curSub.note.length; i++){
        if (curSub.note[i]._id == noteName){
            curSub.note.splice(i, 1);
            curSub.save();
            break;
        }
    }

    for (let i = 0; i < curUser.subject.length; i++){
        if (String.valueOf(curUser.subject[i]._id) === String.valueOf(curSub._id)){
            curUser.subject[i] = curSub;
            await curUser.save();
            break;
        }
    }
    
    const url = "/subject/" + subName;
    res.redirect(url);
}

exports.postRemoveEditNote = async (req, res) => {
    res.redirect('/')
}




