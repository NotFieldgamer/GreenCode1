import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import Page from '../components/Page';
import api from '../utils/api';
import { toast } from '../components/Toast';
import { useSubscription } from '../hooks/useSubscription';

export default function Checkout() {
  const { plan } = useParams(); // Gets 'pro' or 'enterprise' from the URL
  const navigate = useNavigate();
  const { refresh } = useSubscription(); // To update the UI instantly after purchase
  const [loading, setLoading] = useState(false);

  // Auto-format the plan name
  const planName = plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : 'Unknown';
  const price = plan === 'enterprise' ? '$29.99/mo' : '$9.99/mo';

  async function handleCheckout(e) {
    e.preventDefault();
    setLoading(true);

    try {
      // Call the backend route we fixed earlier!
      await api.post('/user/upgrade', { plan: plan.toLowerCase() });
      
      toast(`Successfully upgraded to ${planName}!`, 'success');
      await refresh(); // Instantly syncs the UI tags/sidebar to the new plan
      navigate('/dashboard'); // Send them back to the app
    } catch (err) {
      toast('Payment failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page title="Secure Checkout" desc="Upgrade your account to unlock premium AI capabilities.">
      <div style={{ maxWidth: '500px', margin: '2rem auto' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px', padding: '2rem', backdropFilter: 'blur(12px)'
        }}>
          
          {/* Order Summary */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ margin: '0 0 0.5rem', color: '#fff' }}>GreenCode {planName}</h3>
              <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.9rem' }}>Billed monthly</p>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#00ffcc' }}>
              {price}
            </div>
          </div>

          {/* Demo Payment Form */}
          <form onSubmit={handleCheckout}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#9ca3af', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Name on Card</label>
              <input type="text" required placeholder="Pragya" style={{
                width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none'
              }} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#9ca3af', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Card Number</label>
              <div style={{ position: 'relative' }}>
                <CreditCard size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" required placeholder="0000 0000 0000 0000" maxLength="19" style={{
                  width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none'
                }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'block', color: '#9ca3af', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Expiry Date</label>
                <input type="text" required placeholder="MM/YY" maxLength="5" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#9ca3af', marginBottom: '0.5rem', fontSize: '0.85rem' }}>CVC</label>
                <input type="text" required placeholder="123" maxLength="3" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '1rem', borderRadius: '8px', border: 'none',
              background: loading ? '#374151' : 'linear-gradient(135deg, #00ffcc, #00d4ff)',
              color: loading ? '#9ca3af' : '#000', fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'
            }}>
              {loading ? <Loader2 size={18} className="spin" /> : <ShieldCheck size={18} />}
              {loading ? 'Processing...' : `Pay ${price}`}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1rem', color: '#6b7280', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
            <Zap size={12} color="#00d4ff" /> This is a demo gateway. No real charges apply.
          </div>

        </div>
      </div>
    </Page>
  );
}