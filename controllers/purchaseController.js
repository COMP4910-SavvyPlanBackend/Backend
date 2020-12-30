const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
});
const { resolve } = require('path');
const bodyParser = require('body-parser');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const Plan = require('../models/planModel');
const Purchase = require('../models/purchaseModel');
const catchAsync = require('../utils/catchAsync');
const { pathToFileURL } = require('url');
const { query } = require('express');

// Use JSON parser for all non-webhook routes.
exports.getBody = (req, res, next) => {
  if (req.originalUrl === '/webhook') {
    next();
  } else {
    bodyParser.json()(req, res, next);
  }
};

/** getCheckoutSession
 * Private
 * GET
 * return checkout session
 * @param req Express Request object
 * @param res Express Response object
 * @param next Express next() middleware in stack
 * @return session tokens
 * @async
 */
exports.getCheckoutSession = catchAsync(async(req, res, next) =>{
  //1) Get the currently booked plan
  const plan = await Plan.findById(req.params.id);
  //2) Create session as response
  const session = await stripe.checkout.sessions.create({
    payment_method_types:['card'],
    success_url: `${req.protocol}://${req.get('host')}/?plan=${req.params.id}&user=${req.user.id}&price=${plan.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/prices`,
    customer_email: req.user.email,
    client_reference_id: req.params.id,
    line_items: [
      {
        name:`${plan.name} Plan`,
        description: plan.summary,
        //if needed link to live hosted image because stripe stores image on server
        //imaes:[`https://link.com/image/${plan.imageCover}`],
        amount: plan.amount * 100,
        currency: 'cad',
        quantity: 1,
      }
    ]
  })
  // 3) send it to client
  res.status(200).json({
    status:'success',
    session
  });

});
/** createPurchaseCheckout
 * Private
 * POST
 * creates purchase checkout
 * @param req Express Request object
 * @param res Express Response object
 * @param next Express next() middleware in stack
 * @return plan, user, price
 * @async
 */
exports.createPurchaseCheckout = catchAsync(async(req,res,next) =>{
  //This is temporarary until deployment
  const{plan,user,price} = req.query;
  if(!plan && !user && !price){
    return next();
  }
  await Purchase.create({plan, user, price});

  res.redirect(req.originalUrl.split('?')[0]);
});
/** getPath
 * Private
 * GET
 * renders index page
 * @param req Express Request object
 * @param res Express Response object
 * @return index page(for frontend)
 * @async
 */
exports.getPath = catchAsync(async (req, res) => {
  //const plan = await Plan.find();
  const path = resolve(`${process.env.STATIC_DIR}../views/index.ejs`);
  res.sendFile(path);
});
/** getPlans
 * Private
 * GET
 * renders plan page
 * @param req Express Request object
 * @param res Express Response object
 * @return plan page(for frontend)
 * @async
 */
exports.getPlans = catchAsync( async(req,res)=>{
  const plans = await Plan.find();
  res.render('../views/prices', {plans: plans});
  //console.log("Data passed: " + plans);
});

exports.getConfig = catchAsync(async (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

/** createCustomer
 * Private
 * POST
 * creates a customer
 * @param req Express Request object
 * @param res Express Response object
 * @param next Express next() middleware in stack
 * @return customerToken
 * @async
 */
exports.createCustomer = catchAsync(async (req, res, next) => {

  // Create a new customer object
  const customer = await stripe.customers.create({
    email: req.body.email,
  });

  // save the customer.id as stripeCustomerId
  // in your database.

  res.send({ customer });
});
/** getOneSubscription
 * Private
 * GET
 * returns one specific subscription of user
 * @param req Express Request object
 * @param res Express Response object
 * @param next Express next() middleware in stack
 * @return status, subscription
 * @async
 */
exports.getOneSubscription = catchAsync(async( req, res, next)=>{
  const query = Purchase.findById(req.params.subscriptionId);
  const doc = await query;
  if(!doc){
    next(new AppError('No subscription found with that ID', 404));
  }
  else{
    res.status(200).json({ status: 'success', data:  doc  });
    //res.render('../views/user/profile', {subscription: doc});
  }
  
});

/** getAllSubscription
 * Private
 * GET
 * returns all subscriptions of user
 * @param req Express Request object
 * @param res Express Response object
 * @param next Express next() middleware in stack
 * @return status, listofsubscriptions
 * @async
 */
exports.getAllSubscription = catchAsync(async(req,res,next)=>{
  const query = Purchase.find();
  const doc = await query;

  if(!doc){
    next(new AppError('No subscriptions found', 404));
  }
  else{
    res.status(200).json({ status: 'success', data:  doc  });
    //res.render('../views/user/profile', {subscription: doc});
  }

  //res.render('../views/user/profile', {subscription: subscriptions});

});
/** createSubscription
 * Private
 * POST
 * Create a subscription
 * @param req Express Request object
 * @param res Express Response object
 * @return status, updated user
 * @async
 */
exports.createSubscription = catchAsync(async (req, res) => {
  // Set the default payment method on the customer
  //let paymentMethod;
  try {
    await stripe.paymentMethods.attach(
      req.body.paymentMethodId,
      {
        customer: req.body.customerId,
      }
    );
  } catch (error) {
    return res.status(402).send({ error: { message: error.message } });
  }

  await stripe.customers.update(
    req.body.customerId,
    {
      invoice_settings: {
        default_payment_method: req.body.paymentMethodId,
      },
    }
  );
  const id = req.body.priceId === 'BASIC' ? process.env.BASIC : process.env.PREMIUM;
  const trial = id === 'BASIC' ? 7 : 30;
  // Create the subscription
  const subscription = await stripe.subscriptions
    .create({
      customer: req.body.customerId,
      items: [{ price: id }],
      expand: ['latest_invoice.payment_intent'],
      trial_period_days: trial,
    })
    .catch((err) => console.error(err));

  res.send(subscription);
});
/** retryInvoice
 * Private
 * POST
 * tries new payment instance
 * @param req Express Request object
 * @param res Express Response object
 * @return status, paymentMethodId
 * @async
 */
exports.retryInvoice = catchAsync(async (req, res) => {
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
/** retreiveInvoice
 * Private
 * GET
 * returns invoice informations
 * @param req Express Request object
 * @param res Express Response object
 * @return invoice
 * @async
 */
exports.retreiveInvoice = catchAsync(async (req, res) => {
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
/** cancelSubscription
 * Private
 * DEL
 * Deletes a subscription
 * @param req Express Request object
 * @param res Express Response object
 * @return deleted subscription
 * @async
 */
exports.cancelSubscription = catchAsync(async (req, res) => {
  // Delete the subscription
  const deletedSubscription = await stripe.subscriptions.del(
    req.body.subscriptionId
  );
  res.send(deletedSubscription);
});
/** updateSubscription
 * Private
 * POST
 * updates a subscription
 * @param req Express Request object
 * @param res Express Response object
 * @return updated subscription
 * @async
 */
exports.updateSubscription = catchAsync(async (req, res) => {
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
/** retreivePaymentMethod
 * Private
 * GET
 * returns paymentMethod
 * @param req Express Request object
 * @param res Express Response object
 * @return paymentMethodId
 * @async
 */
exports.retreivePaymentMethod = catchAsync(async (req, res) => {
  const paymentMethod = await stripe.paymentMethods.retrieve(
    req.body.paymentMethodId
  );

  res.send(paymentMethod);
});
// Webhook handler for asynchronous events.

exports.webhooksHandler = catchAsync(async (req, res) => {
  // Retrieve the event by verifying the signature using the raw body and secret.
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.header('Stripe-Signature'),
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    //console.log(err);
    console.log(`⚠️  Webhook signature verification failed.`);
    console.log(`⚠️  Check the env file and enter the correct webhook secret.`);
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
  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
});

//module.exports = router;
