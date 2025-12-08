"use client";

import AppNavWrapper from "../components/AppNavWrapper";
import { PrimaryColorButton } from "../components/Buttons";
import { useRouter } from "next/navigation";
import { useUserData } from "../context/UserDataProvider";
import { useState, useEffect } from "react";
import { ILeagueData } from "../interfaces/IUserData";
import { IPlayerNewsArticle } from "../interfaces/IPlayerNewsArticle";
import GenericDropdown from "../components/GenericDropdown";
import LoadingMessage from "../components/LoadingMessage";
import SearchBar from "../components/SearchBar";
import styled from "styled-components";
import Overlay from "../components/Overlay/Overlay";
import { authFetch } from "@/lib/supabase/authFetch";

// Styles for article list and cards
const ArticlesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ArticleCard = styled.div`
  display: flex;
  gap: 1.5em;
  padding: 1.5rem;
  background-color: var(--color-base-dark-3);
  border-radius: var(--global-border-radius);
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
  cursor: pointer;
  transition: 0.2s ease;
  height: 160px;
  align-items: center;

  &:hover {
    background-color: var(--color-base-dark-4);
  }
`;

const Thumbnail = styled.img`
  width: 115px;
  height: 115px;
  object-fit: cover;
  border-radius: var(--global-border-radius);
  background-color: var(--color-secondary);
  flex-shrink: 0;
`;

const ArticleContent = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: space-between;
`;

const Headline = styled.h2`
  font-size: 1.2rem;
  color: white;
  font-weight: bold;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Description = styled.p`
  color: var(--color-txt-3);
  font-size: 0.9rem;
  margin: 0.25rem 0 0.5rem;
  font-style: italic;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MetaRow = styled.div`
  display: flex;
  justify-content: end;
`;

const Tag = styled.span`
  background-color: var(--color-primary);
  padding: 0.3rem 1rem;
  border-radius: var(--global-border-radius);
  color: white;
  font-weight: bold;
  font-size: 0.8rem;
`;

// Overlay styles
const OverlayHeader = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  padding-bottom: 0;
  background-color: var(--color-base-dark);
  border-radius: var(--global-border-radius) var(--global-border-radius) 0 0;
`;

const OverlayHeaderImg = styled.img`
  height: 250px;
  object-fit: cover;
`;

const OverlayHeadline = styled.h1`
  font-size: 1.5rem;
  color: white;
  font-weight: bold;
  text-align: center;
  margin: 0;
  padding: 2rem;
  background-color: var(--color-base-dark-4);
`;

const OverlayStory = styled.div`
  color: var(--color-txt-2);
  font-size: 1rem;
  line-height: 1.75;
  padding: 2rem;
`;

const OverlayTag = styled.span`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background-color: var(--color-primary);
  padding: 0.3rem 1rem;
  border-radius: var(--global-border-radius);
  color: white;
  font-size: 1rem;
  font-weight: bold;
  z-index: 5;
`;

export default function ArticlesPage() {
    const router = useRouter();
    const { userData } = useUserData();

    // Active league selection
    const [selectedLeagueData, setSelectedLeagueData] = useState<ILeagueData | null>(null);

    // Articles retrieved for selected league players
    const [articles, setArticles] = useState<IPlayerNewsArticle[]>([]);

    // Loading indicator for fetch
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Search query for filtering article list
    const [searchQuery, setSearchQuery] = useState("");

    // Holds article currently shown in overlay
    const [articleToDisplay, setArticleToDisplay] = useState<IPlayerNewsArticle | null>(null);

    // Set default league when user data loads
    useEffect(() => {
        if (userData?.leagues && userData.leagues.length > 0) {
            setSelectedLeagueData(userData.leagues[0]);
        }
    }, [userData]);

    // Fetch new articles whenever league changes
    useEffect(() => {
        if (!selectedLeagueData || !selectedLeagueData?.leagueId) return;

        const fetcher = async () => {
            setIsLoading(true);

            try {
                const res = await authFetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/Espn/articles/${selectedLeagueData.leagueId}`);

                if (!res.ok) {
                    const errorText = await res.text();
                    console.error("Backend error:", errorText);
                    throw new Error(`Failed: ${res.status}`);
                }

                const data: IPlayerNewsArticle[] = await res.json();
                setArticles(data);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };

        fetcher();
    }, [selectedLeagueData]);

    // Button for navigation to auto-send settings
    const button = <PrimaryColorButton onClick={() => router.push("/settings")}>Set Up Auto Send</PrimaryColorButton>;

    // Dropdown for choosing which league to load articles for
    const leagueDropdown = (
        <GenericDropdown
            items={userData?.leagues ?? []}
            selected={selectedLeagueData}
            getKey={(l) => l.leagueId}
            getLabel={(l) => l.leagueName}
            onChange={(league) => setSelectedLeagueData(league)}
        />
    );

    // Article click behavior - open ESPN link if available, otherwise show overlay
    const onArticleClick = (a: IPlayerNewsArticle) => {
        if (a.links.web) {
            window.open(a.links.web.href ?? "", "_blank");
        } else {
            setArticleToDisplay(a);
        }
    };

    // Render fallback if league has no players
    if (!selectedLeagueData?.players?.length) {
        return (
            <AppNavWrapper title="ARTICLES" button1={button} button2={leagueDropdown}>
                <p style={{ color: "var(--color-txt-3)" }}>
                    This league has no players yet. Add players to view articles.
                </p>
            </AppNavWrapper>
        );
    }

    return (
        <AppNavWrapper title="ARTICLES" button1={button} button2={leagueDropdown}>
            {isLoading ? (
                // Animated loading message
                <LoadingMessage
                    messages={[
                        "Fetching from ESPN...",
                        "Validating sources...",
                        "Loading articles..."
                    ]}
                    intervalMs={500}
                />
            ) : (
                <>
                    {/* Search input for articles */}
                    <SearchBar
                        value={searchQuery}
                        placeholder="Search articles..."
                        onChange={setSearchQuery}
                        sticky
                    />

                    <ArticlesList>
                        {articles
                            .filter(a =>
                                a.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                a.description?.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((a) => {
                                // Choose image with fallback to player's headshot
                                const img = a.images?.[0]?.url;
                                const date = a.published ? new Date(a.published).toLocaleDateString() : null;
                                const leaguePlayer = selectedLeagueData.players.find(
                                    (p) => p.player.id === a.localPlayerId
                                );

                                const fallbackImg = leaguePlayer?.player.headshot_url ?? "";

                                return (
                                    <ArticleCard
                                        key={`${a.localPlayerId}-${a.published}`}
                                        onClick={() => onArticleClick(a)}
                                    >
                                        <Thumbnail
                                            src={img ? img : fallbackImg}
                                            alt={a.headline ?? ""}
                                        />

                                        <ArticleContent>
                                            <Headline>{a.headline}</Headline>
                                            <Description>{a.description}</Description>

                                            <MetaRow>
                                                <Tag>{date}</Tag>
                                            </MetaRow>
                                        </ArticleContent>
                                    </ArticleCard>
                                );
                            })}
                    </ArticlesList>
                </>
            )}

            {/* Expanded article overlay */}
            {articleToDisplay && (
                <Overlay isOpen={!!articleToDisplay} onClose={() => setArticleToDisplay(null)}>
                    <OverlayHeader>
                        <OverlayTag>
                            {articleToDisplay.published
                                ? new Date(articleToDisplay.published).toLocaleDateString()
                                : ""}
                        </OverlayTag>

                        <OverlayHeaderImg
                            src={
                                articleToDisplay.images?.[0]?.url ||
                                selectedLeagueData.players.find(p => p.player.id === articleToDisplay.localPlayerId)?.player.headshot_url ||
                                ""
                            }
                            alt={articleToDisplay.headline ?? ""}
                        />
                    </OverlayHeader>

                    <OverlayHeadline>{articleToDisplay.headline}</OverlayHeadline>
                    <OverlayStory>{articleToDisplay.story}</OverlayStory>
                </Overlay>
            )}
        </AppNavWrapper>
    );
}
