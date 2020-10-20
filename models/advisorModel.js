const crypto = require('crypto');
const mongoose = require('mongoose');
const validators = require('validator');
const bcrypt = require('bcryptjs');

const advisorSchema = new mongoose.Schema({});

const Advisor = mongoose.model('Advisor', advisorSchema);

module.exports = Advisor;
