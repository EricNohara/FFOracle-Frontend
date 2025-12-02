"use client";

import styled from "styled-components";
import { ILeagueDefense } from "../../interfaces/IUserData";
import { PlayerPositionTag } from "../PlayerList";
import { formatTeamGameInfo } from "@/lib/utils/formatGameInfo";
import TeamDefenseStatsTable from "./TeamDefenseStatsTable";
import TeamOffenseStatsTable from "./TeamOffenseStatsTable";
import { AddButton, DeleteButton } from "../Buttons";

const OverlayHeader = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  background-color: var(--color-base-dark-4);
  padding: 1rem;
  padding-bottom: 0;
  border-radius: var(--global-border-radius) var(--global-border-radius) 0 0;
  gap: 2rem;
  flex-shrink: 0;
`;

const PlayerImage = styled.img`
  height: 250px;
  padding: 1rem;
  object-fit: cover;
`;

const OpponentImage = styled.img`
  height: 50px;
  border-radius: 50%;
  background-color: white;
  padding: 5px;
  object-fit: cover;
`;

const NameStack = styled.div`
  display: flex;
  flex-direction: column;

  h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: bold;
  }

  h2 {
    margin: 0;
    font-size: 1rem;
    color: var(--color-txt-3);
  }
`;

const PositionTagWrapper = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
`;

const OverlayBody = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  overflow-y: auto;
  flex: 1;

  h3 {
    font-size: 1.15rem;
    font-weight: bold;
    margin-bottom: 1rem;
  }
`;

const OpponentData = styled.p`
    margin: 0;
    font-size: 1rem;
    color: var(--color-txt-2);
    font-weight: normal;
`;

const AddButtonWrapper = styled.div`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
`;

interface IDefenseStatsOverlayProps {
  defense: ILeagueDefense | null;
  onAddDefense?: (defense: ILeagueDefense) => void;
  onDeleteDefense?: (defense: ILeagueDefense) => void;
}

export default function DefenseStatsOverlay({ defense, onAddDefense, onDeleteDefense }: IDefenseStatsOverlayProps) {
  if (!defense) return null;

  const seasonStats = defense.seasonStats ?? {};
  const opponentStats = defense.opponent?.offensiveStats ?? null;

  return (
    <>
      <OverlayHeader>
        <PlayerImage src={defense.team.logo_url ?? "/default_player.png"} alt={defense.team.name} />
        <NameStack>
          <h1>{defense.team.name}</h1>
          <h2>{defense.team.id} - {formatTeamGameInfo(defense.game, defense)}</h2>
          <h2>{defense.team.division}</h2>
        </NameStack>
        <PositionTagWrapper>
          <PlayerPositionTag position="DEF">DEF</PlayerPositionTag>
        </PositionTagWrapper>
        {
          onAddDefense &&
          <AddButtonWrapper>
            <AddButton onClick={() => onAddDefense(defense)} />
          </AddButtonWrapper>
        }
        {
          onDeleteDefense &&
          <AddButtonWrapper>
            <DeleteButton onClick={() => onDeleteDefense(defense)} />
          </AddButtonWrapper>
        }
      </OverlayHeader>

      <OverlayBody>
        <div>
          <h3>Season Stats</h3>
          <TeamDefenseStatsTable stats={seasonStats} />
        </div>

        {opponentStats && (
          <div>
            <h3>
              <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                <p>Next Opponent</p>
                <OpponentImage loading="lazy" src={defense.opponent.team.logo_url} alt={defense.opponent.team.name} />
                <OpponentData>{defense.opponent.team.name}</OpponentData>
                <OpponentData>{defense.opponent.team.division}</OpponentData>
              </div>
            </h3>
            <TeamOffenseStatsTable stats={opponentStats} />
          </div>
        )}
      </OverlayBody>
    </>
  );
}

