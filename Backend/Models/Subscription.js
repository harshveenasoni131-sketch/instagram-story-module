const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  planName: { 
    type: String, 
    enum: ['Free', 'Bronze', 'Silver', 'Gold'], 
    default: 'Free' 
  },
  postLimit: { 
    type: Number, 
    default: 1 // Free = 1, Bronze = 3, Silver = 5, Gold = -1 (unlimited)
  },
  postsUsed: { 
    type: Number, 
    default: 0 
  },
  status: { 
    type: String, 
    enum: ['active', 'expired', 'cancelled'], 
    default: 'active' 
  },
  startDate: { 
    type: Date, 
    default: Date.now 
  },
  renewalDate: { 
    type: Date 
  },
  amountPaid: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);