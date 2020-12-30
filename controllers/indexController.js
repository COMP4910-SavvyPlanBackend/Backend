const { resolve } = require('path');
const bodyParser = require('body-parser');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const Plan = require('../models/planModel');
const Purchase = require('../models/purchaseModel');
const catchAsync = require('../utils/catchAsync');

/* GET home page. */
/* Used to load data to fronted */
exports.createPurchaseCheckout = (req, res, next) =>{
    res.render('index', { title: 'Home'});
  };

  exports.getPrices = (req, res, next) =>{
  //router.get('/prices', function(req, res, next) {
        res.render('prices', { title: 'Prices'});
  };

  exports.getAccount = (req, res, next) =>{
    //router.get('/account', function(req, res, next) {
      res.render('account', { title: 'Account' });
    };
  
    //make async
    exports.getAccountPlans = catchAsync(async(req, res, next) =>{
    //router.get('/profile', function(req, res, next) {
      const plans = await Plan.find();
      res.render('profile', { 
        title: 'Account Profile',
        plans
      });
    });
  
    //indexController.getAllPurchases (Make async in controller)
    exports.getAllPurchases = catchAsync(async(req, res, next) =>{
    //router.get('/user/allPurchases', authController.protect, function(req, res, next) {
  
      //1) Find all purchases
      const purchases = await Plan.find({user: req.user.id});
  
      // 2) Find purchases with returned ids
      const planIDs = purchases.map(el=>el.plan);
      const plans = await Plan.find({_id:{ $in:planIDs }});
  
      res.render('user/profile', { 
        title: 'My purchases',
        plans
      });
    });

    exports.getSignin = (req, res, next) =>{
    //router.get('/user/signin', function(req, res, next) {
      res.render('user/signin', { title: 'Signin' });
    };

    exports.getSignup = (req, res, next) =>{
    //router.get('/user/signup', function(req, res, next) {
      res.render('user/signup', { title: 'Signup' });
    };

    exports.postSignout = (req, res, next) =>{
    //router.post('/user/signout', function(req, res, next) {
      res.redirect('/');
    };