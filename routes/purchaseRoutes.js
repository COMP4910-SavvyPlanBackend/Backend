const express = require('express');
const bodyParser = require('body-parser');
const purchaseController = require('../controllers/purchaseController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

// router.get('/user/signup', function(req, res, next){
//   //add authentication token
//   res.render('user.signup', authController: req.);
// })



router.use(express.static(process.env.STATIC_DIR));
// Use JSON parser for all non-webhook routes.
router.use(purchaseController.getBody);

router.get('/', purchaseController.getPath);

router.get('/checkout-session/:id', purchaseController.getCheckoutSession);

router.get('/prices', purchaseController.getPlans);

router.get('/config', purchaseController.getConfig);

router.post('/create-customer', purchaseController.createCustomer);



router.post('/retry-invoice', purchaseController.retryInvoice);

router.post('/create-subscription', purchaseController.createSubscription);
router.get('/oneSubscription', purchaseController.getOneSubscription);
router.get('/allSubscription', purchaseController.getAllSubscription);
router.delete('/cancel-subscription', purchaseController.cancelSubscription);
router.post('/update-subscription', purchaseController.updateSubscription);


router.get('/retrieve-upcoming-invoice', purchaseController.retreiveInvoice);


router.get(
  '/retrieve-customer-payment-method',
  purchaseController.retreivePaymentMethod
);
// Webhook handler for asynchronous events.

router.post(
  '/webhook',
  bodyParser.raw({ type: 'application/json' }),
  purchaseController.webhooksHandler
);

module.exports = router;
