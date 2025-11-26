"use client";

import AppNavWrapper from "../components/AppNavWrapper";
import { PrimaryColorButton, SecondaryColorButton } from "../components/Buttons";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthProvider";
import { useState, useEffect } from "react";
import {
    IUserInfo,
    IRosterSettings,
    IScoringSettings,
    ILeagueData,
} from "../interfaces/IUserData";
import GeneralTab from "../components/Settings/GeneralTab";
import RosterTab from "../components/Settings/RosterTab";
import ScoringTab from "../components/Settings/ScoringTab";
import SettingsTabs from "../components/Settings/SettingsTabs";
import { useUserData } from "../context/UserDataProvider";
import GenericDropdown from "../components/GenericDropdown";
import styled from "styled-components";
import { authFetch } from "@/lib/supabase/authFetch";

const PageContainer = styled.div`
padding-left: 1.5rem;
padding-right: 1.5rem;
  color: white;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const ContentCard = styled.div`
  background: var(--color-base-dark-2);
  padding: 2rem;
  border-radius: var(--global-border-radius);
  border: 1px solid var(--color-base-dark-4);
  box-shadow: 0 2px 8px rgba(0,0,0,0.35);
`;

export default function SettingsPage() {
    const supabase = createClient();
    const router = useRouter();
    const { setIsLoggedIn } = useAuth();
    const { userData, isLoading, refreshUserData } = useUserData();

    const [activeTab, setActiveTab] = useState<
        "general" | "roster" | "scoring"
    >("general");

    const [userInfo, setUserInfo] = useState<IUserInfo | null>(null);
    const [rosterSettings, setRosterSettings] =
        useState<IRosterSettings | null>(null);
    const [scoringSettings, setScoringSettings] =
        useState<IScoringSettings | null>(null);

    const [selectedLeagueData, setSelectedLeagueData] =
        useState<ILeagueData | null>(null);

    useEffect(() => {
        if (!isLoading && userData?.userInfo) {
            setUserInfo(userData.userInfo);

            if (userData.leagues && userData.leagues.length > 0) {
                setSelectedLeagueData(userData.leagues[0]);
                setRosterSettings(userData.leagues[0].rosterSettings);
                setScoringSettings(userData.leagues[0].scoringSettings);
            }
        }
    }, [userData]);

    const handleSaveChanges = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
                alert("You must be logged in to save changes.");
                return;
            }

            // Save user info
            if (userInfo) {
                const payload = {
                    fullname: userInfo.fullname,
                    phoneNumber: userInfo.phone_number,
                    allowEmails: userInfo.allow_emails,
                    tokensLeft: userInfo.tokens_left
                }

                const userRes = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/Users`,
                    {
                        method: "PUT",
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(payload),
                    }
                );
                if (!userRes.ok) throw new Error("Failed to update user info");
            }

            // Save roster settings
            if (rosterSettings) {
                const payload = {
                    league_id: selectedLeagueData?.leagueId,
                    ...rosterSettings
                }
                const rosterRes = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/UpdateUserLeague/rosterSettings`,
                    {
                        method: "PUT",
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(payload),
                    }
                );
                if (!rosterRes.ok)
                    throw new Error("Failed to update roster settings");
            }

            // Save scoring settings
            if (scoringSettings) {
                const payload = {
                    league_id: selectedLeagueData?.leagueId,
                    ...scoringSettings
                }
                const scoringRes = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/UpdateUserLeague/scoringSettings`,
                    {
                        method: "PUT",
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(payload),
                    }
                );
                if (!scoringRes.ok)
                    throw new Error("Failed to update scoring settings");
            }

            alert("Settings saved successfully!");
            await refreshUserData();
        } catch (error: any) {
            alert(`Error saving settings: ${error.message || error}`);
        }
    };

    const handleDeleteUser = async () => {
        if (!confirm("Are you sure? This cannot be undone.")) return;

        try {
            const res = await authFetch(
                `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/Users`,
                { method: "DELETE", }
            );

            if (!res.ok) throw new Error(await res.text());

            await fetch("/api/deleteUser", { method: "DELETE" });

            alert("Account deleted successfully");

            await supabase.auth.signOut();
            setIsLoggedIn(false);
            router.push("/");
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        }
    };

    const handleDeleteLeague = async () => {
        if (!confirm("Are you sure? This cannot be undone.")) return;

        try {
            const res = await authFetch(
                `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/UpdateUserLeague?leagueId=${selectedLeagueData?.leagueId}`,
                { method: "DELETE", }
            );

            if (!res.ok) throw new Error();
            alert("League deleted successfully");
            refreshUserData();
        } catch (error) {
            console.error(error);
        }
    };


    const saveButton = (
        <PrimaryColorButton onClick={handleSaveChanges}>
            Save Changes
        </PrimaryColorButton>
    );

    const deleteUserButton = (
        <SecondaryColorButton onClick={handleDeleteUser}>
            Delete User
        </SecondaryColorButton>
    );

    const deleteLeagueButton = (
        <SecondaryColorButton onClick={handleDeleteLeague}>
            Delete League
        </SecondaryColorButton>
    );

    const leagueDropdown = (
        <GenericDropdown
            items={userData?.leagues ?? []}
            selected={selectedLeagueData}
            getKey={(l) => l.leagueId}
            getLabel={(l) => l.leagueName}
            onChange={(l) => {
                setSelectedLeagueData(l);
                setRosterSettings(l.rosterSettings);
                setScoringSettings(l.scoringSettings);
            }}
        />
    );

    if (isLoading) {
        return (
            <AppNavWrapper
                title="SETTINGS"
                button1={saveButton}
                button2={deleteUserButton}
            >
                <PageContainer>Loading settings...</PageContainer>
            </AppNavWrapper>
        );
    }

    return (
        <AppNavWrapper
            title="SETTINGS"
            button1={saveButton}
            button2={activeTab === "general" ? deleteUserButton : deleteLeagueButton}
            button3={activeTab !== "general" ? leagueDropdown : null}
        >
            <PageContainer>
                <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

                <ContentCard>
                    {activeTab === "general" && userInfo && (
                        <GeneralTab
                            email={userInfo.email}
                            phoneNumber={userInfo.phone_number || ""}
                            fullname={userInfo.fullname || ""}
                            allowEmails={userInfo.allow_emails}
                            tokensLeft={userInfo.tokens_left}
                            onEmailChange={(v) => setUserInfo({ ...userInfo, email: v })}
                            onPhoneNumberChange={(v) =>
                                setUserInfo({ ...userInfo, phone_number: v })
                            }
                            onFullnameChange={(v) =>
                                setUserInfo({ ...userInfo, fullname: v })
                            }
                            onAllowEmailsChange={(v) =>
                                setUserInfo({ ...userInfo, allow_emails: v })
                            }
                        />
                    )}

                    {activeTab === "roster" && rosterSettings && (
                        <RosterTab
                            rosterSettings={rosterSettings}
                            onRosterChange={(field, value) =>
                                setRosterSettings({ ...rosterSettings, [field]: value })
                            }
                        />
                    )}

                    {activeTab === "scoring" && scoringSettings && (
                        <ScoringTab
                            scoringSettings={scoringSettings}
                            onScoringChange={(field, value) =>
                                setScoringSettings({ ...scoringSettings, [field]: value })
                            }
                        />
                    )}
                </ContentCard>
            </PageContainer>
        </AppNavWrapper>
    );
}
