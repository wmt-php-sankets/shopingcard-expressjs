var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var csrf = require('csurf');
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var product = require('../models/product');
var csrfProtection = csrf({ cookie: true });
var User = require('../models/user');
var Order = require('../models/order');
var Cart = require('../models/card');
const flash = require('connect-flash');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/shoping-card', { useNewUrlParser: true, useUnifiedTopology: true });

// router.use(csrfProtaction);
const salt = 10;
router.use(flash());
router.use((req, res, next) => {
  res.locals.success_message = req.flash('success_message');
  res.locals.error_message = req.flash('error_message');
  res.locals.erroe = req.flash('error');
  next()
});

router.get('/signup', function (req, res, next) {
  try {
    res.render('user/signup', { csrfToken: req.csrfToken });
  }
  catch (error) {
    console.log(error)
  }
});


router.post('/signup', async function (req, res, next) {
  try {
    var username = req.body.email;
    var password = req.body.password;

    var error = '';
    var users = {
      email: username,
      password: bcrypt.hashSync(password, bcrypt.genSaltSync(salt, null))
    };


    const user = await User.findOne({ 'email': username })
    if (username == "") {
      var emptyerror = "email is empty";
      res.render('user/signup', { error: emptyerror });
    }
    else if (user) {
      var emailuseerror = "email is already usered";
      res.render('user/signup', { error: emailuseerror });
    }
    else {
      var data = new User(users);
      await data.save();
      res.render('user/profile');
    }
  }
  catch (error) {
    throw error
  }
});

router.get('/signin', function (req, res, next) {
  try {
    res.render('user/signin', { csrfToken: req.csrfToken });
  }
  catch (error) {
    throw error
  }
});


router.post('/signin', (req, res, next) => {
  try {
    passport.authenticate('local', {
      failureRedirect: '/user/signin',
      successRedirect: '/user/profile',
      failureFlash: true
    })(req, res, next);
  } catch (error) {
    throw error;
  }
});

const checkAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/');
  }
}

router.get('/profile',checkAuthenticated,  function (req, res, next) {
  try {
    Order.find({ user: req.user }, function (err, orders) {
      if (err) {
        return res.write('Error!');
      }
      var cart;
         orders.forEach( async function (order) {
      const  cart = await new Cart(order.cart);

        order.items = cart.generateArray();
      });
      res.render('user/profile', { orders: orders });
    });

  }
  catch (error) {
    throw error
  }
});


router.get('/logout', function (req, res, next) {
  try {
    req.session.destroy();
    req.logout();
    res.redirect('/');
  }

  catch (error) {
    throw error
  }
});
module.exports = router;
