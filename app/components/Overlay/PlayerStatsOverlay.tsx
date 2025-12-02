"use client";

import styled from "styled-components";
import { IPlayerData } from "../../interfaces/IUserData";
import { PlayerPositionTag } from "../PlayerList";
import { formatGameInfo } from "@/lib/utils/formatGameInfo";
import PlayerSeasonStatsTable from "./PlayerSeasonStatsTable";
import PlayerWeeklyStatsTable from "./PlayerWeeklyStatsTable";
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

const AddButtonWrapper = styled.div`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
`;

interface IPlayerStatsOverlayProps {
  player: IPlayerData | null;
  onPlayerAdd?: (player: IPlayerData) => void;
  onPlayerDelete?: (player: IPlayerData) => void;
}

export default function PlayerStatsOverlay({ player, onPlayerAdd, onPlayerDelete }: IPlayerStatsOverlayProps) {
  if (!player) return null;

  const seasonStats = player.seasonStats ?? {};
  const weeklyStats = player.weeklyStats ?? [];

  return (
    <>
      <OverlayHeader>
        <PlayerImage src={player.player.headshot_url ?? "/default_player.png"} alt={player.player.name} />
        <NameStack>
          <h1>{player.player.name}</h1>
          <h2>{player.player.team_id} - {formatGameInfo(player.game, player.player)}</h2>
          <h2>Status: {player.player.status_description ?? "N/A"}</h2>
        </NameStack>
        <PositionTagWrapper>
          <PlayerPositionTag position={player.player.position}>
            {player.player.position}
          </PlayerPositionTag>
        </PositionTagWrapper>
        {
          onPlayerAdd &&
          <AddButtonWrapper>
            <AddButton onClick={() => onPlayerAdd(player)} />
          </AddButtonWrapper>
        }
        {
          onPlayerDelete &&
          <AddButtonWrapper>
            <DeleteButton onClick={() => onPlayerDelete(player)} />
          </AddButtonWrapper>
        }
      </OverlayHeader>

      <OverlayBody>
        <div>
          <h3>Season Stats</h3>
          <PlayerSeasonStatsTable stats={seasonStats} />
        </div>

        {weeklyStats.length > 0 && (
          <div>
            <h3>Recent Weekly Stats</h3>
            <PlayerWeeklyStatsTable stats={player.weeklyStats} />
          </div>
        )}
      </OverlayBody>
    </>
  );
}

