const mongoose = require('mongoose');
//const validators = require('validator');

const storeSchema = new mongoose.Schema({});

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;
