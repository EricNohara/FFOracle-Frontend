import { IAiAdviceResponse } from "@/app/interfaces/IAiAdviceResponse";
import { ICachedAdvice } from "@/app/interfaces/ICachedAdvice";

const CACHE_KEY = "aiAdviceCache";
const CACHE_TTL = 1000 * 60 * 60 * 24 * 7; // 7 days in milliseconds

export function getCachedAdvice(
  userId: string,
  leagueId: string,
  playerIds: string[]
): IAiAdviceResponse[] | null {
  const rawCache: ICachedAdvice[] = JSON.parse(
    localStorage.getItem(CACHE_KEY) || "[]"
  );
  const now = Date.now();

  // Filter out expired entries
  const validCache = rawCache.filter((c) => now - c.timestamp <= CACHE_TTL);

  // Save back only valid entries
  localStorage.setItem(CACHE_KEY, JSON.stringify(validCache));

  // Try to find a match
  const match = validCache.find(
    (c) =>
      c.userId === userId &&
      c.leagueId === leagueId &&
      JSON.stringify(c.playerIds) === JSON.stringify(playerIds)
  );

  return match ? match.advice : null;
}

export function setCachedAdvice(
  userId: string,
  leagueId: string,
  playerIds: string[],
  advice: IAiAdviceResponse[]
) {
  const cache: ICachedAdvice[] = JSON.parse(
    localStorage.getItem(CACHE_KEY) || "[]"
  );
  // remove old entry for this user+league
  const filtered = cache.filter(
    (c) => !(c.userId === userId && c.leagueId === leagueId)
  );
  filtered.push({ userId, leagueId, playerIds, advice, timestamp: Date.now() });
  localStorage.setItem(CACHE_KEY, JSON.stringify(filtered));
}
