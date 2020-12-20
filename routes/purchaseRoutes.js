const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const AppError = require('../utils/appError');
//const purchaseController = require('../controllers/purchaseController');
//const authController = require('../controllers/authController');

//require('dotenv').config({ path: './.env' });


const { resolve } = require('path');
const bodyParser = require('body-parser');

const router = express.Router();

router.use(express.static(process.env.STATIC_DIR));
// Use JSON parser for all non-webhook routes.
router.use((req, res, next) => {
  if (req.originalUrl === '/webhook') {
    next();
  } else {
    bodyParser.json()(req, res, next);
  }
});

router.get('/', (req, res) => {
  const path = resolve(process.env.STATIC_DIR + '../views/index.html');
  res.sendFile(path);
});

router.get('/config', async (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

router.post('/create-customer', async (req, res) => {
  // Create a new customer object
  const customer = await stripe.customers.create({
    email: req.body.email,
  });

  // save the customer.id as stripeCustomerId
  // in your database.

  res.send({ customer });
});

router.post('/create-subscription', async (req, res) => {
  // Set the default payment method on the customer
  let paymentMethod;
  try {
    paymentMethod = await stripe.paymentMethods.attach(
      req.body.paymentMethodId, {
        customer: req.body.customerId,
      }
    );
  } catch (error) {
    return res.status(200).send({ error: { message: error.message } });
  }

  let updateCustomerDefaultPaymentMethod = await stripe.customers.update(
    req.body.customerId,
    {
      invoice_settings: {
        default_payment_method: paymentMethod.id,
      },
    }
  );
     const id = req.body.priceID === 'BASIC' ? process.env.BASIC :process.env.PREMIUM;
    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: req.body.customerId,
      items: [{ price: id}],
      expand: ['latest_invoice.payment_intent'],
    }).catch(err => console.log(err));
  
    res.send(subscription);
  });
  
  router.post('/retry-invoice', async (req, res) => {
    // Set the default payment method on the customer
  
    try {
      await stripe.paymentMethods.attach(req.body.paymentMethodId, {
        customer: req.body.customerId,
      });
      await stripe.customers.update(req.body.customerId, {
        invoice_settings: {
          default_payment_method: req.body.paymentMethodId,
        },
      });
    } catch (error) {
      // in case card_decline error
      return res
        .status('402')
        .send({ result: { error: { message: error.message } } });
    }
  
    const invoice = await stripe.invoices.retrieve(req.body.invoiceId, {
      expand: ['payment_intent'],
    });
    res.send(invoice);
  });
  
  router.post('/retrieve-upcoming-invoice', async (req, res) => {
    const subscription = await stripe.subscriptions.retrieve(
      req.body.subscriptionId
    );
  
    const invoice = await stripe.invoices.retrieveUpcoming({
      customer: req.body.customerId,
      subscription: req.body.subscriptionId,
      subscription_items: [
        {
          id: subscription.items.data[0].id,
          deleted: true,
        },
        {
          price: process.env[req.body.newPriceId],
          deleted: false,
        },
      ],
    });
    res.send(invoice);
  });
  
  router.post('/cancel-subscription', async (req, res) => {
    // Delete the subscription
    const deletedSubscription = await stripe.subscriptions.del(
      req.body.subscriptionId
    );
    res.send(deletedSubscription);
  });
  
  router.post('/update-subscription', async (req, res) => {
    const subscription = await stripe.subscriptions.retrieve(
      req.body.subscriptionId
    );
    const updatedSubscription = await stripe.subscriptions.update(
      req.body.subscriptionId,
      {
        cancel_at_period_end: false,
        items: [
          {
            id: subscription.items.data[0].id,
            price: process.env[req.body.newPriceId],
          },
        ],
      }
    );
  
    res.send(updatedSubscription);
  });
  
 router.post('/retrieve-customer-payment-method', async (req, res) => {
    const paymentMethod = await stripe.paymentMethods.retrieve(
      req.body.paymentMethodId
    );
  
    res.send(paymentMethod);
  });
  // Webhook handler for asynchronous events.
  router.post(
    '/webhook',
    bodyParser.raw({ type: 'application/json' }),
    async (req, res) => {
      // Retrieve the event by verifying the signature using the raw body and secret.
      let event;
  
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          req.header('Stripe-Signature'),
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        console.log(err);
        console.log(`⚠️  Webhook signature verification failed.`);
        console.log(
          `⚠️  Check the env file and enter the correct webhook secret.`
        );
        return res.sendStatus(400);
      }
      // Extract the object from the event.
      const dataObject = event.data.object;
  
      // Handle the event
      // Review important events for Billing webhooks
      // https://stripe.com/docs/billing/webhooks
      // Remove comment to see the various objects sent for this sample
      switch (event.type) {
        case 'invoice.paid':
          // Used to provision services after the trial has ended.
          // The status of the invoice will show up as paid. Store the status in your
          // database to reference when a user accesses your service to avoid hitting rate limits.
          break;
        case 'invoice.payment_failed':
          // If the payment fails or the customer does not have a valid payment method,
          //  an invoice.payment_failed event is sent, the subscription becomes past_due.
          // Use this webhook to notify your user that their payment has
          // failed and to retrieve new card details.
          break;
        case 'invoice.finalized':
          // If you want to manually send out invoices to your customers
          // or store them locally to reference to avoid hitting Stripe rate limits.
          break;
        case 'customer.subscription.deleted':
          if (event.request != null) {
            // handle a subscription cancelled by your request
            // from above.
          } else {
            // handle subscription cancelled automatically based
            // upon your subscription settings.
          }
          break;
        case 'customer.subscription.trial_will_end':
          // Send notification to your user that the trial will end
          break;
        default:
        // Unexpected event type
      }
      res.sendStatus(200);
    }
  );

/*//router.get(
  //'/checkout-session/:planID',
  //authController.protect,
  //purchaseController.getCheckoutSession
//);

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
      .create({ebhook signing is recommended, but if the secret is not configured in `config.js`,
    // retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }

  if (eventType === 'checkout.session.completed') {
    console.log(`🔔  Payment received!`);
  }

  res.sendStatus(200);
});

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
    // rebhook signing is recommended, but if the secret is not configured in `config.js`,
    // retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }

  if (eventType === 'checkout.session.completed') {
    console.log(`🔔  Payment received!`);
  }

  res.sendStatus(200);
});

// router.listen(3000, () =>
//  console.log(`Node server listening at http://localhost:${3000}/`)
//); */

module.exports = router;