// interfaces for performance responses from backend API
export interface IPerformanceResponse {
  leaguePerformance: IWeeklyPerformance[];
  playerPerformance: IWeeklyPlayerPerformance[];
}

export interface IWeeklyPerformance {
  leagueId: string;
  week: number;
  actualFpts: number;
  maxFpts: number;
  accuracy: number;
}

export interface IWeeklyPlayerPerformance {
  leagueId: string;
  week: number;
  playerId: string;
  actualFpts: number;
  picked: boolean;
  positionRank: number;
  overallRank: number;
}
