const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const AppError = require('../utils/appError');
//const purchaseController = require('../controllers/purchaseController');
//const authController = require('../controllers/authController');



const router = express.Router();

/*router.get(
  '/checkout-session/:planID',
  authController.protect,
  purchaseController.getCheckoutSession
);*/


























const calculateOrderAmount = items => {

  // Replace this constant with a calculation of the order's amount

  // Calculate the order total on the server to prevent

  // people from directly manipulating the amount on the client

  return 1400;

};

router.post("/create-payment-intent", async (req, res) => {

  const { items } = req.body;

  // Create a PaymentIntent with the order amount and currency

  const paymentIntent = await stripe.paymentIntents.create({

    amount: calculateOrderAmount(items),

    currency: "usd"

  });

  res.send({

    clientSecret: paymentIntent.client_secret

  });

});



router.post('/charge', async (req, res,next) => {
  try {
    console.log(`${req.body.name} ${req.body.email} ${req.body.source}`);
    stripe.customers
      .create({
        name: req.body.name,
        email: req.body.email,
        source: req.body.stripeToken
      })
      .then(customer =>
        stripe.charges.create({
          amount: req.body.amount * 100,
          currency: "usd",
          customer: customer.id
        })
      )
      .then(() => res.render("/completed.html"))
      .catch(err => next(new AppError(err.message,err.status)));
  } catch (err) {
    res.send(err);
  }
});

router.get('/checkout-session', async (req, res) => {
  const { sessionId } = req.query;
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  res.send(session);
});

// Fetch the Checkout Session to display the JSON result on the success page
router.post('/create-checkout-session', async (req, res) => {
  const domainURL = process.env.DOMAIN;
  const priceId = process.env.PRICE_ID;
  const productId = process.env.DONATION_PRODUCT_ID;

  // Create new Checkout Session for the order
  // Other optional params include:
  // [billing_address_collection] - to display billing address details on the page
  // [customer] - if you have an existing Stripe Customer ID
  // [customer_email] - lets you prefill the email input in the form
  // For full details see https://stripe.com/docs/api/checkout/sessions/create
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      //line_items: [
      //{
      // price: priceId,
      //quantity: 1,
      // },
      //],
      // ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID set as a query param
      success_url: `${domainURL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domainURL}/canceled.html`,
    });

    res.send({
      sessionId: session.id,
    });
  } catch (e) {
    res.status(200);
    return res.send({
      error: {
        message: e.message,
      },
    });
  }
});

router.get('/setup', (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    //basicPrice: process.env.BASIC_PRICE_ID,
    //proPrice: process.env.PRO_PRICE_ID,
  });
});

///router.post('/customer-portal', async (req, res) => {
// For demonstration purposes, we're using the Checkout session to retrieve the customer ID.
// Typically this is stored alongside the authenticated user in your database.
//  const { sessionId } = req.body;
//  const checkoutsession = await stripe.checkout.sessions.retrieve(sessionId);

// This is the url to which the customer will be redirected when they are done
// managign their billing with the portal.
//  const returnUrl = process.env.DOMAIN;

//  const portalsession = await stripe.billingPortal.sessions.create({
//  customer: checkoutsession.customer,
//    return_url: returnUrl,
//  });

//  res.send({
//    url: portalsession.url,
//  });
//});

// Webhook handler for asynchronous events.
router.post('/webhook', async (req, res) => {
  let data;
  let eventType;
  // Check if webhook signing is configured.
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    const signature = req.headers['stripe-signature'];

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    // Extract the object from the event.
    data = event.data;
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }

  if (eventType === 'checkout.session.completed') {
    console.log(`🔔  Payment received!`);
  }

  res.sendStatus(200);
});

/* router.listen(3000, () =>
  console.log(`Node server listening at http://localhost:${3000}/`)
); */

module.exports = router;