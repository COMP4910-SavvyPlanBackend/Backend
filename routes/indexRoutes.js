const express = require('express');
const router = express.Router();
const Plan = require('../models/planModel');
const User = require('../models/userModel');

const authController = require('../controllers/authController');


router.use(authController.isLoggedIn);

/* GET home page. */
/* Used to load data to fronted */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home'});
});
router.get('/prices', function(req, res, next) {
      res.render('prices', { title: 'Prices'});
});
  router.get('/account', function(req, res, next) {
    res.render('account', { title: 'Account' });
  });
  router.get('/user/profile', authController.protect, function(req, res, next) {
    res.render('user/profile', { title: 'Profile' });
  });
  router.get('/user/signin', function(req, res, next) {
    res.render('user/signin', { title: 'Signin' });
  });
  router.get('/user/signup', function(req, res, next) {
    res.render('user/signup', { title: 'Signup' });
  });
  router.post('/user/signup', function(req, res, next) {
    res.redirect('/');
  });
module.exports = router;
