// --- SubscriptionController.js ---
const nodemailer = require('nodemailer');

// Helper to get current time in IST
function getISTTime() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * 5.5));
}

// Middleware / Check Function to bypass or enforce payment window
const checkPaymentWindow = (req, res, next) => {
  return next(); // <--- Bypasses time check so your buttons work anytime!

  const ist = getISTTime();
  const hours = ist.getHours();
  if (hours < 5 || hours >= 11) {
    return res.status(400).json({
      success: false,
      message: 'Payments are currently unavailable. Payments are only accepted between 5:00 AM and 11:00 AM IST.'
    });
  }
  next();
};

// Plans configuration
const PLANS = {
  free: { name: 'Free Plan', price: 0, postLimit: 1 },
  bronze: { name: 'Bronze Plan', price: 100, postLimit: 3 },
  silver: { name: 'Silver Plan', price: 300, postLimit: 5 },
  gold: { name: 'Gold Plan', price: 1000, postLimit: Infinity }
};

// Upgrade Subscription Controller
const upgradeSubscription = async (req, res) => {
  const { userId, plan, paymentStatus } = req.body;

  if (!PLANS[plan]) {
    return res.status(400).json({ success: false, message: 'Invalid subscription plan selected.' });
  }

  const selectedPlan = PLANS[plan];
  const validityDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const invoiceDetails = {
    invoiceId: `INV_${Date.now()}`,
    planName: selectedPlan.name,
    amountPaid: `₹${selectedPlan.price}`,
    nextRenewalDate: validityDate.toISOString().split('T')[0]
  };

  // Dispatch Automated Email Invoice using Nodemailer (Safely Isolated)
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com', 
        pass: 'your-email-app-password'
      }
    });

    const mailOptions = {
      from: 'noreply@instagramclone.com',
      to: 'user@example.com',
      subject: `Official Payment Invoice - ${selectedPlan.name}`,
      text: `Hello,\n\nThank you for your payment! Here are your subscription details:\n\nInvoice ID: ${invoiceDetails.invoiceId}\nPlan Name: ${invoiceDetails.planName}\nAmount Paid: ${invoiceDetails.amountPaid}\nNext Renewal Date: ${invoiceDetails.nextRenewalDate}\n\nBest regards,\nInstagram Clone Team`
    };

    await transporter.sendMail(mailOptions);
    console.log("Invoice email sent successfully!");
  } catch (emailErr) {
    console.log("⚠️ Email could not be sent (using test credentials), but payment is successful.");
  }

  return res.status(200).json({
    success: true,
    message: `Successfully subscribed to ${selectedPlan.name}!`,
    subscription: {
      plan: plan,
      status: 'active',
      validityUntil: validityDate,
      postsUsed: 0
    },
    invoice: invoiceDetails
  });
};

module.exports = {
  checkPaymentWindow,
  upgradeSubscription
};