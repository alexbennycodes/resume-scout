/**
 * Payments API
 */

import { apiFetch, apiPost } from './client';

export type SubscriptionTier = 'free' | 'pro' | 'pro_plus';
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing' | 'inactive';

export interface CreateCheckoutRequest {
  price_id: string;
  success_url?: string;
  cancel_url?: string;
}

export interface CheckoutResponse {
  checkout_url: string;
}

export interface PortalResponse {
  portal_url: string;
}

export interface SubscriptionStatusResponse {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  current_period_end?: string;
}

export async function createCheckout(request: CreateCheckoutRequest): Promise<CheckoutResponse> {
  const response = await apiPost('/payments/create-checkout', request);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to create checkout' }));
    throw new Error(error.detail || 'Failed to create checkout');
  }
  return response.json();
}

export async function createPortal(): Promise<PortalResponse> {
  const response = await apiPost('/payments/create-portal', {});
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to create portal' }));
    throw new Error(error.detail || 'Failed to create portal');
  }
  return response.json();
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatusResponse> {
  const response = await apiFetch('/payments/status');
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to get subscription status' }));
    throw new Error(error.detail || 'Failed to get subscription status');
  }
  return response.json();
}

// Price IDs - these would come from environment in production
export const PRICE_IDS = {
  pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || 'price_pro',
  pro_plus: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_PLUS || 'price_pro_plus',
};

export function getSuccessUrl(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/dashboard?subscription=success`;
  }
  return 'http://localhost:3000/dashboard?subscription=success';
}

export function getCancelUrl(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/pricing?subscription=cancelled`;
  }
  return 'http://localhost:3000/pricing?subscription=cancelled';
}