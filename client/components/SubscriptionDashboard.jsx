import React, { useState, useEffect } from 'react';
import './SubscriptionDashboard.css';

const PLANS = {
  free: { name: 'Free Plan', price: '₹0', posts: '1 Post limit', postLimit: 1 },
  bronze: { name: 'Bronze Plan', price: '₹100 / mo', posts: 'Up to 3 posts', postLimit: 3 },
  silver: { name: 'Silver Plan', price: '₹300 / mo', posts: 'Up to 5 posts', postLimit: 5 },
  gold: { name: 'Gold Plan', price: '₹1000 / mo', posts: 'Unlimited posts', postLimit: Infinity }
};

export default function SubscriptionDashboard() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [invoice, setInvoice] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Modal & Detailed Payment Form States
  const [activePlanModal, setActivePlanModal] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  
  // Specific payment field states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('SBI');

  const userId = "user_123";

  // Fetch current subscription status on load
  useEffect(() => {
    fetch(`http://localhost:5000/api/subscriptions/status/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSubscription(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching subscription:", err);
        setLoading(false);
      });
  }, []);

  // Finalize payment and call backend upgrade API
  const handleConfirmPayment = async () => {
    if (!activePlanModal) return;

    if (paymentMethod === 'card') {
      if (!cardNumber || cardNumber.length < 16) {
        alert('❌ Please enter a valid 16-digit card number.');
        return;
      }
      if (!cardExpiry) {
        alert('❌ Please enter a valid expiry date.');
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        alert('❌ Please enter a valid 3-digit CVV.');
        return;
      }
    }

    setIsProcessing(true);
    setMessage('');
    setInvoice(null);

    try {
      const response = await fetch('http://localhost:5000/api/subscriptions/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          plan: activePlanModal,
          paymentStatus: 'success',
          method: paymentMethod
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ ${data.message} (Paid via ${paymentMethod.toUpperCase()})`);
        setInvoice(data.invoice);
        setSubscription(prev => ({
          ...prev,
          currentPlan: PLANS[data.subscription.plan]?.name || data.subscription.plan,
          postsUsed: data.subscription.postsUsed,
          postsAllowed: PLANS[data.subscription.plan]?.postLimit || prev?.postsAllowed,
          validityUntil: data.subscription.validityUntil
        }));
        setActivePlanModal(null); // Close modal
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      setMessage('❌ Network error connecting to payment gateway.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="loading">Loading subscription details...</div>;

  return (
    <div className="subscription-container" style={{ padding: '20px', position: 'relative' }}>
      <h2>Membership & Subscription Plans</h2>
      
      {subscription && (
        <div className="current-status-card" style={{ background: '#f0f2f5', padding: '15px', borderRadius: '8px', margin: '15px 0' }}>
          <h3>Current Plan: <span className="highlight" style={{ color: '#0095f6' }}>{(subscription.currentPlan || '').toUpperCase()}</span></h3>
          <p>Posts Used: <strong>{subscription.postsUsed} / {subscription.postsAllowed}</strong></p>
          <p>Valid Until: <strong>{subscription.validityUntil ? new Date(subscription.validityUntil).toLocaleDateString() : 'N/A'}</strong></p>
        </div>
      )}

      {message && <div className="alert-message" style={{ margin: '15px 0', padding: '10px', background: '#eef', borderRadius: '5px', color: '#333' }}>{message}</div>}

      {invoice && (
        <div className="invoice-box" style={{ background: '#ffffff', padding: '15px', margin: '15px 0', border: '2px solid #0095f6', borderRadius: '8px', color: '#333333' }}>
          <h4 style={{ color: '#0095f6', marginBottom: '8px' }}>📄 Payment Invoice Generated</h4>
          <p style={{ color: '#333333', margin: '4px 0' }}><strong>Invoice ID:</strong> {invoice.invoiceId}</p>
          <p style={{ color: '#333333', margin: '4px 0' }}><strong>Plan:</strong> {invoice.planName}</p>
          <p style={{ color: '#333333', margin: '4px 0' }}><strong>Amount Paid:</strong> {invoice.amountPaid}</p>
          <p style={{ color: '#333333', margin: '4px 0' }}><strong>Next Renewal:</strong> {invoice.nextRenewalDate}</p>
        </div>
      )}

      <div className="plans-grid" style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {Object.entries(PLANS).map(([key, plan]) => {
          const isCurrent = subscription?.currentPlan?.toLowerCase().includes(key);
          return (
            <div key={key} className="plan-card" style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', background: '#fff' }}>
              <h4>{plan.name}</h4>
              <p className="price"><strong>{plan.price}</strong></p>
              <p className="limit">{plan.posts}</p>
              <button 
                onClick={() => setActivePlanModal(key)}
                disabled={isCurrent}
                style={{ 
                  padding: '8px 12px', 
                  background: isCurrent ? '#ccc' : '#0095f6', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: isCurrent ? 'not-allowed' : 'pointer',
                  width: '100%',
                  marginTop: '10px'
                }}
              >
                {isCurrent ? 'Active Plan' : `Upgrade to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* PAYMENT GATEWAY MODAL */}
      {activePlanModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', padding: '25px', borderRadius: '10px', width: '380px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginBottom: '10px', color: '#111' }}>Select Payment Method</h3>
            <p style={{ fontSize: '14px', color: '#444', marginBottom: '15px' }}>
              Upgrading to <strong>{PLANS[activePlanModal]?.name}</strong> ({PLANS[activePlanModal]?.price})
            </p>

            {/* Payment Method Selector Radio Buttons with Dark Text */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#111', fontWeight: '500' }}>
                <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={(e) => setPaymentMethod(e.target.value)} />
                📱 UPI / QR Code
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#111', fontWeight: '500' }}>
                <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} />
                💳 Credit / Debit Card
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#111', fontWeight: '500' }}>
                <input type="radio" name="payment" value="netbanking" checked={paymentMethod === 'netbanking'} onChange={(e) => setPaymentMethod(e.target.value)} />
                🏦 Net Banking
              </label>
            </div>

            {/* DYNAMIC FORM FIELDS */}
            <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #e9ecef' }}>
              
              {paymentMethod === 'upi' && (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '13px', color: '#333', marginBottom: '8px', fontWeight: '500' }}>Scan QR Code with any UPI App (GPay/PhonePe)</p>
                  <div style={{ width: '120px', height: '120px', background: '#222', color: '#fff', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', borderRadius: '4px' }}>
                    [ MOCK QR CODE ]
                  </div>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="Card Number (16 digits)" 
                    maxLength="16"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', color: '#000' }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      placeholder="MM/YY" 
                      maxLength="5"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', width: '50%', color: '#000' }}
                    />
                    <input 
                      type="password" 
                      placeholder="CVV" 
                      maxLength="3"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', width: '50%', color: '#000' }}
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div>
                  <label style={{ fontSize: '12px', color: '#333', display: 'block', marginBottom: '5px', fontWeight: '600' }}>Select Your Bank:</label>
                  <select 
                    value={selectedBank} 
                    onChange={(e) => setSelectedBank(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', color: '#000' }}
                  >
                    <option value="SBI">State Bank of India (SBI)</option>
                    <option value="HDFC">HDFC Bank</option>
                    <option value="ICICI">ICICI Bank</option>
                    <option value="AXIS">Axis Bank</option>
                  </select>
                </div>
              )}

            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                style={{ flex: 1, padding: '10px', background: isProcessing ? '#6c757d' : '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: isProcessing ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
              >
                {isProcessing ? 'Processing...' : 'Pay Now'}
              </button>
              <button 
                onClick={() => setActivePlanModal(null)}
                disabled={isProcessing}
                style={{ flex: 1, padding: '10px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}