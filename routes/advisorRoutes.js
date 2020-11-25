const express = require('express');
const advisorController = require('../controllers/advisorController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signupAdvisor);
router.post('/login', authController.loginAdvisor);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPasswordAdvisor);
router.patch('/resetPassword/:token', authController.resetPasswordAdvisor);

router.get('/getAdvisor/:id', advisorController.getAdvisorById);

router.patch('/updateMe', authController.protect, advisorController.updateMe);
router.delete('/deleteMe', authController.protect, advisorController.deleteMe);

module.exports = router;
