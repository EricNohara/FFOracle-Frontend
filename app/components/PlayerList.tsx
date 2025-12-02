"use client";

import styled from "styled-components";
import { ILeagueDefense, IPlayerData } from "../interfaces/IUserData";
import { formatGameInfo, formatTeamGameInfo } from "@/lib/utils/formatGameInfo";
import { headerFont } from "../localFont";
import { AddButton } from "./Buttons";
import { useState } from "react";

interface IPlayerListProps {
  players: IPlayerData[];
  defenses?: ILeagueDefense[];
  displayStartSit?: boolean;
  onPlayerClick?: (player: IPlayerData) => void; // callback when a player card is clicked
  onDefenseClick?: (player: ILeagueDefense) => void; // callback when a defense card is clicked
  onPlayerAdd?: (player: IPlayerData) => void;
  onDefenseAdd?: (player: ILeagueDefense) => void;
  selectable?: boolean;
  onToggleStartSit?: (player: IPlayerData | ILeagueDefense) => void;
}

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PlayerCard = styled.div<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  border-radius: var(--global-border-radius);
  background-color: ${({ $selected }) => $selected ? "var(--color-base-dark-4);" : "var(--color-base-dark-3);"};
  color: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  border: ${({ $selected }) =>
    $selected ? "2px solid var(--color-primary)" : "3px solid transparent"};

  &:hover {
    cursor: pointer;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
  }
`;

const PlayerSimpleData = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const PlayerImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  background-color: white;
`;

const DefenseImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  background-color: white;
  padding: 5px;
`;

const PlayerInfo = styled.div`
  display: flex;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const EndPlayerCardContainer = styled.div`
  display: flex;
  gap: 2rem;
  justify-self: end;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const PlayerName = styled.span`
  font-weight: bold;
  font-size: 1rem;
`;

const PlayerData = styled.span`
  font-size: 0.9rem;
  color: var(--color-txt-3);
`;

const PlayerStartSitTag = styled.div<{ $picked?: boolean }>`
  width: 75px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: var(--global-border-radius);
  background-color: ${({ $picked }) => $picked ? "var(--color-green)" : "var(--color-red)"};
  font-weight: bold;
  color: white;
`;

interface IPlayerPositionTagProps {
  position: string;
}

const positionColors: Record<string, string> = {
  QB: "#E68544",
  RB: "#DE742C",
  WR: "#C75000",
  TE: "#9E3F00",
  K: "#744C32",
  DEF: "#593B26",
};

export const PlayerPositionTag = styled.div<IPlayerPositionTagProps>`
  width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: var(--global-border-radius);
  background-color: ${({ position }) => positionColors[position] ?? "gray"};
  font-weight: bold;
  color: white;
`;

const POSITION_ORDER = ["QB", "RB", "WR", "TE", "K", "DEF"];

export default function PlayerList({
  players,
  defenses = [],
  displayStartSit = true,
  onPlayerClick,
  onDefenseClick,
  onPlayerAdd,
  onDefenseAdd,
  onToggleStartSit,
  selectable = false
}: IPlayerListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sortedPlayers = [...players]
    .filter((p): p is IPlayerData & { player: NonNullable<IPlayerData['player']> } =>
      p != null && p.player != null && p.player.position != null
    )
    .sort((a, b) => {
      // Compare positions
      const posDiff =
        POSITION_ORDER.indexOf(a.player.position) - POSITION_ORDER.indexOf(b.player.position);

      if (posDiff !== 0) return posDiff;

      // If positions are equal, sort by picked status (true first)
      return Number(b.picked) - Number(a.picked);
    });

  return (
    <ListWrapper>
      {sortedPlayers.map((playerData) => (
        playerData && playerData.player && playerData.player.name && playerData.player.headshot_url && playerData.player.position &&
        < PlayerCard
          key={playerData.player.id}
          $selected={selectable && selectedId === playerData.player.id}
          onClick={
            () => {
              onPlayerClick?.(playerData);
              if (selectable) {
                if (selectedId === playerData.player.id) setSelectedId(null);
                else setSelectedId(playerData.player.id);
              }
            }
          }>
          <PlayerSimpleData>
            <PlayerPositionTag position={playerData.player.position}>{playerData.player.position}</PlayerPositionTag>

            <PlayerImage
              loading="lazy"
              src={playerData.player.headshot_url ?? "/default_player.png"}
              alt={playerData.player.name}
            />
            <PlayerInfo>
              <PlayerName className={headerFont.className}>{playerData.player.name}</PlayerName>
              <PlayerData>{playerData.player.team_id}</PlayerData>
              <PlayerData>{formatGameInfo(playerData.game, playerData.player)}</PlayerData>
              <PlayerData>{playerData.player.status_description}</PlayerData>
            </PlayerInfo>
          </PlayerSimpleData>
          <EndPlayerCardContainer>
            {displayStartSit && (
              <PlayerStartSitTag
                $picked={playerData.picked}
                onClick={(e) => {
                  e.stopPropagation(); // prevent card click 
                  onToggleStartSit?.(playerData);
                }}
                style={{ cursor: "pointer" }}
              >
                {playerData.picked ? "Start" : "Sit"}
              </PlayerStartSitTag>
            )}
            {onPlayerAdd &&
              <AddButton onClick={
                (e) => {
                  e.stopPropagation();
                  onPlayerAdd(playerData);
                }}
              />
            }
          </EndPlayerCardContainer>
        </PlayerCard>
      ))
      }
      {
        defenses.map((def) => (
          def && def.team &&
          <PlayerCard
            key={def.team.id}
            $selected={selectable && selectedId === def.team.id}
            onClick={
              () => {
                onDefenseClick?.(def);
                if (selectable) {
                  if (selectedId === def.team.id) setSelectedId(null);
                  else setSelectedId(def.team.id);
                }
              }
            }
          >
            <PlayerSimpleData>
              <PlayerPositionTag position="DEF">DEF</PlayerPositionTag>
              <DefenseImage
                loading="lazy"
                src={def.team.logo_url ?? "/default_player.png"}
                alt={def.team.name}
              />
              <PlayerInfo>
                <PlayerName className={headerFont.className}>{def.team.name}</PlayerName>
                <PlayerData>{def.team.id}</PlayerData>
                <PlayerData>{formatTeamGameInfo(def.game, def)}</PlayerData>
              </PlayerInfo>
            </PlayerSimpleData>
            <EndPlayerCardContainer>
              {displayStartSit && (
                <PlayerStartSitTag
                  $picked={def.picked}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStartSit?.(def);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {def.picked ? "Start" : "Sit"}
                </PlayerStartSitTag>
              )}
              {onDefenseAdd &&
                <AddButton onClick={
                  (e) => {
                    e.stopPropagation();
                    onDefenseAdd(def);
                  }}
                />
              }
            </EndPlayerCardContainer>
          </PlayerCard>
        ))
      }
    </ListWrapper >
  );
}