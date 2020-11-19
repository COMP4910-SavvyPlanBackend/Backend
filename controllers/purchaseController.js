const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
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
