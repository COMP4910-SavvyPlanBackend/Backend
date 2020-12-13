const stripe = require('stripe');
const Plan = require('./../models/planModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getCheckoutSession = catchAsync(async (req, res, next) =>{
    // 1) get current plan
    const plan = await Plan.findById(req.params.planId);    

    // 2) create checkout session
    const session = await stripe.checkout.session.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/`,
        //sends back to previous state ?!?!
        cancel_url: `${req.protocol}://${req.get('host')}/`,
        customer_email: req.user.email,
        client_reference_id: req.params.planId,
        line_items:[
            {
                name:`${plan.name} Plan`,
                description: plan.summary,
                price: plan.price * 100,
                currency: 'usd',
                quantity: 1
            }
        ]
    })

    // 3) Send to client
    res,status(200).json({
        status: 'success',
        session
    });
});

exports.createCheckoutSession = catchAsync(async (req, res, next) =>{
    const domainURL = process.env.DOMAIN;
    const { priceId } = req.body;
  
    // Create new Checkout Session for the order
    // Other optional params include:
    // [billing_address_collection] - to display billing address details on the page
    // [customer] - if you have an existing Stripe Customer ID
    // [customer_email] - lets you prefill the email input in the form
    // For full details see https://stripe.com/docs/api/checkout/sessions/create
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
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
        }
      });
    }
  });

exports.setupConfig = catchAsync(async (req, res, next) =>{
    res.send({
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      //basicPrice: process.env.BASIC_PRICE_ID,
      //proPrice: process.env.PRO_PRICE_ID,
    });
  });

exports.customerPortal = catchAsync(async (req, res, next) =>{
        // For demonstration purposes, we're using the Checkout session to retrieve the customer ID. 
        // Typically this is stored alongside the authenticated user in your database.
        const { sessionId } = req.body;
        const checkoutsession = await stripe.checkout.sessions.retrieve(sessionId);
      
        // This is the url to which the customer will be redirected when they are done
        // managign their billing with the portal.
        const returnUrl = process.env.DOMAIN;
      
        const portalsession = await stripe.billingPortal.sessions.create({
          customer: checkoutsession.customer,
          return_url: returnUrl,
        });
      
        res.send({
          url: portalsession.url,
        });
});

exports.webhookHandler = catchAsync(async (req, res, next) =>{
    let eventType;
    // Check if webhook signing is configured.
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      // Retrieve the event by verifying the signature using the raw body and secret.
      let event;
      let signature = req.headers["stripe-signature"];
  
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
  
    if (eventType === "checkout.session.completed") {
      console.log(`🔔  Payment received!`);
    }
  
    res.sendStatus(200);
  });