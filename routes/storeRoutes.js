const express = require('express');

const router = express.Router();
const authController = require('../controllers/authController');
//const storeController = require('../controllers/storeController');

router.use(authController.protect);
//get store for id

//patch store by id

//post new store?
