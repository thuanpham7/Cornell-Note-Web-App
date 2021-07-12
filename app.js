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
     secret: "This is a secret",
     resave: false,
     saveUninitialized: false
}));

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser())

app.use(passport.initialize());
app.use(passport.session());

const db = process.env.DB;
const mongoConnect = mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://www.example.com/auth/google/subjects"
  },
  function(accessToken, refreshToken, profile, done) {
       User.findOrCreate({ googleId: profile.id }, function (err, user) {
         return done(err, user);
       });
  }
));

//Running app from routes

app.get('/register', (req, res) => {
    res.render('register');
})

app.post('/register', (req, res) => {
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
    res.render('login');
})

app.post('/login', (req, res) => {

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

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
})

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
})

app.use(subject);
app.use(noteRouter);

app.listen(3000, () => {
    console.log("Open port 3000");
})
