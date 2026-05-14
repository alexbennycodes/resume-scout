"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        setError(sessionError.message);
        return;
      }

      if (session) {
        const redirect = searchParams.get("redirect") || "/dashboard";
        router.push(redirect);
      } else {
        setError("No session found. Please try signing in again.");
      }
    };

    handleCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas p-4">
        <div className="text-center">
          <h1 className="text-xl font-serif mb-4">Authentication Error</h1>
          <p className="text-steel-grey mb-4">{error}</p>
          <button onClick={() => router.push("/login")} className="text-blue-700 hover:underline">
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-sm uppercase text-steel-grey">Signing you in...</p>
      </div>
    </div>
  );
}