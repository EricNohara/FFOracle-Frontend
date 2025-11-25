"use client";

import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`;

const Title = styled.h3`
  margin: 0 0 0.75rem 0;
  font-size: 1.25rem;
  font-weight: bold;
  color: white;
`;

const TableWrapper = styled.div`
  overflow-y: auto;
  overflow-x: auto;
  flex: 1;              
  min-height: 0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: var(--color-base-dark-3);
`;

const Th = styled.th`
  position: sticky;
  top: 0;
  z-index: 20;
  background: var(--color-base-dark-4);
  color: white;
  padding: 0.75rem;
  font-weight: bold;
  text-align: left;
`;

const Td = styled.td`
  padding: 0.75rem;
  color: white;
  border-top: 1px solid var(--color-base-dark-5);
`;

const EmptyState = styled.div`
  width: 100%;
  padding: 2rem 1rem;
  text-align: center;
  color: var(--color-base-light-2);
  font-size: 1rem;
  opacity: 0.8;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 1rem;
  background-color: white;
`;

const GreenText = styled.span`
  color: var(--color-green);
  font-weight: bold;
`;

const RedText = styled.span`
  color: var(--color-red);
  font-weight: bold;
`;

export interface TableColumn<T> {
    key: keyof T;
    label: string;
}

interface IPerformanceTableProps<T> {
    title?: string;
    columns: TableColumn<T>[];
    data: T[];
}

// helper type guards for styling specific cols
function isPlayerRow(row: any): row is { playerName: string; headshotUrl?: string | null } {
    return typeof row.playerName === "string";
}

function isBoolean(value: unknown): value is boolean {
    return typeof value === "boolean";
}

export function PerformanceTable<T extends object>({
    title,
    columns,
    data,
}: IPerformanceTableProps<T>) {
    return (
        <Wrapper>
            {title && <Title>{title}</Title>}

            <TableWrapper>
                {data.length === 0 ? (
                    <EmptyState>No data available</EmptyState>
                ) : (
                    <Table>
                        <thead>
                            <tr>
                                {columns.map((c) => (
                                    <Th key={String(c.key)}>{c.label}</Th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {data.map((row, idx) => (
                                <tr key={idx}>
                                    {columns.map((c) => (
                                        <Td key={String(c.key)}>
                                            {c.key === "playerName" && isPlayerRow(row) ? (
                                                <div style={{ display: "flex", alignItems: "center" }}>
                                                    {row.headshotUrl && (
                                                        <Avatar
                                                            src={row.headshotUrl}
                                                            alt={row.playerName}
                                                        />
                                                    )}
                                                    {row.playerName}
                                                </div>
                                            ) : (
                                                (() => {
                                                    const value = row[c.key] as unknown;

                                                    // boolean = colored Yes/No
                                                    if (isBoolean(value)) {
                                                        return value ? <GreenText>Yes</GreenText> : <RedText>No</RedText>;
                                                    }

                                                    // default
                                                    if (value === null || value === undefined) return "";
                                                    return String(value);
                                                })()
                                            )}
                                        </Td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </TableWrapper>
        </Wrapper>
    );
}
