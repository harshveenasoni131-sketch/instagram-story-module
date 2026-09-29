const express = require('express');
const router = express.Router();
const { upgradeSubscription } = require('./SubscriptionController');
const { checkPaymentWindow } = require('./middleware/PaymentWindow');

router.post('/upgrade', checkPaymentWindow, upgradeSubscription);

module.exports = router;