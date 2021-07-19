require('dotenv').config();
const mongoose = require('mongoose');

//Node libraries
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const userSchema = require('./models/user');

//Initilizing session
var session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate')

//Modules
const subject = require('./routes/subject');
const noteRouter = require('./routes/note');

//Initialize app
const app = express();
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));
mongoose.set('useCreateIndex', true);

//Setting up user session
app.use(session({
     secret: process.env.SECRET,
     resave: false,
     saveUninitialized: false
}));

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
});

app.use(passport.initialize());
app.use(passport.session());


//You might see the password in the commit but I will change it heheh
const db = process.env.DB;

const localDB = "mongodb://localhost:27017/subjectDB";
mongoose.connect(localDB, {useNewUrlParser: true, useUnifiedTopology: true});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/subjects"
  },
  function(accessToken, refreshToken, profile, done) {
       User.findOrCreate({ googleID: profile.id, username: profile.displayName}, function (err, user) {
         return done(err, user);
       });
  }
));

//Running app from routes

app.get('/register', (req, res) => {
    res.render('register', {val: true});
})

app.post('/register', async (req, res) => {

    //sanitize
    if (!req.body.username.match(/^[0-9a-z]+$/)){
        res.render('register', {val: false});
    }

    const curUser = await User.findOne({username: req.body.username});
    if (curUser != null){
        res.render('register', {val: false})
    }
    else {
        User.register({username: req.body.username}, req.body.password, (err, user) => {
            if (err) {
                console.log(err);
                res.redirect('/register');
            }
            else {
                passport.authenticate("local")(req,res, function() {
                    res.redirect('/');
                })
            }
        })
    }
})

app.get('/', (req, res) => {
    if (req.isAuthenticated()){
        const curUser = req.user;
        res.render('home', {pageTitle: "Test", user: curUser});
    }
    else {
        res.render('welcome');
    }
})

app.get('/login', (req, res) => {
    res.render('login', {val: true});
})

app.post('/login', async (req, res) => {

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    //Sanitize user request
    if (!user.username.match(/^[0-9a-z]+$/)){
        res.render('login', {val: false});
    }

    else {
        const curUser = await User.findOne({username: user.username});
        if (curUser === null){
            res.render('login', {val: false});
            return;
        }
        req.login(user, (err) => {
            if (err) {
                res.redirect('/login');
            }
            else {
                passport.authenticate("local")(req, res, () => {
                    res.redirect('/');
                })
            }
        })
    }
})

//Google oath2.0
app.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

app.get('/auth/google/subjects',
    passport.authenticate( 'google', {
        successRedirect: '/',
        failureRedirect: '/login'
}));

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
})

app.use(subject);
app.use(noteRouter);

let port = process.env.PORT;
if (port == null || port == ""){
    port = 3000;
}

app.listen(port, () => {
    console.log("Open port " + port);
})
