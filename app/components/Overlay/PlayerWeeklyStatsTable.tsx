import { IPlayerStats, IPlayerStatsWithWeek } from "../../interfaces/IUserData";
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
    stats: IPlayerStatsWithWeek[];
}

export default function PlayerWeeklyStatsTable({ stats }: IPlayerSeasonStatsTableProps) {
    return (
        <ScrollWrapper>
            <StatsTable>
                <thead>
                    <tr>
                        <th>Week</th>
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
                    {
                        stats.map((s) =>
                            <tr key={s.stats.id}>
                                <td>{s.week ?? "-"}</td>
                                <td>{s.stats.passing_attempts ?? "-"}</td>
                                <td>{s.stats.completions ?? "-"}</td>
                                <td>{s.stats.passing_yards ?? "-"}</td>
                                <td>{s.stats.passing_tds ?? "-"}</td>
                                <td>{s.stats.passing_epa ?? "-"}</td>
                                <td>{s.stats.passing_first_downs ?? "-"}</td>
                                <td>{s.stats.sacks_against ?? "-"}</td>
                                <td>{s.stats.interceptions_against ?? "-"}</td>
                                <td>{s.stats.fumbles_against ?? "-"}</td>
                                <td>{s.stats.carries ?? "-"}</td>
                                <td>{s.stats.rushing_yards ?? "-"}</td>
                                <td>{s.stats.rushing_tds ?? "-"}</td>
                                <td>{s.stats.rushing_epa ?? "-"}</td>
                                <td>{s.stats.rushing_first_downs ?? "-"}</td>
                                <td>{s.stats.targets ?? "-"}</td>
                                <td>{s.stats.receptions ?? "-"}</td>
                                <td>{s.stats.receiving_yards ?? "-"}</td>
                                <td>{s.stats.receiving_tds ?? "-"}</td>
                                <td>{s.stats.receiving_epa ?? "-"}</td>
                                <td>{s.stats.receiving_first_downs ?? "-"}</td>
                                <td>{s.stats.pat_attempts ?? "-"}</td>
                                <td>{s.stats.pat_percent ?? "-"}</td>
                                <td>{s.stats.fantasy_points ?? "-"}</td>
                                <td>{s.stats.fantasy_points_ppr ?? "-"}</td>
                            </tr>
                        )
                    }
                </tbody>
            </StatsTable>
        </ScrollWrapper>
    );
}
