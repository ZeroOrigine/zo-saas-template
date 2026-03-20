import Stripe from 'stripe';
import { SERVER_CONFIG } from '@/lib/config';

export const stripe = new Stripe(SERVER_CONFIG.stripeSecretKey, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});
