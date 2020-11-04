const express = require('express');

const router = express.Router();
const authController = require('../controllers/authController');
const storeController = require('../controllers/storeController');

router.use(authController.protect);

//Post Store
router.post('/', authController.protect, storeController.postStore);
//Get Stores by User ID
router.get('/user/:user_id', authController.protect, storeController.getAllStores);
//Get specific Store by user ID & store ID
router.get('/user/:user_id/:id', authController.protect, storeController.getStore);
//Update Store
router.patch('/:id', authController.protect, storeController.updateStore);
//Delete Store by ID
router.delete('/:id', authController.protect, storeController.deleteStore);