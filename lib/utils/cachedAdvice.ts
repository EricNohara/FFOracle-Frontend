import { IAiAdviceResponse } from "@/app/interfaces/IAiAdviceResponse";
import { ICachedAdvice } from "@/app/interfaces/ICachedAdvice";

const CACHE_KEY = "aiAdviceCache";
const CACHE_TTL = 1000 * 60 * 60 * 24 * 7; // 7 days

// Helper: normalize playerIds for reliable comparison
function normalizeIds(ids: string[]): string[] {
  return Array.from(new Set(ids)) // remove duplicates
    .sort(); // order-independent
}

export function getCachedAdvice(
  userId: string,
  leagueId: string,
  playerIds: string[]
): IAiAdviceResponse[] | null {
  const rawCache: ICachedAdvice[] = JSON.parse(
    localStorage.getItem(CACHE_KEY) || "[]"
  );

  const now = Date.now();
  const normalizedIncoming = normalizeIds(playerIds);

  // Filter out expired entries
  const validCache = rawCache.filter((c) => now - c.timestamp <= CACHE_TTL);

  // Save back only valid entries
  localStorage.setItem(CACHE_KEY, JSON.stringify(validCache));

  // Find match: same user, same league,
  // AND same normalized unique sorted roster players
  const match = validCache.find((c) => {
    if (c.userId !== userId || c.leagueId !== leagueId) return false;

    const normalizedStored = normalizeIds(c.playerIds);

    return (
      normalizedStored.length === normalizedIncoming.length &&
      normalizedStored.every((id, idx) => id === normalizedIncoming[idx])
    );
  });

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

  const normalizedIds = normalizeIds(playerIds);

  // remove old entry for same user + league
  const filtered = cache.filter(
    (c) => !(c.userId === userId && c.leagueId === leagueId)
  );

  filtered.push({
    userId,
    leagueId,
    playerIds: normalizedIds,
    advice,
    timestamp: Date.now(),
  });

  localStorage.setItem(CACHE_KEY, JSON.stringify(filtered));
}
