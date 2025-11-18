import { IAiAdviceResponse } from "./IAiAdviceResponse";

export interface ICachedAdvice {
  userId: string;
  leagueId: string;
  playerIds: string[];
  timestamp: number;
  advice: IAiAdviceResponse[];
}
