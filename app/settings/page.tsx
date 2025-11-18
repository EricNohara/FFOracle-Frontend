"use client";

import AppNavWrapper from "../components/AppNavWrapper";
import { PrimaryColorButton, SecondaryColorButton } from "../components/Buttons";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthProvider";
import { useState, useEffect } from "react";
import { IUserInfo, IRosterSettings, IScoringSettings } from "../interfaces/IUserData";
import GeneralTab from "../components/Settings/GeneralTab";
import RosterTab from "../components/Settings/RosterTab";
import ScoringTab from "../components/Settings/ScoringTab";
import SettingsTabs from "../components/Settings/SettingsTabs";
import { useUserData } from "../context/UserDataProvider";

export default function SettingsPage() {
    const supabase = createClient();
    const router = useRouter();
    const { setIsLoggedIn } = useAuth();
    const { userData, isLoading, refreshUserData } = useUserData();
    const [activeTab, setActiveTab] = useState<"general" | "roster" | "scoring">("general");
    const [userInfo, setUserInfo] = useState<IUserInfo | null>(null);
    const [rosterSettings, setRosterSettings] = useState<IRosterSettings | null>(null);
    const [scoringSettings, setScoringSettings] = useState<IScoringSettings | null>(null);

    useEffect(() => {
        // TODO: Uncomment this code when backend is ready to return real data
        // if (!isLoading) {
        //     if (userData?.userInfo && userData.userInfo.email) {
        //         // Use real data if available
        //         setUserInfo(userData.userInfo);
        //         if (userData.leagues && userData.leagues.length > 0) {
        //             setRosterSettings(userData.leagues[0].rosterSettings);
        //             setScoringSettings(userData.leagues[0].scoringSettings);
        //         }
        //     }
        // }

        // TEMPORARY: Using dummy data until backend returns real data
        setUserInfo({
            id: "dummy-user-id",
            email: "john.doe@example.com",
            tokens_left: 100,
            allow_emails: true,
            fullname: "John Doe",
            phone_number: "636-337-4833"
        });
        
        setRosterSettings({
            id: "dummy-roster-id",
            qb_count: 1,
            rb_count: 2,
            wr_count: 2,
            te_count: 1,
            k_count: 1,
            flex_count: 1,
            def_count: 1,
            bench_count: 6,
            ir_count: 2
        });
        
        setScoringSettings({
            id: "dummy-scoring-id",
            points_per_td: 6,
            points_per_reception: 1,
            points_per_rushing_yard: 0.1,
            points_per_reception_yard: 0.1,
            points_per_passing_yard: 0.04
        });
    }, []);

    const handleSaveChanges = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
                alert("You must be logged in to save changes.");
                return;
            }

            //routes are not defined in backend yet. 
            // Save userInfo
            if (userInfo) {
                const userRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/Users`, {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${session.access_token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(userInfo)
                });

                if (!userRes.ok) throw new Error("Failed to update user info");
            }

            // Save roster settings
            if (rosterSettings) {
                const rosterRes = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/RosterSettings/${rosterSettings.id}`,
                    {
                        method: "PUT",
                        headers: {
                            "Authorization": `Bearer ${session.access_token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(rosterSettings)
                    }
                );
                if (!rosterRes.ok) throw new Error("Failed to update roster settings");
            }

            // Save scoring settings
            if (scoringSettings) {
                const scoringRes = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/ScoringSettings/${scoringSettings.id}`,
                    {
                        method: "PUT",
                        headers: {
                            "Authorization": `Bearer ${session.access_token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(scoringSettings)
                    }
                );
                if (!scoringRes.ok) throw new Error("Failed to update scoring settings");
            }

            alert("Settings saved successfully!");
            await refreshUserData(); // Refresh the context data
        } catch (error: any) {
            alert(`Error saving settings: ${error.message || error}`);
        }
    };

    const handleDeleteUser = async () => {
        if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return;

        try {
            // get session
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
                alert("You must be logged in to delete your account.");
                return;
            }

            // call backend DELETE route
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/Users`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${session.access_token}`
                }
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to delete account");
            }

            // delete auth user
            const deleteAuthRes = await fetch("/api/deleteUser", { method: "DELETE" });

            if (!deleteAuthRes.ok) {
                const data = await deleteAuthRes.json();
                throw new Error(data.error || "Failed to delete account");
            }

            alert("Account deleted successfully");

            // log out the user locally and redirect to landing page
            await supabase.auth.signOut();
            setIsLoggedIn(false);
            router.push("/");
        } catch (error: any) {
            alert(`Error deleting account: ${error.message || error}`);
        }

    }

    const button = <PrimaryColorButton onClick={handleSaveChanges}>Save Changes</PrimaryColorButton>;
    const deleteUserButton = <SecondaryColorButton onClick={handleDeleteUser}>Delete User</SecondaryColorButton>;

    if (isLoading) {
        return (
            <AppNavWrapper title="SETTINGS" button2={button} button1={deleteUserButton}>
                <div>Loading settings...</div>
            </AppNavWrapper>
        );
    }

    return (
        <AppNavWrapper title="SETTINGS" button2={button} button1={deleteUserButton}>
            <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === "general" && userInfo && (
                <GeneralTab
                    email={userInfo.email}
                    phoneNumber={userInfo.phone_number || ""}
                    fullname={userInfo.fullname || ""}
                    allowEmails={userInfo.allow_emails}
                    onEmailChange={(value) => setUserInfo({...userInfo, email: value})}
                    onPhoneNumberChange={(value) => setUserInfo({...userInfo, phone_number: value})}
                    onFullnameChange={(value) => setUserInfo({...userInfo, fullname: value})}
                    onAllowEmailsChange={(value) => setUserInfo({...userInfo, allow_emails: value})}
                />
                )}

                {activeTab === "roster" && rosterSettings && (
                <RosterTab
                    rosterSettings={rosterSettings}
                    onRosterChange={(field, newCount) => 
                    setRosterSettings({...rosterSettings, [field]: newCount})
                    }
                />
                )}

                {activeTab === "scoring" && scoringSettings && (
                <ScoringTab
                    scoringSettings={scoringSettings}
                    onScoringChange={(field, newValue) => 
                    setScoringSettings({...scoringSettings, [field]: newValue})
                    }
                />
                )}
            
        </AppNavWrapper>
    )
}