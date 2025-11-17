"use client";

import AppNavWrapper from "../../components/AppNavWrapper";
import { PrimaryColorButton } from "../../components/Buttons";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const router = useRouter();
    const button = <PrimaryColorButton onClick={() => router.push("/stats")}>Edit Roster</PrimaryColorButton>;

    return (
        <AppNavWrapper title="AI ROSTER RECOMMENDATIONS" button1={button}>
            This is the roster dashboard...
        </AppNavWrapper>
    )
}