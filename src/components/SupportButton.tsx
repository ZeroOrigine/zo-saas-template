'use client';

import { useState } from 'react';

interface SupportButtonProps {
  amount: number;
}

const RAILWAY_URL = process.env.NEXT_PUBLIC_RAILWAY_URL || 'https://zo-langgraph-production-3c96.up.railway.app';

export default function SupportButton({ amount }: SupportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${RAILWAY_URL}/donations/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      if (!res.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await res.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      // Fallback: open mailto with amount context
      window.location.href = `mailto:hello@zeroorigine.com?subject=Support ZeroOrigine ($${amount}/mo)&body=I'd like to support ZeroOrigine at $${amount}/month.`;
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="amount-button"
      aria-label={`Support with ${amount} dollar${amount === 1 ? '' : 's'} per month`}
    >
      {loading ? '...' : `$${amount}`}
      <span className="amount-label">/mo</span>
    </button>
  );
}
