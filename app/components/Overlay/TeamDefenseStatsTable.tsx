import { ITeamDefensiveStats } from "../../interfaces/IUserData";
import styled from "styled-components";

const ScrollWrapper = styled.div`
  overflow-x: auto;
  width: 100%;
`;

const StatsTable = styled.table`
  width: max-content; /* so the table width expands based on content */
  min-width: 100%;    /* optional: table is at least the container width */
  border-collapse: collapse;
  text-align: center;
  color: white;

  th, td {
    padding: 0.5rem;
    border: 1px solid var(--color-base-dark-4);
    white-space: nowrap;
    font-size: 0.8rem;
  }

  th {
    background-color: var(--color-base-dark-4);
  }
`;

interface ITeamDefenseStatsTableProps {
    stats: ITeamDefensiveStats;
}

export default function TeamDefenseStatsTable({ stats }: ITeamDefenseStatsTableProps) {
    return (
        <ScrollWrapper>
            <StatsTable>
                <thead>
                    <tr>
                        <th>TDs</th>
                        <th>Safeties</th>
                        <th>Sacks</th>
                        <th>Sack YDs</th>
                        <th>Tackles for Loss</th>
                        <th>Tackle for Loss YDs</th>
                        <th>Interceptions</th>
                        <th>Interception YDs</th>
                        <th>Fumbles</th>
                        <th>Passes Defended</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{stats.def_tds ?? "-"}</td>
                        <td>{stats.safeties ?? "-"}</td>
                        <td>{stats.sacks_for ?? "-"}</td>
                        <td>{stats.sack_yards_for ?? "-"}</td>
                        <td>{stats.tackles_for_loss ?? "-"}</td>
                        <td>{stats.tackle_for_loss_yards ?? "-"}</td>
                        <td>{stats.interceptions_for ?? "-"}</td>
                        <td>{stats.interception_yards_for ?? "-"}</td>
                        <td>{stats.fumbles_for ?? "-"}</td>
                        <td>{stats.pass_defended ?? "-"}</td>
                    </tr>
                </tbody>
            </StatsTable>
        </ScrollWrapper>
    );
}
