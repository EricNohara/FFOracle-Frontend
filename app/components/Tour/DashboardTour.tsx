"use client";

import { useEffect, useRef } from "react";
import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";

export default function DashboardTour({ userId, hasLeagues }: { userId?: string, hasLeagues: boolean }) {
    const startedRef = useRef(false);

    useEffect(() => {
        if (!userId) return;
        if (startedRef.current) return;
        startedRef.current = true;

        const stageKey = `onboarding-stage-${userId}`;
        let stage = localStorage.getItem(stageKey) || "start";

        const tour = new Shepherd.Tour({
            useModalOverlay: true,
            defaultStepOptions: {
                cancelIcon: { enabled: false },
                scrollTo: true,
                classes: "shepherd-theme-arrows shepherd-theme-dark",
            },
        });

        (window as any)._shepherdTour = tour;

        if (stage === "start" && !hasLeagues) {
            tour.addStep({
                text: "Welcome to FFOracle! Lets get started.",
                buttons: [
                    { text: "Next", action: () => tour.next() }
                ]
            });

            tour.addStep({
                id: "step-dashboard",
                text: "This button takes you to the dashboard page where you can view the players in your leagues, analyze their stats, and generate AI roster recommendations.",
                attachTo: { element: "#step-dashboard", on: "right" },
                buttons: [
                    { text: "Back", action: () => tour.back() },
                    { text: "Next", action: () => tour.next() }
                ]
            });

            tour.addStep({
                id: "step-stats",
                text: "This button takes you to the stats page where you can view the stats of any player in the NFL and add them to the league of your choice.",
                attachTo: { element: "#step-stats", on: "right" },
                buttons: [
                    { text: "Back", action: () => tour.back() },
                    { text: "Next", action: () => tour.next() }
                ]
            });

            tour.addStep({
                id: "step-performance",
                text: "This button takes you to the performance page where you can view the weekly performance metrics of any of your leagues.",
                attachTo: { element: "#step-performance", on: "right" },
                buttons: [
                    { text: "Back", action: () => tour.back() },
                    { text: "Next", action: () => tour.next() }
                ]
            });

            tour.addStep({
                id: "step-articles",
                text: "This button takes you to the articles page where you can view realtime articles written about players in any of your leagues.",
                attachTo: { element: "#step-articles", on: "right" },
                buttons: [
                    { text: "Back", action: () => tour.back() },
                    { text: "Next", action: () => tour.next() }
                ]
            });

            tour.addStep({
                id: "step-settings",
                text: "This button takes you to the settings page where you can update user information, buy tokens, or update roster/scoring settings for your leagues.",
                attachTo: { element: "#step-settings", on: "right" },
                buttons: [
                    { text: "Back", action: () => tour.back() },
                    { text: "Next", action: () => tour.next() }
                ]
            });

            tour.addStep({
                id: "step-add-league",
                text: "Click this button to create your first league.",
                attachTo: { element: "#add-league-button", on: "bottom" },
                buttons: []
            });

            setTimeout(() => tour.start(), 100);
            return;
        }

        if (stage === "after-create" && hasLeagues) {
            tour.addStep({
                id: "step-select-league",
                text: "You have just created your first league! Now select it from the league dropdown.",
                attachTo: { element: "#league-dropdown", on: "bottom" },
                buttons: [
                    { text: "Next", action: () => tour.next() }
                ]
            });

            tour.addStep({
                text: "This section of the dashboard shows all players in your league. Your league is currently empty.",
                buttons: [
                    { text: "Back", action: () => tour.back() },
                    { text: "Next", action: () => tour.next() },
                ]
            });

            tour.addStep({
                id: "step-edit-roster",
                text: "Click this button to edit your roster. Once you have at least one player in your league, you can generate AI insights.",
                attachTo: { element: "#edit-button", on: "bottom" },
                buttons: [
                    { text: "Back", action: () => tour.back() },
                    {
                        text: "Finish", action: () => {
                            localStorage.setItem(stageKey, "done");
                            tour.complete();
                        }
                    }
                ]
            });

            setTimeout(() => tour.start(), 100);
        }

    }, [userId, hasLeagues]);

    return null;
}
