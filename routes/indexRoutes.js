const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const indexController = require('../controllers/indexController');

router.use(authController.isLoggedIn);

/* GET home page. */
/* Used to load data to fronted */
router.get('/',indexController.createPurchaseCheckout);
router.get('/prices', indexController.getPrices);
router.get('/account', indexController.getAccount);

//Renders user data information
router.get('/profile', authController.protect, indexController.getAccountPlans);
router.get('/user/allPurchases', authController.protect, indexController.getAllPurchases);

//Renders views for signin, signup and signout
router.get('/user/signin', indexController.getSignin);
router.get('/user/signup', indexController.getSignup);
router.get('/user/signout', indexController.postSignout);

module.exports = router;