"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { IPlayerData, ILeagueDefense } from "../interfaces/IUserData";

const supabase = createClient();

type PlayerResponse<T extends string> = T extends "DEF"
  ? ILeagueDefense[]
  : IPlayerData[];

export function usePlayersByPosition<T extends string>(position: T) {
  const [players, setPlayers] = useState<PlayerResponse<T> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayers = useCallback(async () => {
    if (!position) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      if (!accessToken) {
        setError("User not authenticated");
        setPlayers(null);
        setIsLoading(false);
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/GetPlayersByPosition/${position}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch players for ${position}`);
      }

      const data = await res.json();

      setPlayers(data as PlayerResponse<T>);
    } catch (err: any) {
      setError(err.message ?? "Unknown error");
      setPlayers(null);
    } finally {
      setIsLoading(false);
    }
  }, [position]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  return { players, isLoading, error, refresh: fetchPlayers };
}
