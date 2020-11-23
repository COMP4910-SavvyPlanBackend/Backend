//follow old laptop
const crypto = require('crypto');
const mongoose = require('mongoose');
const validators = require('validator');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

const planSchema = new Schema({
  planID: {
    type: String,
    required: [true, 'Please provide an ID'],
  },
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
  },
  duration: {
    type: String,
    required: [true, 'Please provide a duration'],
    startDate: '',
    endDate: '',
  },
  paymentType: {
    type: String,
    required: [true, 'Please provide a payment type'],
  },
  summary: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },

  currency: {
    type: String,
  },
});

const Plan = mongoose.model('Plan', planSchema);

module.exports = Plan;
