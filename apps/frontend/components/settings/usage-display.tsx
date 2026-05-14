"use client";

import { useEffect, useState } from "react";
import { getUsageSummary, UsageSummary } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Scissors from "lucide-react/dist/esm/icons/scissors";
import CreditCard from "lucide-react/dist/esm/icons/credit-card";

export function UsageDisplay() {
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUsageSummary()
      .then(setUsage)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-steel-grey" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700">
        Unable to load usage: {error}
      </div>
    );
  }

  if (!usage) return null;

  const tierColors = {
    free: "bg-steel-grey",
    pro: "bg-blue-700",
    pro_plus: "bg-violet-700",
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-steel-grey uppercase tracking-wider">Current Plan</p>
          <p className="text-2xl font-serif font-bold capitalize">{usage.tier.replace("_", " ")}</p>
        </div>
        <span className={`px-3 py-1 text-white text-sm font-bold uppercase ${tierColors[usage.tier as keyof typeof tierColors]}`}>
          {usage.status}
        </span>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Resume Tailoring */}
        <Card variant="default" className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <Scissors className="w-5 h-5 text-blue-700" />
            <span className="font-mono text-sm uppercase text-steel-grey">Resume Tailoring</span>
          </div>
          <div className="text-3xl font-bold">
            {typeof usage.remaining.resume_tailor === "number" ? (
              <>
                {usage.current_usage.action_counts.resume_tailor || 0}
                <span className="text-lg text-steel-grey font-normal"> / {usage.monthly_limits.resume_tailor}</span>
              </>
            ) : (
              <span className="text-green-600">Unlimited</span>
            )}
          </div>
        </Card>

        {/* Resumes */}
        <Card variant="default" className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-green-600" />
            <span className="font-mono text-sm uppercase text-steel-grey">Resumes</span>
          </div>
          <div className="text-3xl font-bold">
            {typeof usage.remaining.resumes === "number" ? (
              <>
                {usage.current_usage.action_counts.resume_upload || 0}
                <span className="text-lg text-steel-grey font-normal"> / {usage.monthly_limits.resume_upload}</span>
              </>
            ) : (
              <span className="text-green-600">Unlimited</span>
            )}
          </div>
        </Card>
      </div>

      {/* Feature Access */}
      <Card variant="default" className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="w-5 h-5 text-violet-700" />
          <span className="font-mono text-sm uppercase text-steel-grey">Features</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-steel-grey">Cover Letters</span>
            <span className={usage.monthly_limits.cover_letters ? "text-green-600" : "text-red-600"}>
              {usage.monthly_limits.cover_letters ? "Included" : "Pro only"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-steel-grey">PDF Export</span>
            <span className="text-green-600">Included</span>
          </div>
        </div>
      </Card>

      {/* Upgrade Prompt for Free Users */}
      {usage.tier === "free" && (
        <div className="p-4 bg-blue-50 border border-blue-200">
          <p className="text-blue-800">
            Upgrade to Pro for unlimited resume tailoring and more features!
          </p>
        </div>
      )}
    </div>
  );
}