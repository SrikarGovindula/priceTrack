const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rateLimiter');

router.post('/register', rateLimiter({ maxRequests: 20 }), authController.register);
router.post('/login', rateLimiter({ maxRequests: 30 }), authController.login);
router.post('/logout', requireAuth, authController.logout);
router.get('/me', requireAuth, authController.getMe);
router.put('/profile', requireAuth, authController.updateProfile);
router.post('/forgot-password', rateLimiter({ maxRequests: 10 }), authController.forgotPassword);
router.post('/reset-password', rateLimiter({ maxRequests: 10 }), authController.resetPassword);

module.exports = router;
