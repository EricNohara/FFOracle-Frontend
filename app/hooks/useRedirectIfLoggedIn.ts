"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthProvider";

// Redirects the user away from auth pages if already logged in
export function useRedirectIfLoggedIn() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // When the login state becomes true, push user to dashboard
    if (isLoggedIn) {
      router.replace("/dashboard"); // replace() avoids back-button returning to login
    }
  }, [isLoggedIn, router]);
}
