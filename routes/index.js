var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var csrf = require('csurf');
var passport = require('passport');
var product = require('../models/product');
var csrfProtection = csrf({ cookie: true });
var User = require('../models/user');
var mongoose = require('mongoose');
var Cart = require('../models/card');
var Order = require('../models/order');

mongoose.connect('mongodb://localhost:27017/shoping-card', { useNewUrlParser: true, useUnifiedTopology: true });


const checkAuthenticated = function (req, res, next) {
  // console.log(req.isAuthenticated());
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/user/signin');
    console.log('run');
  }
}


// router.use(csrfProtection);
/* GET home page. */

router.get('/', async function (req, res, next) {
  const obj = [];
  var successMsg = req.flash('success')[0];
  var products =  await Product.find().then(function (doc, err) {
    doc.map(i => {
      obj.push({
        imagePath: i.imagePath,
        title: i.title,
        description: i.description,
        price: i.price,
        id: i._id
      });
    });
    res.render('shop/index', { title: 'Shopping Cart', products: obj, successMsg: successMsg, noMessages: !successMsg });
  });
});

router.get('/add-to-cart/:id', (req, res, next) => {
  const productId = req.params.id;
  const cart = new Cart(req.session.cart ? req.session.cart : { items: {} });
  Product.findById(productId, (err, product) => {
    if (err) {
      return res.redirect('/');
    }
    cart.add(product, product.id);
    req.session.cart = cart;
    console.log(req.session.cart);
    res.redirect('/');
  });
});


router.get('/reduce/:id' ,  function (req, res, next) {
  const productId = req.params.id;
  const cart = new Cart(req.session.cart ? req.session.cart : { items: {} });
  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect('/shopping-card');
});

router.get('/remove/:id', function (req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect('/shopping-card');
});

router.get('/shopping-card', async function (req, res, next) {
  try {
    if (!req.session.cart) {
      return res.render('/shop/shoping-card', { products: null });
    }
    var cart = await new Cart(req.session.cart);
    res.render('shop/shoppingcard', { products: cart.generateArray(), totalPrice: cart.totalPrice });
  }
  catch (error) {
    throw error
  }
});

router.get('/checkout', checkAuthenticated, function (req, res, next) {
  try {
    if (!req.session.cart) {
      return res.redirect('/shoppingcard');
    }
    var cart = new Cart(req.session.cart);
    var errMsg = req.flash('error')[0];
    res.render('shop/checkout', { totalPrice: cart.totalPrice, errMsg: errMsg, noError: !errMsg });
  } catch (error) {
    throw error
  }
});

router.post('/checkout', async function (req, res, next) {
  try{ 

    if (!req.session.cart) {
      return res.redirect('/shoppingcard');
    }
    var cart = await new Cart(req.session.cart);
    var stripe = require("stripe")("sk_test_51GsNXYGyCztClCHGmoqOLsYYm21ckUFVOrCyt8m38I8VApr5JEpooUMzQkwuuGe0yepGnoKWHCZnsYCnYVHZOkI600WBJfc5Nr");
    console.log("req.body.stripeToken", req.body.stripeToken)
    stripe.charges.create({
      amount: cart.totalPrice * 100,
      currency: "inr",
      source: req.body.stripeToken, // obtained with Stripe.js
      description: "Test Charge"
    }, function (err, charge) {
      if (err) {
        req.flash('error', err.message);
        return res.redirect('/checkout');
      }
      req.flash('success', 'Successfull bougth  products');
      var order = new Order({
        user: req.user,
        cart: cart,
        address: req.body.address,
        name: req.body.name,
        paymentId: charge.id
      });
      order.save(function (err, result) {
        req.session.cart = null;
        console.log('done');
        res.redirect('/');
      });
    });
  
  }
  catch(error){
    throw error
  }

});
module.exports = router;

