const express = require('express');
const advisorController = require('../controllers/advisorController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signupAdvisor);
router.post('/login', authController.loginAdvisor);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPasswordAdvisor);
router.patch('/resetPassword/:token', authController.resetPasswordAdvisor);

//all below are protected
router.use(authController.protect);

router.patch('/updateMe', advisorController.updateMe);
router.delete('/deleteMe', advisorController.deleteMe);

module.exports = router;
