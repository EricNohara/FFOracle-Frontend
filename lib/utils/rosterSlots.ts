import { ILeagueData, IPlayerData } from "@/app/interfaces/IUserData";

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

export function canPlayerStartAtPosition(
  league: ILeagueData,
  position: string
) {
  if (!league || !league.rosterSettings) return false;

  // if the position has space currently, then no matter what return true
  const positionSlots = getRosterSlotsByPosition(league, position);
  const startCountInPosition = league.players.filter(
    (p) => p.player.position === position && p.picked
  ).length;

  if (positionSlots - startCountInPosition > 0) return true;

  // if position is not flex eligible, then no matter what they can't start
  if (!FLEX_ELIGIBLE.includes(position)) return false;

  // if flex eligible, check the remaining positions for # players in the flex spot
  const rbSlots = getRosterSlotsByPosition(league, "RB");
  const wrSlots = getRosterSlotsByPosition(league, "WR");
  const teSlots = getRosterSlotsByPosition(league, "TE");

  const rbStartCount = league.players.filter(
    (p) => p.player.position === "RB" && p.picked
  ).length;

  const wrStartCount = league.players.filter(
    (p) => p.player.position === "WR" && p.picked
  ).length;

  const teStartCount = league.players.filter(
    (p) => p.player.position === "TE" && p.picked
  ).length;

  const rbFlex = Math.min(rbSlots - rbStartCount, 0);
  const wrFlex = Math.min(wrSlots - wrStartCount, 0);
  const teFlex = Math.min(teSlots - teStartCount, 0);
  const flexTotal = Math.abs(rbFlex + wrFlex + teFlex);

  const flexSlots = getRosterSlotsByPosition(league, "FLEX");

  // return if flex spots are available
  return flexSlots - flexTotal > 0;
}

export function canDefenseStartAtPosition(league: ILeagueData) {
  if (!league || !league.rosterSettings) return false;

  // if the position has space currently, then no matter what return true
  const defSlots = getRosterSlotsByPosition(league, "DEF");
  const defStartCount = league.defenses.filter((t) => t.picked).length;

  return defSlots - defStartCount > 0;
}

// only for players, not defenses
export function getPlayersToSwapForNewStarter(
  league: ILeagueData,
  position: string
) {
  // if position is not flex eligible, only display the other members of that position
  if (!FLEX_ELIGIBLE.includes(position)) {
    return league.players.filter(
      (p) => p.player.position === position && p.picked
    );
  }

  // if position is flex eligible, only display ALL starting members in WR, RB, TE if they are more than their slot capacity
  const rbSlots = getRosterSlotsByPosition(league, "RB");
  const wrSlots = getRosterSlotsByPosition(league, "WR");
  const teSlots = getRosterSlotsByPosition(league, "TE");

  const rbStarters = league.players.filter(
    (p) => p.player.position === "RB" && p.picked
  );
  const wrStarters = league.players.filter(
    (p) => p.player.position === "WR" && p.picked
  );
  const teStarters = league.players.filter(
    (p) => p.player.position === "TE" && p.picked
  );

  const rbExtra = Math.max(rbStarters.length - rbSlots, 0);
  const wrExtra = Math.max(wrStarters.length - wrSlots, 0);
  const teExtra = Math.max(teStarters.length - teSlots, 0);

  const result: IPlayerData[] = [];

  // RB overflow into FLEX
  if (rbExtra > 0) {
    result.push(...rbStarters);
  }

  // WR overflow into FLEX
  if (wrExtra > 0) {
    result.push(...wrStarters);
  }

  // TE overflow into FLEX
  if (teExtra > 0) {
    result.push(...teStarters);
  }

  return result;
}
