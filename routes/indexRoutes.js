const express = require('express');
const router = express.Router();
//const Plan = require('../models/planModel');
//const User = require('../models/userModel');

//const purchaseController = require('../controllers/purchaseController');
const authController = require('../controllers/authController');
const indexController = require('../controllers/indexController');

router.use(authController.isLoggedIn);

/* GET home page. */
/* Used to load data to fronted */
router.get('/',indexController.createPurchaseCheckout);
router.get('/prices', indexController.getPrices);
router.get('/account', indexController.getAccount);

//make async
router.get('/profile', authController.protect, indexController.getAccountPlans);

//indexController.getAllPurchases (Make async in controller)
router.get('/user/allPurchases', authController.protect, indexController.getAllPurchases);

router.get('/user/signin', indexController.getSignin);
router.get('/user/signup', indexController.getSignup);
router.get('/user/signout', indexController.postSignout);

module.exports = router;