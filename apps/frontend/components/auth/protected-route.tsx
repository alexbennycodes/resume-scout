"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const publicPaths = ["/login", "/signup", "/auth/callback"];

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    const isPublicPath = publicPaths.some((path) => pathname === path || pathname.startsWith(path + "/"));

    if (!user && !isPublicPath) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" />
          <p className="font-mono text-sm uppercase text-steel-grey">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}