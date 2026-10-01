const checkPaymentWindow = (req, res, next) => {
  // Get current time specifically in IST (Asia/Kolkata)
  const now = new Date();
  const options = { 
    timeZone: 'Asia/Kolkata', 
    hour: 'numeric', 
    minute: 'numeric', 
    hour12: false 
  };
  const formatter = new Intl.DateTimeFormat([], options);
  const timeString = formatter.format(now); // Format example: "08:30"
  
  const [hourStr, minuteStr] = timeString.split(':');
  const currentHour = parseInt(hourStr, 10);
  const currentMinute = parseInt(minuteStr, 10);
  
  // Convert current time to total minutes from midnight for accurate comparison
  const totalMinutes = currentHour * 60 + currentMinute;
  const startLimit = 5 * 60;  // 05:00 AM = 300 minutes
  const endLimit = 11 * 60;   // 11:00 AM = 660 minutes

  if (totalMinutes < startLimit || totalMinutes > endLimit) {
    return res.status(403).json({
      success: false,
      message: "Payments are currently unavailable. Transactions are only accepted between 5:00 AM and 11:00 AM IST."
    });
  }

  next();
};

module.exports = { checkPaymentWindow };