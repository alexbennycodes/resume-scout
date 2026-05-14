"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, getCurrentUser, onAuthStateChange } from "@/lib/supabase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Error getting current user:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          full_name: session.user.user_metadata?.full_name,
          avatar_url: session.user.user_metadata?.avatar_url,
        });
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await import("@/lib/supabase").then((m) => m.signInWithGoogle());
    if (error) {
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await import("@/lib/supabase").then((m) => m.signInWithEmail(email, password));
    if (error) {
      return { error };
    }
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    return { error: null };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { error } = await import("@/lib/supabase").then((m) => m.signUpWithEmail(email, password));
    return { error };
  };

  const signOut = async () => {
    await import("@/lib/supabase").then((m) => m.signOut());
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}