const express = require('express');

const router = express.Router();
const authController = require('../controllers/authController');
const storeController = require('../controllers/storeController');

router.use(authController.protect);

//Post Store
router.post('/createStore', storeController.createStore); //
//Ger Store
router.get('/getStore', storeController.getStore); //

//saveStore
router.patch('/saveStore', storeController.saveStore);
//Delete Store by ID

router.delete('/:id', storeController.deleteStore);

module.exports = router;
//post new store?

//
