"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { IPlayerData, ILeagueDefense } from "../interfaces/IUserData";

const supabase = createClient();

// Conditional return type:
// If position === "DEF", the API returns defenses.
// Otherwise it returns player objects.
type PlayerResponse<T extends string> = T extends "DEF"
  ? ILeagueDefense[]
  : IPlayerData[];

// Fetches players/defenses for a given position using a typed response.
export function usePlayersByPosition<T extends string>(position: T) {
  // Holds the list returned from backend (players or defenses)
  const [players, setPlayers] = useState<PlayerResponse<T> | null>(null);

  // Loading and error state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Memoized fetch function so it can be reused for refresh()
  const fetchPlayers = useCallback(async () => {
    if (!position) return;

    setIsLoading(true);
    setError(null);

    try {
      // Retrieve current Supabase session for auth token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      // If user is not logged in, skip fetch
      if (!accessToken) {
        setError("User not authenticated");
        setPlayers(null);
        setIsLoading(false);
        return;
      }

      // Request players by position from backend
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/GetPlayersByPosition/${position}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch players for ${position}`);
      }

      // Response shape is inferred from T (players or defenses)
      const data = await res.json();
      setPlayers(data as PlayerResponse<T>);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setPlayers(null);
    } finally {
      setIsLoading(false);
    }
  }, [position]);

  // Auto-fetch when position changes or on mount
  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  // Expose data and a refresh method
  return { players, isLoading, error, refresh: fetchPlayers };
}
