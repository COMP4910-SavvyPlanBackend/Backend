const express = require('express');

const router = express.Router();
const authController = require('../controllers/authController');
const storeController = require('../controllers/storeController');

router.use(authController.protect);

//Post Store
router.post('/', storeController.postStore); //
//Get Stores by User ID
router.get('/user/:user_id', storeController.getAllStores);
//Get specific Store by user ID & store ID
router.get('/user/:user_id/:id', storeController.getStore);
//Update Store
router.patch('/update/:id', storeController.updateStore);
//Delete Store by ID
router.delete('/:id', storeController.deleteStore);

module.exports = router;
//post new store?

//
