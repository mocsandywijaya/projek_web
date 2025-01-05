const express = require('express');
const { register, login, forgotPassword, resetPassword } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword); // Route untuk forgot password
router.post('/reset-password', resetPassword); // Route untuk reset password

module.exports = router;
