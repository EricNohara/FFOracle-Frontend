import { ITeamOffensiveStats } from "../../interfaces/IUserData";
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

interface ITeamOffenseStatsTableProps {
    stats: ITeamOffensiveStats;
}

export default function TeamOffenseStatsTable({ stats }: ITeamOffenseStatsTableProps) {
    return (
        <ScrollWrapper>
            <StatsTable>
                <thead>
                    <tr>
                        <th>Passing ATTs</th>
                        <th>Completions</th>
                        <th>Passing YDs</th>
                        <th>Passing TDs</th>
                        <th>Carries</th>
                        <th>Rushing YDs</th>
                        <th>Rushing TDs</th>
                        <th>Targets</th>
                        <th>Receptions</th>
                        <th>Receiving YDs</th>
                        <th>Receiving TDs</th>
                        <th>Sacks</th>
                        <th>Fumbles</th>
                        <th>Interceptions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{stats.attempts ?? "-"}</td>
                        <td>{stats.completions ?? "-"}</td>
                        <td>{stats.passing_yards ?? "-"}</td>
                        <td>{stats.passing_tds ?? "-"}</td>
                        <td>{stats.carries ?? "-"}</td>
                        <td>{stats.rushing_yards ?? "-"}</td>
                        <td>{stats.rushing_tds ?? "-"}</td>
                        <td>{stats.targets ?? "-"}</td>
                        <td>{stats.receptions ?? "-"}</td>
                        <td>{stats.receiving_yards ?? "-"}</td>
                        <td>{stats.receiving_tds ?? "-"}</td>
                        <td>{stats.sacks_against ?? "-"}</td>
                        <td>{stats.fumbles_against ?? "-"}</td>
                        <td>{stats.passing_interceptions ?? "-"}</td>
                    </tr>
                </tbody>
            </StatsTable>
        </ScrollWrapper>
    );
}
