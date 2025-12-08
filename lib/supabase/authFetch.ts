import { createClient } from "@/lib/supabase/client";

// helper function to perform an authenticated fetch that attaches the bearer auth supabase access token
export async function authFetch(url: string, options: RequestInit = {}) {
  const supabase = createClient();

  // Always fetch latest session (auto-refresh happens internally)
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) throw new Error("User not authenticated");

  // log for testing
  // console.log("SENDING:", {
  //   url,
  //   method: options.method,
  //   headers: options.headers,
  //   body: options.body,
  // });

  // perform the fetch with the authorization token
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}
