/**
 * Subscription utility for feature gating
 */

import { useState, useEffect } from "react";
import { getSubscriptionStatus, SubscriptionStatusResponse, SubscriptionTier } from "@/lib/api";

const TIER_LEVELS: Record<SubscriptionTier, number> = {
  free: 0,
  pro: 1,
  pro_plus: 2,
};

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubscriptionStatus()
      .then(setSubscription)
      .catch(() => {
        // Default to free tier if we can't get subscription
        setSubscription({ tier: "free", status: "inactive" });
      })
      .finally(() => setLoading(false));
  }, []);

  const tierLevel = subscription ? TIER_LEVELS[subscription.tier] : 0;

  const hasAccess = (requiredTier: SubscriptionTier) => {
    return tierLevel >= TIER_LEVELS[requiredTier];
  };

  const canUseFeature = {
    unlimitedResumes: hasAccess("pro"),
    coverLetters: hasAccess("pro"),
    customPrompts: hasAccess("pro_plus"),
    prioritySupport: hasAccess("pro_plus"),
    unlimitedTailoring: hasAccess("pro"),
  };

  return {
    subscription,
    loading,
    tier: subscription?.tier || "free",
    status: subscription?.status || "inactive",
    hasAccess,
    canUseFeature,
  };
}

// Server-side check for middleware
export function checkTierAccess(userTier: SubscriptionTier, requiredTier: SubscriptionTier): boolean {
  return TIER_LEVELS[userTier] >= TIER_LEVELS[requiredTier];
}

// Feature definitions
export const FEATURES = {
  resumeLimit: {
    free: 1,
    pro: 5,
    pro_plus: Infinity,
  },
  tailoringLimit: {
    free: 3,
    pro: Infinity,
    pro_plus: Infinity,
  },
  templates: {
    free: ["classic-single"],
    pro: ["classic-single", "classic-two-column", "modern-single", "modern-two-column"],
    pro_plus: ["classic-single", "classic-two-column", "modern-single", "modern-two-column"],
  },
} as const;

export function getResumeLimit(tier: SubscriptionTier): number {
  return FEATURES.resumeLimit[tier];
}

export function getTailoringLimit(tier: SubscriptionTier): number {
  return FEATURES.tailoringLimit[tier];
}

export function getAvailableTemplates(tier: SubscriptionTier): string[] {
  return FEATURES.templates[tier];
}