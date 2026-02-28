import React from 'react';
import { Link, useSubscription } from '../hooks/useSubscription';
import { Zap } from 'lucide-react';
import { useSubscription as useSub } from '../hooks/useSubscription';
import { Link as RLink } from 'react-router-dom';

export default function CreditsBadge() {
  const { credits, isPro, isEnterprise } = useSub();
  if (!isPro && !isEnterprise) return null;

  const low = credits <= 5;

  return (
    <div
      className="credits-badge"
      style={low ? { borderColor: 'rgba(248,113,113,0.25)', color: 'var(--red)' } : {}}
      title="Generator credits remaining"
    >
      <Zap size={11} style={{ color: low ? 'var(--red)' : 'var(--amber)' }} />
      {credits} credit{credits !== 1 ? 's' : ''}
    </div>
  );
}
