"use client";

import AppNavWrapper from "../components/AppNavWrapper";
import { PrimaryColorButton } from "../components/Buttons";
import { useRouter } from "next/navigation";
import { useUserData } from "../context/UserDataProvider";

export default function DashboardPage() {
    const router = useRouter();
    const { userData } = useUserData();

    const button = <PrimaryColorButton onClick={() => router.push("/stats")}>Edit Roster</PrimaryColorButton>;

    return (
        <AppNavWrapper title="ROSTER DASHBOARD" button1={button}>
        </AppNavWrapper>
    )
}