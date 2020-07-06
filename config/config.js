var express = require('express');
var router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const bcrypt = require('bcrypt-nodejs');
const localStrategy = require('passport-local').Strategy;
const session = require('express-session');
const cookieParser = require('cookie-parser');


router.use(cookieParser('secret'));
router.use(session({
    secret: 'secret',
    maxAge: 3600000,
    resave: true,
    saveUninitialized: true,
}));

router.use(passport.initialize());
router.use(passport.session());



    // passport.use(new localStrategy({usernameField : 'email',passwordField : 'password'},(email,password,done)=>{
    //     User.findOne({'email' : email},(err,data)=>{
    //     if(err) throw err;
    //       if(err){
    //         return done(null,false);
    //       }
    //       if(!data){
    //         return done(null,false,{message : 'Email not Exist'});
    //       }
    //       if(!data.validPassword(password)){
    //         return done(null,false,{message : 'Password doesnt match'});
    //       }
    //       return done(null,data);
    //   });
    // }));

    passport.use(new localStrategy({ usernameField: 'email' }, (email, password, done) => {
        
        User.findOne({ email: email }, (err, data) => {
            if (err) throw err;
            if (!data) {
                return done(null, false, { message: "User Doesn't Exists.." });
            }
            bcrypt.compare(password, data.password, (err, match) => {                
                if (err) {
                    return done(null, false);
                }
                if (!match) {
                    return done(null, false, { message: "Password Doesn't Match" });
                }
                if (match) {
                    return done(null, data);
                }
            });
        });
    }));

    passport.serializeUser(function (user, cb) {
        cb(null, user.id);
    });

    passport.deserializeUser(function (id, cb) {
        User.findById(id, function (err, user) {
            cb(err, user);
        });
    });

    module.exports = router;