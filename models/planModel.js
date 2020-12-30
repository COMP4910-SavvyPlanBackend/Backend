const mongoose = require('mongoose');

const { Schema } = mongoose;

const planSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  amount: {
    type: Number,
    required: [true, 'Please provide an amount'],
  },
  interval: {
    type: String,
    required: [true, 'Please enter an interval'],
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
