import { ILeagueData } from "@/app/interfaces/IUserData";

export const FLEX_ELIGIBLE = ["RB", "WR", "TE"];

export function getRosterSlotsByPosition(
  league: ILeagueData | null,
  position: string
) {
  if (!league || !league.rosterSettings) return -1;

  switch (position) {
    case "QB":
      return league.rosterSettings.qb_count;
    case "RB":
      return league.rosterSettings.rb_count;
    case "WR":
      return league.rosterSettings.wr_count;
    case "TE":
      return league.rosterSettings.te_count;
    case "DEF":
      return league.rosterSettings.def_count;
    case "K":
      return league.rosterSettings.k_count;
    case "FLEX":
      return league.rosterSettings.flex_count;
    case "BENCH":
      return league.rosterSettings.bench_count;
    default:
      return -1;
  }
}

export function isSpaceRemainingForPlayerAtPosition(
  league: ILeagueData | null,
  position: string
): boolean {
  if (!league || !league.rosterSettings) return false;

  const posSlots = getRosterSlotsByPosition(league, position);
  const flexSlots = getRosterSlotsByPosition(league, "FLEX");
  const benchSlots = getRosterSlotsByPosition(league, "BENCH");
  const isFlexEligible = FLEX_ELIGIBLE.includes(position);

  // Initialize usage
  const perPositionUsed: Record<string, number> = {
    QB: 0,
    RB: 0,
    WR: 0,
    TE: 0,
    K: 0,
    DEF: 0,
  };
  let usedFlexSlots = 0;
  let usedBenchSlots = 0;

  // Allocate players to their position slots first
  league.players.forEach((p) => {
    const pos = p.player.position;
    const maxPos = getRosterSlotsByPosition(league, pos);

    if (perPositionUsed[pos] < maxPos) {
      perPositionUsed[pos]++;
    } else if (FLEX_ELIGIBLE.includes(pos) && usedFlexSlots < flexSlots) {
      usedFlexSlots++;
    } else {
      usedBenchSlots++;
    }
  });

  // Allocate defenses
  league.defenses.forEach(() => {
    const maxDef = getRosterSlotsByPosition(league, "DEF");
    if (perPositionUsed["DEF"] < maxDef) {
      perPositionUsed["DEF"]++;
    } else {
      usedBenchSlots++;
    }
  });

  const benchRemaining = Math.max(benchSlots - usedBenchSlots, 0);

  // ---- DECISION ----
  if (perPositionUsed[position] < posSlots) return true; // position slot available
  if (isFlexEligible && usedFlexSlots < flexSlots) return true; // flex slot available
  if (benchRemaining > 0) return true; // bench slot available

  return false; // no space
}
