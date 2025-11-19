import { ILeagueData } from "@/app/interfaces/IUserData";

const FLEX_ELIGIBLE = ["RB", "WR", "TE"];

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

  const totalSlots = getRosterSlotsByPosition(league, position);

  // count currently rostered players at this exact position
  const filledAtPosition =
    position !== "DEF"
      ? league.players.filter((p) => p.player.position === position).length
      : league.defenses.length;

  // get bench slots remaining
  const benchSlots = getRosterSlotsByPosition(league, "BENCH");
  const filledBenchSlots =
    league.players.filter((p) => p.picked === false).length +
    league.defenses.filter((d) => d.picked === false).length;
  const remainingBenchSlots = Math.max(benchSlots - filledBenchSlots, 0);

  // If there are position slots available, return those
  if (totalSlots - filledAtPosition > 0 || remainingBenchSlots > 0) {
    return true;
  }

  // if no space in player slots or bench for non flex, they can't be added without swapping a player
  if (!FLEX_ELIGIBLE.includes(position)) {
    return false;
  }

  // handle FLEX eligible players who are over their position's slot limit
  const flexSlots = getRosterSlotsByPosition(league, "FLEX");

  // count how many total STARTING flex-eligible players exist already
  const totalRb = league.players.filter(
    (p) => p.player.position === "RB" && p.picked
  ).length;

  const totalWr = league.players.filter(
    (p) => p.player.position === "WR" && p.picked
  ).length;

  const totalTe = league.players.filter(
    (p) => p.player.position === "TE" && p.picked
  ).length;

  // count how many slots are available for each FLEx position
  const rbSlots = getRosterSlotsByPosition(league, "RB");
  const wrSlots = getRosterSlotsByPosition(league, "WR");
  const teSlots = getRosterSlotsByPosition(league, "TE");

  // add up the differences
  let totalFlexSlots = 0;
  totalFlexSlots += totalRb > rbSlots ? totalRb - rbSlots : 0;
  totalFlexSlots += totalWr > wrSlots ? totalWr - wrSlots : 0;
  totalFlexSlots += totalTe > teSlots ? totalTe - teSlots : 0;

  return flexSlots - totalFlexSlots > 0;
}
