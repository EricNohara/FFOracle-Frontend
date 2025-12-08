import { IAiAdviceResponse } from "./IAiAdviceResponse";

// cached advice in local storage
export interface ICachedAdvice {
  userId: string;
  leagueId: string;
  playerIds: string[];
  timestamp: number;
  advice: IAiAdviceResponse[];
}
