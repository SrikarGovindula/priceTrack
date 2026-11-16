const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', alertController.getAlerts);
router.post('/', alertController.createAlert);
router.put('/:id', alertController.updateAlert);
router.delete('/:id', alertController.deleteAlert);

module.exports = router;
