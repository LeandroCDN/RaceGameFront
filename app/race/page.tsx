"use client";

import { MainScreen } from "@/components/main-screen";
import { TeamSelection } from "@/components/team-section";
import { ConfirmationScreen } from "@/components/confirmation-screen";
import { GameProvider, useGame } from "@/components/game-provider";
import { ResultScreen } from "@/components/result-screen";

export default function Page() {
  const { screen } = useGame();
  return (
    <main className="container max-w-md mx-auto h-screen">
      <MainScreen />
      {screen === "team" && <TeamSelection key="team" />}
      <ResultScreen />
    </main>
  );
}
