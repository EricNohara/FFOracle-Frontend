import { IPlayerStats } from "../../interfaces/IUserData";
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

interface IPlayerSeasonStatsTableProps {
    stats: IPlayerStats;
}

export default function PlayerSeasonStatsTable({ stats }: IPlayerSeasonStatsTableProps) {
    return (
        <ScrollWrapper>
            <StatsTable>
                <thead>
                    <tr>
                        <th>Passing ATTs</th>
                        <th>Completions</th>
                        <th>Passing YDs</th>
                        <th>Passing TDs</th>
                        <th>Passing EPA</th>
                        <th>Passing FD</th>
                        <th>Sacks</th>
                        <th>Interceptions</th>
                        <th>Fumbles</th>
                        <th>Carries</th>
                        <th>Rushing YDs</th>
                        <th>Rushing TDs</th>
                        <th>Rushing EPA</th>
                        <th>Rushing FD</th>
                        <th>Targets</th>
                        <th>Receptions</th>
                        <th>Receiving YDs</th>
                        <th>Receiving TDs</th>
                        <th>Receiving EPA</th>
                        <th>Receiving FD</th>
                        <th>PAT ATTs</th>
                        <th>PAT %</th>
                        <th>Fantasy</th>
                        <th>Fantasy PPR</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{stats.passing_attempts ?? "-"}</td>
                        <td>{stats.completions ?? "-"}</td>
                        <td>{stats.passing_yards ?? "-"}</td>
                        <td>{stats.passing_tds ?? "-"}</td>
                        <td>{stats.passing_epa ?? "-"}</td>
                        <td>{stats.passing_first_downs ?? "-"}</td>
                        <td>{stats.sacks_against ?? "-"}</td>
                        <td>{stats.interceptions_against ?? "-"}</td>
                        <td>{stats.fumbles_against ?? "-"}</td>
                        <td>{stats.carries ?? "-"}</td>
                        <td>{stats.rushing_yards ?? "-"}</td>
                        <td>{stats.rushing_tds ?? "-"}</td>
                        <td>{stats.rushing_epa ?? "-"}</td>
                        <td>{stats.rushing_first_downs ?? "-"}</td>
                        <td>{stats.targets ?? "-"}</td>
                        <td>{stats.receptions ?? "-"}</td>
                        <td>{stats.receiving_yards ?? "-"}</td>
                        <td>{stats.receiving_tds ?? "-"}</td>
                        <td>{stats.receiving_epa ?? "-"}</td>
                        <td>{stats.receiving_first_downs ?? "-"}</td>
                        <td>{stats.pat_attempts ?? "-"}</td>
                        <td>{stats.pat_percent ?? "-"}</td>
                        <td>{stats.fantasy_points ?? "-"}</td>
                        <td>{stats.fantasy_points_ppr ?? "-"}</td>
                    </tr>
                </tbody>
            </StatsTable>
        </ScrollWrapper>
    );
}
