import { useState, useEffect, useContext, createContext } from 'react';
import React from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const SubscriptionContext = createContext(null);

/* =====================================================
   Currency formatter
   ===================================================== */
export function formatCurrency(amount, currency, rates) {
  const SYMBOLS = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
  };

  const cur = currency || 'USD';
  const r = rates && rates[cur] ? rates[cur].rate : 1;

  return (SYMBOLS[cur] || '$') + (amount * r).toFixed(2);
}

/* =====================================================
   Default State
   ===================================================== */
const DEFAULT = {
  plan: 'free',
  planName: 'Free',
  price: 0,
  credits: 0,
  creditsResetAt: null,
  features: {},
  displayCurrency: 'USD',
  currencyRates: {},
  allPlans: {},
  isPro: false,
  isEnterprise: false,
  canGenerate: false,
  canChat: false,
  loading: true, // Start loading as true so lock screens don't flash
};

/* =====================================================
   Provider
   ===================================================== */
export function SubscriptionProvider({ children }) {
  const { user } = useAuth();
  const [sub, setSub] = useState({ ...DEFAULT });

  async function refresh() {
    const token = localStorage.getItem('gc_token');

    // Not logged in
    if (!token) {
      setSub({ ...DEFAULT, loading: false });
      return;
    }

    try {
      const res = await api.get('/user/plan');
      const d = res.data;

      // Strictly map UI access to the live MongoDB response
      setSub({
        ...d,
        loading: false,
        isPro: d.plan === 'pro' || d.plan === 'enterprise',
        isEnterprise: d.plan === 'enterprise',
        canGenerate: (d.plan === 'pro' || d.plan === 'enterprise') && d.credits > 0,
        canChat: d.plan === 'pro' || d.plan === 'enterprise',
        formatPrice: function (a) {
          return formatCurrency(
            a,
            d.displayCurrency,
            d.currencyRates
          );
        },
      });
    } catch (err) {
      // Silent fallback to Free plan if the backend request fails
      setSub({ ...DEFAULT, loading: false });
    }
  }

  /* =====================================================
     Init + token watcher
     ===================================================== */
  useEffect(() => {
    refresh();

    function onStorage(e) {
      if (e.key === 'gc_token') refresh();
    }

    window.addEventListener('storage', onStorage);
    return () =>
      window.removeEventListener('storage', onStorage);
  }, [user]);

  const value = {
    ...sub,
    refresh,
    formatPrice:
      sub.formatPrice ||
      function (a) {
        return '$' + parseFloat(a).toFixed(2);
      },
  };

  return React.createElement(
    SubscriptionContext.Provider,
    { value },
    children
  );
}

/* =====================================================
   Hook
   ===================================================== */
export function useSubscription() {
  return (
    useContext(SubscriptionContext) || {
      ...DEFAULT,
      refresh: () => {},
      formatPrice: a => '$' + a,
    }
  );
}