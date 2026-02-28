import { useState, useEffect, useContext, createContext } from 'react';
import React from 'react';
import api from '../utils/api';

const SubscriptionContext = createContext(null);

export function formatCurrency(amount, currency, rates) {
  const SYMBOLS = { USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥', CAD: 'C$', AUD: 'A$' };
  const cur = currency || 'USD';
  const r = (rates && rates[cur]) ? rates[cur].rate : 1;
  return (SYMBOLS[cur] || '$') + (amount * r).toFixed(2);
}

const DEFAULT = {
  plan: 'free', planName: 'Free', price: 0,
  credits: 0, creditsResetAt: null,
  features: {},
  displayCurrency: 'USD', currencyRates: {}, allPlans: {},
  isPro: false, isEnterprise: false, canGenerate: false, canChat: false,
  loading: false,
};

export function SubscriptionProvider({ children }) {
  const [sub, setSub] = useState({ ...DEFAULT, loading: false });

  async function refresh() {
    // Only fetch if the user has a JWT token — avoids 401 loops on public pages
    const token = localStorage.getItem('gc_token');
    if (!token) {
      setSub({ ...DEFAULT, loading: false });
      return;
    }
    setSub(function(s) { return { ...s, loading: true }; });
    try {
      var res = await api.get('/user/plan');
      var d = res.data;
      setSub({
        ...d,
        loading: false,
        isPro:        d.plan === 'pro' || d.plan === 'enterprise',
        isEnterprise: d.plan === 'enterprise',
        canGenerate:  (d.plan === 'pro' || d.plan === 'enterprise') && d.credits > 0,
        canChat:      d.plan === 'pro' || d.plan === 'enterprise',
        formatPrice:  function(a) { return formatCurrency(a, d.displayCurrency, d.currencyRates); },
      });
    } catch (err) {
      // 401 = not logged in, just reset to free defaults quietly
      setSub({ ...DEFAULT, loading: false });
    }
  }

  useEffect(function() {
    refresh();
    // Re-check whenever local storage token changes (login / logout)
    function onStorage(e) {
      if (e.key === 'token') refresh();
    }
    window.addEventListener('storage', onStorage);
    return function() { window.removeEventListener('storage', onStorage); };
  }, []);

  var value = {
    ...sub,
    refresh,
    formatPrice: sub.formatPrice || function(a) { return '$' + parseFloat(a).toFixed(2); },
  };

  return React.createElement(SubscriptionContext.Provider, { value: value }, children);
}

export function useSubscription() {
  return useContext(SubscriptionContext) || { ...DEFAULT, refresh: function() {}, formatPrice: function(a) { return '$' + a; } };
}
