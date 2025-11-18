"use client";

import styled from "styled-components";
import { ILeagueDefense, IPlayerData } from "../interfaces/IUserData";
import { formatGameInfo, formatTeamGameInfo } from "@/lib/utils/formatGameInfo";
import { headerFont } from "../localFont";

interface IPlayerListProps {
  players: IPlayerData[];
  defenses?: ILeagueDefense[];
  displayStartSit?: boolean;
}

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PlayerCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  border-radius: var(--global-border-radius);
  background-color: var(--color-base-dark-3);
  color: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    cursor: pointer;
  }
`;

const PlayerSimpleData = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const PlayerImage = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  background-color: white;
`;

const PlayerInfo = styled.div`
  display: flex;
    gap: 2rem;
  `;

const PlayerStartInfo = styled.div`
  display: flex;
    gap: 2rem;
    justify-self: end;
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

const PlayerPositionTag = styled.div<IPlayerPositionTagProps>`
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

export default function PlayerList({ players, defenses = [], displayStartSit = true }: IPlayerListProps) {
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
        < PlayerCard key={playerData.player.id} >
          <PlayerSimpleData>
            <PlayerPositionTag position={playerData.player.position}>{playerData.player.position}</PlayerPositionTag>

            <PlayerImage
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
          {displayStartSit &&
            <PlayerStartInfo>
              {<PlayerStartSitTag $picked={playerData.picked}>{playerData.picked ? "Start" : "Sit"}</PlayerStartSitTag>}
            </PlayerStartInfo>
          }
        </PlayerCard>
      ))
      }
      {
        defenses.map((def) => (
          def && def.team &&
          <PlayerCard key={def.team.id}>
            <PlayerSimpleData>
              <PlayerPositionTag position="DEF">DEF</PlayerPositionTag>
              <PlayerImage
                src={def.team.logo_url ?? "/default_player.png"}
                alt={def.team.name}
              />
              <PlayerInfo>
                <PlayerName className={headerFont.className}>{def.team.name}</PlayerName>
                <PlayerData>{def.team.id}</PlayerData>
                <PlayerData>{formatTeamGameInfo(def.game, def)}</PlayerData>
              </PlayerInfo>
            </PlayerSimpleData>
            {displayStartSit &&
              <PlayerStartInfo>
                {<PlayerStartSitTag $picked={def.picked}>{def.picked ? "Start" : "Sit"}</PlayerStartSitTag>}
              </PlayerStartInfo>
            }
          </PlayerCard>
        ))
      }
    </ListWrapper >
  );
}