const Subject = require('../models/subject').subjectModel;
const Note = require('../models/note').noteModel;
const userSchema = require('../models/user');
const mongoose = require('mongoose');

exports.getAddSubject = (req, res) => {
    if (req.isAuthenticated()){
        res.render('subject', {pageTitle: "Add subject"});
    }
    else {
        res.redirect('/');
    }
    
}

exports.postAddSubject = async (req, res) => {
    let day = new Date().toISOString().slice(0, 10).toString();
    const title = req.body.title;
    const description = req.body.desc;
    const User = mongoose.model('User', userSchema);
    const curUser = await User.findOne({_id: req.user.id});
    try {
        const subject = new Subject({title: title, desc: description, date: day, owner: req.user.username});
        if (title !== ""){
            await subject.save();
            curUser.subject.push(subject);
            await curUser.save();
        }
        res.redirect('/');
    }catch (err) {
        console.log(err);
    }    
}

exports.getSubject = async (req, res) => {
    if (req.isAuthenticated()){
        const subTitle = req.params.subName;
        const curSub = await Subject.findOne({title: subTitle});
        if (curSub.owner === req.user.username){
            Note.find({subject: curSub.title}, (err, result) => {
                if (err){
                    console.log(err) 
                }
                else{
                    res.render('subjects', {pageTitle: subTitle, subject: result, title: subTitle});
                }
            })
        }
        else {
            res.redirect('/');
        }
    }
    else {
        res.redirect('/');
    }
    
}

exports.getEditSubject = async (req, res) => {
    if (req.isAuthenticated()){
        const subName = req.params.subName;
        res.render('subject', {pageTitle: "Edit Subject", curSub: subName});
    }
    else {
        res.redirect('/');
    }
}

exports.postEditSubject = async (req, res) => {
    const User = mongoose.model('User', userSchema);
    const subName = req.params.subName;
    const newTitle = req.body.title;
    const newDesc = req.body.desc;
    const curUser = await User.findOne({_id: req.user.id});
    const curSub = await Subject.findOne({title: subName});
    curSub.title = newTitle;
    curSub.desc = newDesc;
    await curSub.save();
    for (let i = 0; i < curUser.subject.length; i++){
        if (String.valueOf(curUser.subject[0]._id) === String.valueOf(curSub._id)){
            curUser.subject[i] = curSub;
            break;
        }
    }
    await curUser.save();
    res.redirect('/');
}

exports.postRemoveSubject = async (req, res) => {
    const User = mongoose.model('User', userSchema);
    const subName = req.params.subName;
    const curUser = await User.findOne({_id: req.user.id});
    const curSub = await Subject.findOne({title: subName});
    for (let i = 0; i < curUser.subject.length; i++){
        if (String.valueOf(curUser.subject[0]._id) === String.valueOf(curSub._id)){
            curUser.subject.splice(i, 1);
            await curUser.save();
            break;
        }
    }
    Subject.deleteOne({title: subName}, async (error) => {
        if (error){
            console.log(error);
        }
        else {
            await Note.deleteMany({subject: subName});
            res.redirect('/');
        }
    })
}
