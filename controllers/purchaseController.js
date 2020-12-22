const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
});
const { resolve } = require('path');
const bodyParser = require('body-parser');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

const catchAsync = require('../utils/catchAsync');

// Use JSON parser for all non-webhook routes.
exports.getBody = (req, res, next) => {
  if (req.originalUrl === '/webhook') {
    next();
  } else {
    bodyParser.json()(req, res, next);
  }
};

exports.getPath = (req, res) => {
  const path = resolve(`${process.env.STATIC_DIR}../views/index.html`);
  res.sendFile(path);
};

exports.getConfig = catchAsync(async (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

exports.createCustomer = catchAsync(async (req, res, next) => {
  //const user = await User.find({ email: req.body.email });
  // Create a new customer object
  const customer = await stripe.customers.create({
    email: req.body.email,
  });

  // save the customer.id as stripeCustomerId
  // in your database.

  res.send({ customer });
});

exports.createSubscription = catchAsync(async (req, res) => {
  // Set the default payment method on the customer
  let paymentMethod;
  try {
    paymentMethod = await stripe.paymentMethods.attach(
      req.body.paymentMethodId,
      {
        customer: req.body.customerId,
      }
    );
  } catch (error) {
    return res.status(200).send({ error: { message: error.message } });
  }

  const updateCustomerDefaultPaymentMethod = await stripe.customers.update(
    req.body.customerId,
    {
      invoice_settings: {
        default_payment_method: paymentMethod.id,
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
      //trial_period_days: trial,
    })
    .catch((err) => console.error(err));

  res.send(subscription);
});

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

exports.cancelSubscription = catchAsync(async (req, res) => {
  // Delete the subscription
  const deletedSubscription = await stripe.subscriptions.del(
    req.body.subscriptionId
  );
  res.send(deletedSubscription);
});

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
