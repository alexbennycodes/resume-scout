"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { createCheckout, getSubscriptionStatus, PRICE_IDS, getSuccessUrl, getCancelUrl, SubscriptionStatusResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Check from "lucide-react/dist/esm/icons/check";
import X from "lucide-react/dist/esm/icons/x";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out Resume Matcher",
    features: [
      { text: "1 Master Resume", included: true },
      { text: "3 Resume Tailoring/month", included: true },
      { text: "Basic Templates", included: true },
      { text: "PDF Export", included: true },
      { text: "Cover Letters", included: false },
      { text: "Priority Support", included: false },
      { text: "Custom Prompts", included: false },
    ],
    cta: "Current Plan",
    priceId: null,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For serious job seekers",
    features: [
      { text: "5 Master Resumes", included: true },
      { text: "Unlimited Tailoring", included: true },
      { text: "All Templates", included: true },
      { text: "PDF Export", included: true },
      { text: "Cover Letters", included: true },
      { text: "Priority Support", included: false },
      { text: "Custom Prompts", included: false },
    ],
    cta: "Upgrade to Pro",
    priceId: PRICE_IDS.pro,
    popular: true,
  },
  {
    id: "pro_plus",
    name: "Pro+",
    price: "$19",
    period: "/month",
    description: "For professionals who need more",
    features: [
      { text: "Unlimited Resumes", included: true },
      { text: "Unlimited Tailoring", included: true },
      { text: "All Templates", included: true },
      { text: "PDF Export", included: true },
      { text: "Cover Letters", included: true },
      { text: "Priority Support", included: true },
      { text: "Custom Prompts", included: true },
    ],
    cta: "Upgrade to Pro+",
    priceId: PRICE_IDS.pro_plus,
  },
];

export default function PricingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<SubscriptionStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscriptionStatus = searchParams.get("subscription");
  const isSuccess = subscriptionStatus === "success";
  const isCancelled = subscriptionStatus === "cancelled";

  useEffect(() => {
    if (user) {
      getSubscriptionStatus()
        .then(setSubscription)
        .catch(console.error);
    }
  }, [user]);

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      router.push("/login?redirect=/pricing");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await createCheckout({
        price_id: priceId,
        success_url: getSuccessUrl(),
        cancel_url: getCancelUrl(),
      });
      window.location.href = response.checkout_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start checkout");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentTier = () => {
    if (!subscription) return "free";
    return subscription.tier;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold mb-4">Choose Your Plan</h1>
          <p className="text-steel-grey text-lg">Start tailoring your resume to land your dream job</p>
        </div>

        {isSuccess && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 text-green-700 text-center">
            Subscription successful! Welcome to Pro.
          </div>
        )}

        {isCancelled && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 text-amber-700 text-center">
            Checkout was cancelled. You can try again when you're ready.
          </div>
        )}

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 text-center">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const currentTier = getCurrentTier();
            const isCurrentPlan = currentTier === plan.id;
            const isUpgrade =
              (plan.id === "pro" && currentTier === "free") ||
              (plan.id === "pro_plus" && (currentTier === "free" || currentTier === "pro"));
            const isDowngrade = plan.id !== "free" && !isUpgrade && !isCurrentPlan;

            return (
              <Card
                key={plan.id}
                className={`relative ${plan.popular ? "border-blue-700 border-2" : ""} ${isCurrentPlan ? "bg-blue-50" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-700 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider">
                    Most Popular
                  </div>
                )}

                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-serif">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-steel-grey">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <X className="w-5 h-5 text-steel-grey flex-shrink-0" />
                        )}
                        <span className={feature.included ? "" : "text-steel-grey"}>{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={isCurrentPlan ? "outline" : plan.popular ? "default" : "outline"}
                    disabled={isCurrentPlan || loading || (plan.id !== "free" && isDowngrade)}
                    onClick={() => plan.priceId && handleSubscribe(plan.priceId)}
                  >
                    {loading
                      ? "Loading..."
                      : isCurrentPlan
                        ? "Current Plan"
                        : isDowngrade
                          ? "Downgrade"
                          : plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-8 text-steel-grey text-sm">
          <p>All plans include a 14-day money-back guarantee.</p>
          <p className="mt-2">
            Questions?{" "}
            <a href="mailto:support@resumematcher.fyi" className="text-blue-700 hover:underline">
              Contact us
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}