export interface IUserData {
  leagues: ILeagueData[];
  userInfo: IUserInfo;
}

export interface ILeagueData {
  players: IPlayerData[];
  leagueId: string;
  leagueName: string;
  rosterSettings: IRosterSettings;
  scoringSettings: IScoringSettings;
  defenses: [];
}

export interface IUserInfo {
  id: string;
  email: string;
  tokens_left: number;
  allow_emails: boolean;
  fullname: string | null;
  phone_number: string | null;
}

export interface IPlayerData {
  game: IGameData;
  player: IPlayerInfo;
  picked: boolean;
  opponent: IOpponentTeam;
  seasonStats: IPlayerStats;
  weeklyStats: IPlayerStats[];
}

export interface IGameData {
  id: string;
  weekday: string;
  away_team: string;
  home_team: string;
  over_odds: number;
  total_line: number;
  under_odds: number;
  spread_line: number;
  stadium_name: string;
  game_datetime: string;
  stadium_style: string;
  away_moneyline: number;
  away_rest_days: number;
  home_moneyline: number;
  home_rest_days: number;
  away_spread_odds: number;
  home_spread_odds: number;
  is_divisional_game: boolean;
}

export interface IPlayerInfo {
  id: string;
  name: string;
  position: string;
  status: string | null;
  team_id: string | null;
  headshot_url: string | null;
  season_stats_id: string | null;
  status_description: string | null;
}

export interface IOpponentTeam {
  team: ITeamInfo;
  defensiveStats: ITeamDefensiveStats;
}

export interface ITeamInfo {
  id: string;
  name: string;
  division: string;
  logo_url: string;
  conference: string;
  defensive_stats_id: string | null;
  offensive_stats_id: string | null;
}

export interface ITeamDefensiveStats {
  id: string;
  def_tds: number | null;
  safeties: number | null;
  sacks_for: number | null;
  fumbles_for: number | null;
  pass_defended: number | null;
  sack_yards_for: number | null;
  tackles_for_loss: number | null;
  interceptions_for: number | null;
  interception_yards_for: number | null;
  tackle_for_loss_yards: number | null;
}

export interface IPlayerStats {
  id: string;
  carries: number | null;
  targets: number | null;
  receptions: number | null;
  completions: number | null;
  passing_epa: number | null;
  passing_tds: number | null;
  pat_percent: number | null;
  rushing_epa: number | null;
  rushing_tds: number | null;
  fg_made_list: number[] | null;
  pat_attempts: number | null;
  passing_yards: number | null;
  receiving_epa: number | null;
  receiving_tds: number | null;
  rushing_yards: number | null;
  sacks_against: number | null;
  fantasy_points: number | null;
  fg_missed_list: number[] | null;
  fg_blocked_list: number[] | null;
  fumbles_against: number | null;
  receiving_yards: number | null;
  passing_attempts: number | null;
  fantasy_points_ppr: number | null;
  passing_first_downs: number | null;
  rushing_first_downs: number | null;
  interceptions_against: number | null;
  receiving_first_downs: number | null;
}

export interface IRosterSettings {
  id: string;
  k_count: number;
  ir_count: number;
  qb_count: number;
  rb_count: number;
  te_count: number;
  wr_count: number;
  def_count: number;
  flex_count: number;
  bench_count: number;
}

export interface IScoringSettings {
  id: string;
  points_per_td: number;
  points_per_reception: number;
  points_per_passing_yard: number;
  points_per_rushing_yard: number;
  points_per_reception_yard: number;
}

export interface ILeagueDefense {
  game: IGameData;
  team: ITeamInfo;
  picked: boolean;
  opponent: IDefenseOpponentTeam;
  seasonStats: ITeamDefensiveStats;
}

export interface IDefenseOpponentTeam {
  team: ITeamInfo;
  offensiveStats: ITeamOffensiveStats;
}

export interface ITeamOffensiveStats {
  id: string;
  carries: number | null;
  targets: number | null;
  attempts: number | null;
  receptions: number | null;
  completions: number | null;
  passing_tds: number | null;
  rushing_tds: number | null;
  passing_yards: number | null;
  receiving_tds: number | null;
  rushing_yards: number | null;
  sacks_against: number | null;
  fumbles_against: number | null;
  receiving_yards: number | null;
  passing_interceptions: number | null;
}
