const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const AppError = require('../utils/appError');
const plan = require('../models/planModel')
const purchaseController = require('../controllers/purchaseController');
const authController = require('../controllers/authController');

const bodyParser = require('body-parser');

const router = express.Router();

router.use(authController.protect);

router.use(express.static(process.env.STATIC_DIR));
// Use JSON parser for all non-webhook routes.
router.use(purchaseController.getBody);

router.get('/', purchaseController.getPath);

router.get('/config', purchaseController.getConfig);

router.post('/create-customer', purchaseController.createCustomer);

router.post('/create-subscription', purchaseController.createSubscription);

router.post('/retry-invoice', purchaseController.retryInvoice);
  
router.post('/retrieve-upcoming-invoice', purchaseController.retreiveInvoice);
  
router.post('/cancel-subscription', purchaseController.cancelSubscription);
  
router.post('/update-subscription', purchaseController.updateSubscription);
  
router.post('/retrieve-customer-payment-method', purchaseController.retreivePaymentMethod);
  // Webhook handler for asynchronous events.

router.post('/webhook',bodyParser.raw({ type: 'application/json' }), purchaseController.webhooksHandler);

module.exports = router;
