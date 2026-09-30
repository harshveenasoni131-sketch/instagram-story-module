const express = require('express');
const router = express.Router();
const { upgradeSubscription, checkPaymentWindow } = require('./SubscriptionController');

router.post('/upgrade', checkPaymentWindow, upgradeSubscription);

module.exports = router;