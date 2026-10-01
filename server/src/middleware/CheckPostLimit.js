const Subscription = require('../Modles/Subscription');

const checkPostLimit = async (req, res, next) => {
  try {
    // Assuming you attach user id from your auth middleware (e.g., req.user.id)
    const userId = req.user?.id || req.body.userId; 

    const subscription = await Subscription.findOne({ userId, status: 'active' });

    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: "No active subscription found. Please subscribe to a plan to post."
      });
    }

    // Gold plan has unlimited posts (represented as -1 or Infinity)
    if (subscription.postLimit !== -1 && subscription.postsUsed >= subscription.postLimit) {
      return res.status(403).json({
        success: false,
        message: `Post limit reached for your ${subscription.planName} plan. Please upgrade your subscription to post more.`
      });
    }

    // Attach subscription to request so the post route can increment 'postsUsed'
    req.subscription = subscription;
    next();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { checkPostLimit };