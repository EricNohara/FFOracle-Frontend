import { createClient } from "@/lib/supabase/client";

export async function authFetch(url: string, options: RequestInit = {}) {
  const supabase = createClient();

  // Always fetch latest session (auto-refresh happens internally)
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) throw new Error("User not authenticated");

  console.log("SENDING:", {
    url,
    method: options.method,
    headers: options.headers,
    body: options.body,
  });

  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}
