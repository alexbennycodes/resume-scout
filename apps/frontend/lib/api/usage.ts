/**
 * Usage API
 */

import { apiFetch, apiPost } from './client';

export interface UsageSummary {
  tier: string;
  status: string;
  monthly_limits: {
    resume_tailor: number | 'unlimited';
    resume_upload: number | 'unlimited';
    cover_letters: boolean;
    pdf_export: number | 'unlimited';
  };
  current_usage: {
    action_counts: Record<string, number>;
    total_cost: number;
    total_tokens: number;
    month: string;
  };
  remaining: {
    resume_tailor: number | 'unlimited';
    resumes: number | 'unlimited';
  };
}

export async function getUsageSummary(): Promise<UsageSummary> {
  const response = await apiFetch('/usage/summary');
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to get usage' }));
    throw new Error(error.detail || 'Failed to get usage');
  }
  return response.json();
}

export async function getMonthlyUsage(): Promise<{
  action_counts: Record<string, number>;
  total_cost: number;
  total_tokens: number;
  month: string;
}> {
  const response = await apiFetch('/usage/monthly');
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to get monthly usage' }));
    throw new Error(error.detail || 'Failed to get monthly usage');
  }
  return response.json();
}

export async function checkActionLimit(action: string): Promise<{
  allowed: boolean;
  message: string;
  usage: Record<string, unknown>;
}> {
  const response = await apiFetch(`/usage/check/${action}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to check limit' }));
    throw new Error(error.detail || 'Failed to check limit');
  }
  return response.json();
}