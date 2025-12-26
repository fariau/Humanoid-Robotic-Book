"use client";

import { createAuthClient } from "better-auth/react";
import { ReactNode } from "react";

// Auth client create
const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3020",
  fetchOptions: {
    credentials: 'include',
  }
});

// Extract auth functions and hooks
export const { signIn, signUp, signOut } = authClient;
export const useSession = authClient.useSession;

export function CustomAuthProvider({ children }: { children: ReactNode }) {
  return (
    <>{children}</>
  );
}